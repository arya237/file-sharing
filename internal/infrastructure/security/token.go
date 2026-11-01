package security

import (
	"errors"
	"time"

	"uuid"

	"github.com/golang-jwt/jwt/v5"
)

type JWTConfig struct {
	Secret string        `env:"SECRET"`
	Expire time.Duration `env:"EXPIRE"`
}

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

func (s *JWTTokenService) Validate(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return s.secret, nil
		},
	)

	if err != nil || !token.Valid {
		return uuid.Nil(), errors.New("invalid token")
	}

	sub, err := token.Claims.GetSubject()
	if err != nil {
		return uuid.Nil(), err
	}

	userID, err := uuid.Parse(sub)
	if err != nil {
		return uuid.Nil(), err
	}

	return userID, nil
}
