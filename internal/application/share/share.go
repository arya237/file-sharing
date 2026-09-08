package share

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"time"
	"uuid"

	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/domain/file"
	"github.com/arya237/file-sharing/internal/domain/share"
	local "github.com/arya237/file-sharing/internal/infrastructure/storage"
)

type UseCase struct {
	shareRepo share.Repository
	fileRepo  file.Repository
	storage   local.Storage
}

func NewShareUseCase(shareRepo share.Repository, fileRepo file.Repository, storage local.Storage) *UseCase {
	return &UseCase{
		shareRepo: shareRepo,
		fileRepo:  fileRepo,
		storage:   storage,
	}
}

func (u *UseCase) CreateShareLink(ctx context.Context, input CreateShareInput) (*CreateShareOutput, error) {
	if input.UserID == uuid.Nil() {
		return nil, apperr.InvalidInput("share_usecase", "user id is required", nil)
	}

	if input.FileID == uuid.Nil() {
		return nil, apperr.InvalidInput("share_usecase", "file id is required", nil)
	}

	existFile, err := u.fileRepo.FindByID(ctx, input.FileID)
	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			return nil, apperr.NotFound("share_usecase", "file not found", err)
		}
		return nil, apperr.Dependency("share_usecase", "failed to find file", err)
	}

	if input.UserID != existFile.OwnerID {
		return nil, apperr.Forbidden("share_usecase", "you do not have access to this file", nil)
	}

	if input.ExpiresAt != nil && !input.ExpiresAt.After(time.Now()) {
		return nil, apperr.InvalidInput("share_usecase", "expiration must be in the future", nil)
	}

	token, err := generateToken()
	if err != nil {
		return nil, apperr.Internal("share_usecase", err)
	}

	now := time.Now().UTC()

	newShare := &share.Share{
		ID:        uuid.New(),
		FileID:    input.FileID,
		TokenHash: hashToken(token),
		ExpiresAt: input.ExpiresAt,
		CreatedAt: now,
	}

	if err := u.shareRepo.Create(ctx, newShare); err != nil {
		return nil, apperr.Dependency("share_usecase", "failed to create share", err)
	}

	return &CreateShareOutput{Share: newShare, Token: token}, nil
}

func (u *UseCase) AccessShare(ctx context.Context, input AccessInput) (*AccessOutput, error) {
	if input.Token == "" {
		return nil, apperr.InvalidInput("share_usecase", "share token is required", nil)
	}

	tokenHash := hashToken(input.Token)

	s, err := u.shareRepo.FindByToken(ctx, tokenHash)

	if err != nil {
		if errors.Is(err, share.ErrNotFound) {
			return nil, apperr.NotFound("share_usecase", "share not found", err)
		}

		return nil, apperr.Dependency("share_usecase", "failed to find share", err)
	}

	now := time.Now().UTC()

	if !s.IsActive(now) {
		return nil, apperr.NotFound("share_usecase", "share is no longer available", nil)
	}

	f, err := u.fileRepo.FindByID(ctx, s.FileID)
	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			return nil, apperr.NotFound("share_usecase", "file not found", err)
		}

		return nil, apperr.Dependency("share_usecase", "failed to find file", err)
	}

	reader, err := u.storage.Open(ctx, f.StorageKey)
	if err != nil {
		return nil, apperr.Dependency("share_usecase", "failed to open file", err)
	}

	return &AccessOutput{Share: s, File: f, Reader: reader}, nil
}

func (u *UseCase) RevokeShare(ctx context.Context, input RevokeInput) error {
	if input.UserID == uuid.Nil() {
		return apperr.InvalidInput("share_usecase", "user id is required", nil)
	}

	if input.ShareID == uuid.Nil() {
		return apperr.InvalidInput("share_usecase", "share id is required", nil)
	}

	s, err := u.shareRepo.FindByID(ctx, input.ShareID)
	if err != nil {
		if errors.Is(err, share.ErrNotFound) {
			return apperr.NotFound("share_usecase", "share not found", err)
		}

		return apperr.Dependency("share_usecase", "failed to find share", err)
	}

	f, err := u.fileRepo.FindByID(ctx, s.FileID)

	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			return apperr.NotFound("share_usecase", "file not found", err)
		}

		return apperr.Dependency("share_usecase", "failed to find file", err)
	}

	if f.OwnerID != input.UserID {
		return apperr.Forbidden("share_usecase", "you do not have access to this share", nil)
	}

	if s.IsRevoked() {
		return nil
	}

	s.Revoke(time.Now().UTC())

	if err := u.shareRepo.Update(ctx, s); err != nil {
		return apperr.Dependency("share_usecase", "failed to revoke share", err)
	}

	return nil
}

func generateToken() (string, error) {
	const tokenSize = 32

	data := make([]byte, tokenSize)

	if _, err := rand.Read(data); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(data), nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return base64.RawURLEncoding.EncodeToString(hash[:])
}
