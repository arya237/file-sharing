package auth

import (
	"context"
)

type AuthUseCase interface {
	RegisterUser(ctx context.Context, inputs RegisterUserInput) (string, error)
}
type authUseCase struct {
}

func NewAuthUseCase() AuthUseCase {

}
