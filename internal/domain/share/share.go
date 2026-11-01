package share

import (
	"time"
	"uuid"
)

type Share struct {
	ID        uuid.UUID
	FileID    uuid.UUID
	TokenHash string
	ExpiresAt *time.Time
	CreatedAt time.Time
	RevokedAt *time.Time
}

func (s Share) IsRevoked() bool {
	return s.RevokedAt != nil
}

func (s Share) IsExpired(now time.Time) bool {
	if s.ExpiresAt == nil {
		return false
	}

	return !now.Before(*s.ExpiresAt)
}

func (s Share) IsActive(now time.Time) bool {
	return !s.IsRevoked() && !s.IsExpired(now)
}

func (s *Share) Revoke(now time.Time) {
	if s.RevokedAt == nil {
		s.RevokedAt = &now
	}
}
