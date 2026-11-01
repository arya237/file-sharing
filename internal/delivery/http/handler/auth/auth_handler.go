package auth

import (
	"net/http"
	"time"

	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/application/auth"
	"github.com/arya237/file-sharing/internal/delivery/http/handler"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	auth *auth.UseCase
}

func NewAuthHandler(auth *auth.UseCase) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handler.WriteError(c, apperr.InvalidInput("auth_handler", "invalid request body", err))
		return
	}

	output, err := h.auth.Register(c.Request.Context(), &auth.RegisterInput{
		Username: req.Username,
		Password: req.Password,
	})

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.JSON(http.StatusCreated, RegisterResponse{
		Username: output.Username,
		ID:       output.UserID,
	})
}

func (h *AuthHandler) Loign(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handler.WriteError(c, apperr.InvalidInput("auth_handler", "invalid request body", err))
		return
	}

	output, err := h.auth.Login(c.Request.Context(), &auth.LoginInput{
		Username: req.Username,
		Password: req.Password,
	})

	if err != nil {
		handler.WriteError(c, err)
	}

	c.SetCookie(
		"access_token",
		output.AccessToken,
		int(12*time.Hour),
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, LoginResponse{
		Message: "login was successful",
		UserID:  output.UserID,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", true, true)
	c.Status(http.StatusNoContent)
}
