package file

import (
	"time"
	"uuid"
)

type File struct {
	ID         uuid.UUID
	OwnerID    uuid.UUID
	Name       string
	StorageKey string
	MIMEType   string
	Size       int64
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
