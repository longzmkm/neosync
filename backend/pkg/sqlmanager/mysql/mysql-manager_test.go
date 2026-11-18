package sqlmanager_mysql

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_EscapeMysqlColumns(t *testing.T) {
	require.Empty(t, EscapeMysqlColumns(nil))
	require.Equal(
		t,
		EscapeMysqlColumns([]string{"foo", "bar", "baz"}),
		[]string{"`foo`", "`bar`", "`baz`"},
	)
}

func Test_EscapeMysqlDefaultColumn(t *testing.T) {
	strType := columnDefaultString
	defType := columnDefaultDefault

	require.Empty(t, EscapeMysqlColumns(nil))

	actual, err := EscapeMysqlDefaultColumn("b'1'", &strType)
	require.NoError(t, err)
	require.Equal(t, "b'1'", actual)

	actual, err = EscapeMysqlDefaultColumn("0x41", &strType)
	require.NoError(t, err)
	require.Equal(t, "0x41", actual)

	actual, err = EscapeMysqlDefaultColumn("2", &strType)
	require.NoError(t, err)
	require.Equal(t, "'2'", actual)

	actual, err = EscapeMysqlDefaultColumn("it's", &strType)
	require.NoError(t, err)
	require.Equal(t, "'it''s'", actual)

	actual, err = EscapeMysqlDefaultColumn("CURRENT_TIMESTAMP", &strType)
	require.NoError(t, err)
	require.Equal(t, "CURRENT_TIMESTAMP", actual)

	actual, err = EscapeMysqlDefaultColumn("CURRENT_TIMESTAMP", &defType)
	require.NoError(t, err)
	require.Equal(t, "(CURRENT_TIMESTAMP)", actual)
}

func Test_WrapIdempotentIndex_MultiValuedCast(t *testing.T) {
	idx := &indexInfo{
		indexName: "idx_product_viewer",
		indexType: "BTREE",
		columns:   []string{"(cast(`product_viewer_id` as unsigned array))"},
	}
	stmt := wrapIdempotentIndex("lbp_center_test", "product_spu_address_book", idx)
	require.Contains(t, stmt, "PREPARE neosync_index_stmt FROM @neosync_index_sql")
	require.Contains(t, stmt, "cast(`product_viewer_id` as unsigned array)")
	require.NotContains(t, stmt, "IF index_exists = 0 THEN\n        ALTER TABLE")
}

func Test_WrapIdempotentIndex_Plain(t *testing.T) {
	idx := &indexInfo{
		indexName: "idx_plain",
		indexType: "BTREE",
		columns:   []string{"sku_id"},
	}
	stmt := wrapIdempotentIndex("s", "t", idx)
	require.NotContains(t, stmt, "PREPARE")
	require.Contains(t, stmt, "ADD INDEX `idx_plain` (`sku_id`)")
}

func Test_BuildMysqlTruncateStatement(t *testing.T) {
	actual, err := BuildMysqlTruncateStatement("public", "users")
	require.NoError(t, err)
	require.Equal(
		t,
		`TRUNCATE "public"."users";`,
		actual,
	)
}
