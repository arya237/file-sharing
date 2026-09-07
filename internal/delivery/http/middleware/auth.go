package middleware

import (
	"net/http"
	"strings"

	"uuid"

	"github.com/gin-gonic/gin"
)

const UserIDKey = "userID"

type TokenValidator interface {
	Validate(token string) (uuid.UUID, error)
}

func Auth(tokenValidator TokenValidator) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("Authorization")
		if err != nil {
			unauthorized(c)
		}

		if token == "" {
			unauthorized(c)
			return
		}

		parts := strings.SplitN(token, " ", 2)

		if len(parts) != 2 ||
			!strings.EqualFold(parts[0], "Bearer") ||
			parts[1] == "" {
			unauthorized(c)
			return
		}

		userID, err := tokenValidator.Validate(parts[1])
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
