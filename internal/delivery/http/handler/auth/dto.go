package auth

import "uuid"

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterResponse struct {
	Username string    `json:"username"`
	ID       uuid.UUID `json:"id"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Message   string `json:"message"`
	Token     string `json:"token"`
	TokenType string `json:"token_type"`
}
