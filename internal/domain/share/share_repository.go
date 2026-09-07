package share

import (
	"context"

	"uuid"
)

type Repository interface {
	Create(ctx context.Context, share *Share) error
	FindByTokenHash(ctx context.Context, tokenHash string) (*Share, error)
	ListByFile(ctx context.Context, fileID uuid.UUID) ([]Share, error)
	Update(ctx context.Context, share *Share) error
}
