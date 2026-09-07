package user

import (
	"context"
	"errors"
)

var ErrNotFound = errors.New("user not found")
var ErrConflict = errors.New("user already exists")

type Repository interface {
	Create(ctx context.Context, user *User) error
	FindByUsername(ctx context.Context, username string) (*User, error)
}
