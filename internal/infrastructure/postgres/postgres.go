package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	Host     string `env:"HOST"`
	Port     string `env:"PORT"`
	User     string `env:"USER"`
	Password string `env:"PASSWORD"`
	DBName   string `env:"NAME"`
	SSLMode  string `env:"SSLMODE"`
}

func NewPool(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
	databaseURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.User,
		cfg.Password,
		//cfg.Host,
		cfg.Port,
		cfg.DBName,
		cfg.SSLMode,
	)

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}
