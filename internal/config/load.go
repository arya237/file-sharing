package config

import (
	"log"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

func New() *Config {
	var cfg Config

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found, using system environment")
	}

	if err := env.Parse(&cfg); err != nil {
		log.Fatal(err)
	}

	return &cfg
}
