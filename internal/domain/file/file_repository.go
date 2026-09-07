package file

import (
	"context"

	"uuid"
)

type Repository interface {
	Create(ctx context.Context, file *File) error
	FindByID(ctx context.Context, id uuid.UUID) (*File, error)
	ListByOwner(ctx context.Context, ownerID uuid.UUID, offset, limit int) ([]File, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
