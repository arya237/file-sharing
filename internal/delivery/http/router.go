package http

import (
	"github.com/arya237/file-sharing/internal/delivery/http/handler/auth"
	"github.com/gin-gonic/gin"
)

func NewRouter(auth_handler *auth.AuthHandler) *gin.Engine {
	router := gin.Default()

	api := router.Group("/api")

	authGroup := api.Group("/auth")

	authGroup.POST("/register", auth_handler.Register)
	authGroup.POST("/login", auth_handler.Loign)

	return router
}
