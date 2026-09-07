package file

import (
	"net/http"
	"strconv"
	"uuid"

	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/application/file"
	"github.com/arya237/file-sharing/internal/delivery/http/handler"
	"github.com/arya237/file-sharing/internal/delivery/http/middleware"
	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	file *file.UseCase
}

func NewFileHandler(file *file.UseCase) *FileHandler {
	return &FileHandler{file: file}
}

func (h *FileHandler) UploadFile(c *gin.Context) {
	userID := getUserID(c)

	header, err := c.FormFile("file")
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "failed to open uploaded file", err))
		return
	}

	src, err := header.Open()
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "file is required", err))
		return
	}
	defer src.Close()

	output, err := h.file.UploadFile(c.Request.Context(), file.UploadInput{
		OwnerID:  userID,
		Name:     header.Filename,
		MIMEType: header.Header.Get("Content-Type"),
		Size:     header.Size,
		Reader:   src,
	})

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.JSON(http.StatusCreated, output.File)
}

func (h *FileHandler) ListFiles(c *gin.Context) {
	userID := getUserID(c)

	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "invalid offset", err))
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "invalid limit", err))
		return
	}

	output, err := h.file.ListFile(c.Request.Context(), file.ListInput{
		OwnerID: userID,
		Offset:  offset,
		Limit:   limit,
	})

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	c.JSON(http.StatusOK, output)
}

func (h *FileHandler) DownloadFile(c *gin.Context) {
	userID := getUserID(c)

	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "invalid file id", err))
		return
	}

	output, err := h.file.DownloadFile(c.Request.Context(), file.DownloadInput{
		FileID:  fileID,
		OwnerID: userID,
	},
	)

	if err != nil {
		handler.WriteError(c, err)
		return
	}

	defer output.Reader.Close()

	c.Header("Content-Disposition", `attachment; filename="`+output.File.Name+`"`)

	c.DataFromReader(
		http.StatusOK,
		output.File.Size,
		output.File.MIMEType,
		output.Reader,
		nil,
	)
}

func (h *FileHandler) DeleteFile(c *gin.Context) {
	userID := getUserID(c)

	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		handler.WriteError(c, apperr.InvalidInput("file_handler", "invalid file id", err))
		return
	}

	if err := h.file.DeleteFile(c.Request.Context(), fileID, userID); err != nil {
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
