package main

import (
	"context"
	"log"
	"time"
	"os/signal"
	"syscall"

	authService "github.com/arya237/file-sharing/internal/application/auth"
	fileService "github.com/arya237/file-sharing/internal/application/file"
	shareService "github.com/arya237/file-sharing/internal/application/share"
	"github.com/arya237/file-sharing/internal/delivery/http/handler/share"
	"github.com/arya237/file-sharing/internal/infrastructure/storage/local"

	"github.com/arya237/file-sharing/internal/config"
	"github.com/arya237/file-sharing/internal/delivery/http"
	auth "github.com/arya237/file-sharing/internal/delivery/http/handler/auth"
	file "github.com/arya237/file-sharing/internal/delivery/http/handler/file"
	"github.com/arya237/file-sharing/internal/infrastructure/postgres"
	"github.com/arya237/file-sharing/internal/infrastructure/security"
)

func main() {
	
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	cfg := config.New()

	db, err := postgres.NewPool(ctx, cfg.DB)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	passwordHasher := security.NewBcryptPasswordHasher(0)
	tokenService := security.NewJWTTokenService(cfg.JWT.Secret, cfg.JWT.Expire)

	userRepo := postgres.NewUserRepository(db)
	fileRepo := postgres.NewFileRepository(db)
	shareRepo := postgres.NewShareRepository(db)
	storageRepo := local.NewStorage(cfg.Filepath)

	authUsecase := authService.NewUseCase(userRepo, passwordHasher, tokenService)
	fileUsecase := fileService.NewFileUseCase(fileRepo, storageRepo)
	shareUsecase := shareService.NewShareUseCase(shareRepo, fileRepo, storageRepo)

	authHandler := auth.NewAuthHandler(authUsecase)
	fileHandler := file.NewFileHandler(fileUsecase)
	shareHandler := share.NewShareHandler(shareUsecase)

	router := http.NewRouter(authHandler, fileHandler, shareHandler, tokenService)

	server := http.NewServer(cfg.Server.Address, router, 10 * time.Second)

	server.Run(ctx)
}
