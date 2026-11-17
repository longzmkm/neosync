# Neosync 自建部署手册（中文）

本仓库在 upstream 基础上做了三类定制，换机器部署时必须按本文档操作，否则会踩到相同的问题：

| 定制 | 说明 | 影响 |
| --- | --- | --- |
| compose / Keycloak 修复 | Keycloak 锁定 26.8.2，`KC_HOSTNAME` + backchannel、client secret、启动顺序、schedule 脚本参数 | `compose.yml` / `compose.auth.yml` |
| PostgreSQL 11 兼容 | 库结构查询不再依赖 `attgenerated`、`pg_partition_tree`、PG15 的 GROUP BY 行为 | **api 和 worker 镜像必须本地构建** |
| 前端中文 i18n | 默认 `zh-CN`，顶部地球图标可切英文 | **app 镜像必须本地构建** |

## 1. 前置条件

- Docker Desktop（含 `docker compose` v2）
- Git，并且本机 SSH key 已添加到 GitHub（`ssh -T git@github.com` 能返回你的用户名）
- 空闲端口：`3000` 3000/app、`5432` 5432/db、`5434`/`5435` 测试库、`8080` api、`8083` Keycloak、`8233` Temporal UI、`7233` Temporal、`6379` Redis
- 建议内存 ≥ 8 GB（Temporal + Elasticsearch + Keycloak 一起跑）

## 2. 克隆代码

```sh
git clone git@github.com:longzmkm/neosync.git
cd neosync
git log --oneline -5
```

应能看到这三个提交：

```
bf3a8557c feat(web): add zh-CN i18n foundation and translate core screens
837daf793 fix(backend): support postgres 11 introspection queries
be90b74fa fix(compose): correct keycloak auth config and startup ordering
```

## 3. 构建镜像（必须先构建，再启动）

```sh
docker build -f docker/Dockerfile.backend  -t ghcr.io/nucleuscloud/neosync/api:pg11-fix .
docker build -f docker/Dockerfile.worker   -t ghcr.io/nucleuscloud/neosync/worker:pg11-fix .
docker build -f docker/Dockerfile.frontend -t ghcr.io/nucleuscloud/neosync/app:zh ./frontend
```

注意前端构建上下文是 `./frontend`（Dockerfile 里会 `COPY turbo.json`，用仓库根目录会报 `"/turbo.json": not found`）。

然后覆盖本地 `latest` 标签，让 compose 使用本地构建的版本：

```sh
docker tag ghcr.io/nucleuscloud/neosync/api:pg11-fix    ghcr.io/nucleuscloud/neosync/api:latest
docker tag ghcr.io/nucleuscloud/neosync/worker:pg11-fix ghcr.io/nucleuscloud/neosync/worker:latest
docker tag ghcr.io/nucleuscloud/neosync/app:zh          ghcr.io/nucleuscloud/neosync/app:latest
```

首次构建大约 10 分钟（要下载 npm / go 依赖）。

## 4. 启动整套服务

```sh
docker compose -f compose.yml -f compose.auth.yml up -d
```

> 不要用 `make compose/auth/up`：它会先执行 `docker compose pull`，把本地构建的 `latest` 覆盖成官方镜像，PG11 补丁和中文界面都会消失。

首次启动顺序：db → temporal → keycloak → api → app，大约 1 分钟。

## 5. 启动检查

```sh
docker compose -f compose.yml -f compose.auth.yml ps
docker logs --tail 20 neosync-api
```

期望结果：

- `neosync-db`、`temporal`、`neosync-auth-keycloak` 都是 `healthy`
- `neosync-api` 日志出现 `listening on 0.0.0.0:8080`
- `neosync-temporal-seed`、`neosync-api-seed` 退出码为 0

验证 Keycloak：

```sh
curl -s http://localhost:8083/realms/neosync/.well-known/openid-configuration | head -c 300
```

`issuer` 应该是 `http://localhost:8083/realms/neosync`。

## 6. 登录与账号

- 应用地址：<http://localhost:3000>
- realm 里没有预置普通用户，首次请点登录页的 **Register** 自行注册
- realm 开启了 `registrationEmailAsUsername`，**用户名必须填邮箱格式**
- Keycloak 管理控制台：<http://localhost:8083/admin>，账号 `admin` / `change_me`（master realm）

如果访问管理控制台提示 `HTTPS required`（全新机器上 master realm 默认 `sslRequired=external`），在容器网络内执行一次：

```sh
docker exec -i neosync-app node --input-type=module -e '
const b = "http://keycloak:8080";
const t = await (await fetch(b + "/realms/master/protocol/openid-connect/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: "admin-cli", username: "admin", password: "change_me", grant_type: "password",
  }),
})).json();
const h = { Authorization: "Bearer " + t.access_token, "Content-Type": "application/json" };
const r = await (await fetch(b + "/admin/realms/master", { headers: h })).json();
r.sslRequired = "none";
console.log("update master realm:", (await fetch(b + "/admin/realms/master", {
  method: "PUT", headers: h, body: JSON.stringify(r),
})).status);
'
```

## 7. 配置 worker 的 API Key（auth 模式必做）

`AUTH_ENABLED=true` 时 API 会校验所有请求，worker 默认没有凭据，任务会报
`unauthenticated: must provide valid bearer token`。

1. 登录应用 → Settings → API Keys → New API Key，名称如 `worker-local`，有效期最长 1 年
2. 复制明文 key（只展示一次），写入仓库根目录的 `.env.worker.local`（该文件已 gitignore）：

```sh
printf 'NEOSYNC_API_KEY=%s\n' 'neo_at_v1_xxxxxxxx' > .env.worker.local
docker compose -f compose.yml -f compose.auth.yml up -d --no-deps worker
```

3. 确认注入成功：

```sh
docker inspect neosync-worker --format '{{range .Config.Env}}{{if eq (printf "%.15s" .) "NEOSYNC_API_KEY"}}present{{end}}{{end}}'
```

> API key 由数据库哈希校验，换机器/重建数据卷后需要重新生成，旧 key 不会生效。

## 8. 中文界面

- 默认语言已是简体中文（`frontend/apps/web/libs/i18n/index.ts` 的 `DEFAULT_LOCALE`）
- 顶栏地球图标可切换 English / 简体中文，选择写入 `NEOSYNC_LOCALE` cookie
- 新增文案：在 `frontend/apps/web/libs/i18n/messages.ts` 里给 en / zh-CN 各加一个 key，组件里用 `useI18n()` 的 `t('key')`
- 目前覆盖：顶栏导航、用户菜单、帮助面板、Jobs / Connections 列表页与表格列头、作业状态/类型。其余页面按同样方式增量补

## 9. 常用运维

```sh
# 查看日志
docker logs -f neosync-api
docker logs -f neosync-worker

# 改了代码后重新构建并滚动更新
docker build -f docker/Dockerfile.backend -t ghcr.io/nucleuscloud/neosync/api:latest .
docker compose -f compose.yml -f compose.auth.yml up -d --no-deps api

# 停止
docker compose -f compose.yml -f compose.auth.yml down

# 清空所有数据（含 Keycloak realm、seed 数据、Temporal 数据）
docker compose -f compose.yml -f compose.auth.yml down -v
```

`down -v` 之后再次 `up` 会重新导入 Keycloak realm，并重新执行 seed 脚本。

## 10. 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `unauthenticated: must provide valid bearer token` | worker 没有 API key | 按第 7 节配置 `.env.worker.local` 并重启 worker |
| `column a.attgenerated does not exist` | api / worker 还是官方镜像 | 重新构建两个镜像并覆盖 `latest` |
| `column "constraint_def.condeferrable" must appear in the GROUP BY` | 同上（旧 worker 镜像） | 同上 |
| 登录页一直回到登录页 / `pkceCodeVerifier could not be parsed` | 浏览器残留旧 cookie | 清掉 `localhost` 的 `authjs.*` cookie，或用无痕窗口 |
| 登录提示 `user_not_found` | 用了 `admin` 这类非邮箱用户名 | 用邮箱格式账号，或点 Register |
| Keycloak 页面 `HTTPS required` | realm 的 `sslRequired=external` | 开发环境按第 6 节改成 `none` |
| `database "xxx" does not exist` | 连接配置的库名错误 | 编辑连接，确认 host/port/database/user/pass |
| 修改文案后界面没变 | 用的是已构建的镜像 | 重新构建 app 镜像并 `up -d --no-deps app` |

## 11. 目标数据库版本

- 已针对 PostgreSQL 11 做过兼容，本地构建的 api / worker 可以直接连 PG 11.7
- 若目标库是 PG 12+，官方镜像也可以使用；但中文界面仍需本地构建 app
- MySQL / MSSQL / MongoDB / DynamoDB 的 compose 文件在 `compose/` 下有示例，默认未启用
