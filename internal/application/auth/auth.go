package auth

import (
	"context"
	"time"
	"uuid"

	"github.com/arya237/file-sharing/internal/domain/user"
)

type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hash, password string) error
}

type TokenService interface {
	Generate(userID uuid.UUID) (string, error)
}

type UseCase struct {
	users          user.Repository
	passwordHasher PasswordHasher
	tokenService   TokenService
}

func NewUseCase(users user.Repository, passwordHasher PasswordHasher, tokenService TokenService) *UseCase {
	return &UseCase{
		users:          users,
		passwordHasher: passwordHasher,
		tokenService:   tokenService,
	}
}

func (u *UseCase) Register(ctx context.Context, input *RegisterInput) (*RegisterOutput, error) {
	passwordHash, err := u.passwordHasher.Hash(input.Password)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()

	newUser := &user.User{
		ID:           uuid.New(),
		Username:     input.Username,
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := u.users.Create(ctx, newUser); err != nil {
		return nil, err
	}

	return &RegisterOutput{
		UserID:   newUser.ID,
		Username: newUser.Username,
	}, nil
}
