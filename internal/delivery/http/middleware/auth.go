package middleware

import (
	"net/http"
	"uuid"

	"github.com/gin-gonic/gin"
)

const UserIDKey = "userID"

type TokenValidator interface {
	Validate(token string) (uuid.UUID, error)
}

func Auth(tokenValidator TokenValidator) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("access_token")
		if err != nil {
			unauthorized(c)
			return
		}

		if token == "" {
			unauthorized(c)
			return
		}

		userID, err := tokenValidator.Validate(token)
		if err != nil {
			unauthorized(c)
			return
		}

		c.Set(UserIDKey, userID)

		c.Next()
	}
}

func unauthorized(c *gin.Context) {
	c.AbortWithStatusJSON(
		http.StatusUnauthorized,
		gin.H{
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "unauthorized",
			},
		},
	)
}
