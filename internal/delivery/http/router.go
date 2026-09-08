package http

import (
	"github.com/arya237/file-sharing/internal/delivery/http/handler/auth"
	"github.com/arya237/file-sharing/internal/delivery/http/handler/file"
	"github.com/arya237/file-sharing/internal/delivery/http/handler/share"
	"github.com/arya237/file-sharing/internal/delivery/http/middleware"
	"github.com/gin-gonic/gin"
)

func NewRouter(
	auth_handler *auth.AuthHandler,
	file_handler *file.FileHandler,
	share_handler *share.ShareHandler,
	tokenValidator middleware.TokenValidator,
) *gin.Engine {
	router := gin.Default()

	api := router.Group("/api")

	authGroup := api.Group("/auth")
	fileGroup := api.Group("/files")
	shareGroup := api.Group("/share")

	authGroup.POST("/register", auth_handler.Register)
	authGroup.POST("/login", auth_handler.Loign)

	fileGroup.Use(middleware.Auth(tokenValidator))

	fileGroup.POST("", file_handler.UploadFile)
	fileGroup.GET("", file_handler.ListFiles)
	fileGroup.GET("/:id/download", file_handler.DownloadFile)
	fileGroup.DELETE("/:id", file_handler.DeleteFile)

	shareGroup.GET("/:token", share_handler.AccessShare)
	shareGroup.POST("/:id", middleware.Auth(tokenValidator), share_handler.Create)
	shareGroup.DELETE("/:id", middleware.Auth(tokenValidator), share_handler.RevokeShare)

	return router
}
