package config

import (
	"github.com/arya237/file-sharing/internal/infrastructure/postgres"
	"github.com/arya237/file-sharing/internal/infrastructure/security"
)

type Config struct {
	DB  postgres.Config    `envPrefix:"POSTGRES_"`
	JWT security.JWTConfig `envPrefix:"JWT_"`
}
