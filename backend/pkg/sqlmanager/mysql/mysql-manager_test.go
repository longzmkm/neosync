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

func Test_BuildMysqlTruncateStatement(t *testing.T) {
	actual, err := BuildMysqlTruncateStatement("public", "users")
	require.NoError(t, err)
	require.Equal(
		t,
		`TRUNCATE "public"."users";`,
		actual,
	)
}
