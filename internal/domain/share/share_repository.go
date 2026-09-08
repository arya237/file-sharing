package share

import (
	"context"
	"errors"

	"uuid"
)

var ErrNotFound = errors.New("share not found")

type Repository interface {
	Create(ctx context.Context, share *Share) error
	FindByToken(ctx context.Context, tokenHash string) (*Share, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Share, error)
	Update(ctx context.Context, share *Share) error
	Delete(ctx context.Context, id uuid.UUID) error
}
