package file

import(
	"uuid"
	"io"
	"github.com/arya237/file-sharing/internal/domain/file"
)

type UploadInput struct {
	OwnerID  uuid.UUID
	Name     string
	MIMEType string
	Size     int64
	Reader   io.Reader
}


type UploadOutput struct {
	File *file.File
}

type ListInput struct {
	OwnerID uuid.UUID
	Offset  int
	Limit   int
}

type ListOutput struct {
	Files []file.File
}