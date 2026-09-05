package security

import (
	"time"

	"uuid"

	"github.com/golang-jwt/jwt/v5"
)

type JWTTokenService struct {
	secret     []byte
	expiration time.Duration
}

func NewJWTTokenService(secret string, expiration time.Duration) *JWTTokenService {
	return &JWTTokenService{
		secret:     []byte(secret),
		expiration: expiration,
	}
}

func (s *JWTTokenService) Generate(userID uuid.UUID) (string, error) {
	now := time.Now()

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"iat": now.Unix(),
		"exp": now.Add(s.expiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.secret)
}
