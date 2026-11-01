package auth

import "uuid"

type RegisterInput struct {
	Username string
	Password string
}

type RegisterOutput struct {
	UserID   uuid.UUID
	Username string
}

type LoginInput struct {
	Username string
	Password string
}

type LoginOutput struct {
	AccessToken string
	UserID      uuid.UUID
}
