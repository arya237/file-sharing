package share

import (
	"time"
	"uuid"
)

type createShareRequest struct {
	ExpiresAt *time.Time `json:"expires_at"`
}

type createShareResponse struct {
	ID        uuid.UUID  `json:"id"`
	URL       string     `json:"url"`
	ExpiresAt *time.Time `json:"expires_at"`
}
