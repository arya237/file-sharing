package share

import (
	"io"
	"time"
	"uuid"

	"github.com/arya237/file-sharing/internal/domain/file"
	"github.com/arya237/file-sharing/internal/domain/share"
)

type CreateShareInput struct {
	UserID    uuid.UUID
	FileID    uuid.UUID
	ExpiresAt *time.Time
}

type CreateShareOutput struct {
	Share *share.Share
	Token string
}

type AccessInput struct {
	Token string
}

type AccessOutput struct {
	Share  *share.Share
	File   *file.File
	Reader io.ReadCloser
}

type RevokeInput struct {
	UserID  uuid.UUID
	ShareID uuid.UUID
}
