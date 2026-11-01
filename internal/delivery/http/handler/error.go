package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/arya237/file-sharing/internal/apperr"
)

func WriteError(c *gin.Context, err error) {
	log.Println(err)
	appErr, ok := apperr.As(err)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    apperr.ErrInternal,
				"message": "internal server error",
			},
		})
		return
	}

	c.JSON(appErr.Status, gin.H{
		"error": gin.H{
			"code":    appErr.Code,
			"message": appErr.Message,
		},
	})
}
