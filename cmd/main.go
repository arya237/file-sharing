package main

import (
	"context"
	"log"

	authService "github.com/arya237/file-sharing/internal/application/auth"
	"github.com/arya237/file-sharing/internal/config"
	"github.com/arya237/file-sharing/internal/delivery/http"
	auth "github.com/arya237/file-sharing/internal/delivery/http/handler/auth"
	"github.com/arya237/file-sharing/internal/infrastructure/postgres"
	"github.com/arya237/file-sharing/internal/infrastructure/security"
)

func main() {
	ctx := context.Background()
	cfg := config.New()

	db, err := postgres.NewPool(ctx, cfg.DB)
	if err != nil {
		log.Fatal(err)
	}

	passwordHasher := security.NewBcryptPasswordHasher(0)
	tokenService := security.NewJWTTokenService(cfg.JWT.Secret, cfg.JWT.Expire)

	userRepo := postgres.NewUserRepository(db)
	authUsecase := authService.NewUseCase(userRepo, passwordHasher, tokenService)
	authHandler := auth.NewAuthHandler(authUsecase)

	router := http.NewRouter(authHandler)

	log.Fatal(router.Run(":8080"))

}
