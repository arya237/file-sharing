package auth

import (
	"context"

	"github.com/arya237/file-sharing/internal/domain/user"
)

type UserRepository interface {
	Create(ctx context.Context, user *user.User) error
	FindByUsername(ctx context.Context, username string) (*user.User, error)
}

type AuthUseCase interface {
	RegisterUser(ctx context.Context, inputs RegisterUserInput) (string, error)
}
type authUseCase struct {
	repo UserRepository
}

func NewAuthUseCase() AuthUseCase {

}

func (s *authUseCase) RegisterUser(ctx context.Context, input RegisterUserInput) error {
	user, err := s.repo.FindByUsername(ctx, input.Username)
}
