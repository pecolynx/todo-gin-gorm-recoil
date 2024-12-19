package main

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/go-sql-driver/mysql"
	slog_gorm "github.com/orandin/slog-gorm"
	gorm_mysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func OpenMySQL(username, password, host string, port int, database string, logger *slog.Logger) (*gorm.DB, error) {
	c := mysql.Config{
		DBName:               database,
		User:                 username,
		Passwd:               password,
		Addr:                 fmt.Sprintf("%s:%d", host, port),
		Net:                  "tcp",
		ParseTime:            true,
		MultiStatements:      true,
		Params:               map[string]string{"charset": "utf8mb4"},
		Collation:            "utf8mb4_bin",
		AllowNativePasswords: true,
		Loc:                  time.UTC,
	}
	dsn := c.FormatDSN()
	return gorm.Open(gorm_mysql.Open(dsn), &gorm.Config{
		Logger: slog_gorm.New(
			slog_gorm.WithHandler(logger.Handler()),
			slog_gorm.WithTraceAll(), // trace all messages
		),
	})
}
