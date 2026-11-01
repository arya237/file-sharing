package auth

import (
	"context"
	"errors"
	"strings"
	"time"
	"uuid"

	"github.com/arya237/file-sharing/internal/apperr"
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
	username := strings.TrimSpace(input.Username)

	if username == "" {
		return nil, apperr.InvalidInput("auth_usecase", "username is required", nil)
	}

	if input.Password == "" {
		return nil, apperr.InvalidInput("auth_usecase", "password is required", nil)
	}

	passwordHash, err := u.passwordHasher.Hash(input.Password)
	if err != nil {
		return nil, apperr.Dependency("auth_usecase", "failed to hash password", err)
	}

	now := time.Now().UTC()

	newUser := &user.User{
		ID:           uuid.New(),
		Username:     username,
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := u.users.Create(ctx, newUser); err != nil {
		if errors.Is(err, user.ErrConflict) {
			return nil, apperr.Conflict("auth_usecase", "username already exists", err)
		}

		return nil, apperr.Dependency("auth_usecase", "failed to create user", err)
	}

	return &RegisterOutput{UserID: newUser.ID, Username: newUser.Username}, nil
}

func (u *UseCase) Login(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	username := strings.TrimSpace(input.Username)

	if username == "" || input.Password == "" {
		return nil, apperr.InvalidInput("auth_usecase", "username or password is required", nil)
	}

	existingUser, err := u.users.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, user.ErrNotFound) {
			return nil, apperr.Unauthorized("auth_usecase", "invalid username or password", nil)
		}
		return nil, apperr.Dependency("auth_usecase", "failed to find user", err)
	}

	if err := u.passwordHasher.Compare(existingUser.PasswordHash, input.Password); err != nil {
		return nil, apperr.Unauthorized("auth_usecase", "invalid username or password", nil)
	}

	token, err := u.tokenService.Generate(existingUser.ID)
	if err != nil {
		return nil, apperr.Dependency(
			"auth",
			"failed to generate access token",
			err,
		)
	}

	return &LoginOutput{AccessToken: token, UserID: existingUser.ID}, nil
}
