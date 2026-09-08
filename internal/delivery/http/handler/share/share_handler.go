package share

import (
	"fmt"
	"net/http"
	"strconv"
	"uuid"

	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/application/share"
	"github.com/arya237/file-sharing/internal/delivery/http/handler"
	"github.com/arya237/file-sharing/internal/delivery/http/middleware"
	"github.com/gin-gonic/gin"
)

type ShareHandler struct {
	share *share.UseCase
}

func NewShareHandler(share *share.UseCase) *ShareHandler {
	return &ShareHandler{
		share: share,
	}
}

func (h *ShareHandler) Create(c *gin.Context) {
	userID := getUserID(c)

	if userID == uuid.Nil() {
		handler.WriteError(c, apperr.Unauthorized("share_handler", "user not authenticated", nil))
		return
	}

	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("share_handler", "invalid file id", err))
		return
	}

	var req createShareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handler.WriteError(c, apperr.InvalidInput("share_handler", "invalid request body", err))
		return
	}

	result, err := h.share.CreateShareLink(c.Request.Context(), share.CreateShareInput{
		FileID:    fileID,
		UserID:    userID,
		ExpiresAt: req.ExpiresAt,
	})

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.JSON(http.StatusCreated, createShareResponse{
		ID:        result.Share.ID,
		URL:       "/api/shares/" + result.Token,
		ExpiresAt: result.Share.ExpiresAt,
	})
}

func (h *ShareHandler) AccessShare(c *gin.Context) {
	token := c.Param("token")

	if token == "" {
		handler.WriteError(c, apperr.NotFound("share_handler", "share not found", nil))
		return
	}

	// TODO check result io.ReadSeeker or io.ReadCloser
	result, err := h.share.AccessShare(c.Request.Context(), share.AccessInput{
		Token: token,
	})
	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.Header(
		"Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s"`, result.File.Name),
	)
	c.Header("Content-Type", result.File.MIMEType)
	c.Header("Content-Length", strconv.FormatInt(result.File.Size, 10))

	http.ServeContent(
		c.Writer,
		c.Request,
		result.File.Name,
		result.File.CreatedAt,
		result.Reader,
	)

	//result.Reader.Close()
}

func (h *ShareHandler) RevokeShare(c *gin.Context) {
	userID := getUserID(c)
	if userID == uuid.Nil() {
		handler.WriteError(c, apperr.Unauthorized("share_handler", "user not authenticated", nil))
		return
	}

	shareID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.Error(apperr.InvalidInput("share_handler", "invalid share id", err))
		return
	}

	err = h.share.RevokeShare(c.Request.Context(), share.RevokeInput{
		UserID:  userID,
		ShareID: shareID,
	})

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func getUserID(c *gin.Context) uuid.UUID {
	value, exists := c.Get(middleware.UserIDKey)
	if !exists {
		return uuid.Nil()
	}

	userID, ok := value.(uuid.UUID)
	if !ok {
		return uuid.Nil()
	}

	return userID
}
