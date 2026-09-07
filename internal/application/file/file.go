package file

import (
	"context"
	"io"
	"path/filepath"
	"strings"
	"time"
	"uuid"
	"errors"
	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/domain/file"
)

type Storage interface {
	Save(ctx context.Context, key string, reader io.Reader) error
	Open(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
}

type UseCase struct {
	fileRepo file.Repository
	storage  Storage
}

func NewFileUseCase(repo file.Repository, storage Storage) *UseCase {
	return &UseCase{
		fileRepo: repo,
		storage:  storage,
	}
}

func (u *UseCase) UploadFile(ctx context.Context, input UploadInput) (*UploadOutput, error) {
	name := strings.TrimSpace(input.Name)

	if name == "" {
		return nil, apperr.InvalidInput("file_usecase", "file name is required", nil)
	}

	if input.OwnerID == uuid.Nil() {
		return nil, apperr.InvalidInput("file_usecase", "owner is required", nil)
	}

	if input.Reader == nil {
		return nil, apperr.InvalidInput(
			"file",
			"file content is required",
			nil,
		)
	}

	if input.Size <= 0 || input.Size > 1024*1024*100 {
		return nil, apperr.InvalidInput(
			"file",
			"File size ranges from 1 B to 100 MB.",
			nil,
		)
	}

	now := time.Now().UTC()

	newFile := &file.File{
		ID:         uuid.New(),
		OwnerID:    input.OwnerID,
		Name:       filepath.Base(name),
		StorageKey: uuid.New().String(),
		MIMEType:   input.MIMEType,
		Size:       input.Size,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	err := u.storage.Save(ctx, newFile.StorageKey, input.Reader)
	if err != nil {
		return nil, apperr.Dependency("file_usecase", "failed to store file", nil)
	}

	if err := u.fileRepo.Create(ctx, newFile); err != nil {
		return nil, apperr.Dependency("file_usecase", "failed to save file metadate", nil)
	}

	return &UploadOutput{File: newFile,}, nil

}

func (u *UseCase) ListFile(ctx context.Context, input ListInput) (*ListOutput, error) {
	if input.OwnerID == uuid.Nil() {
		return nil, apperr.InvalidInput("file_usecase", "owner is required", nil)
	}

	if input.Offset < 0 {
		return nil, apperr.InvalidInput("file_usecase", "offset must be greater than or equal to zero", nil)
	}

	if input.Limit <= 0 {
		return nil, apperr.InvalidInput("file_usecase", "limit must be greater than zero", nil)
	}

	files, err := u.fileRepo.ListByOwner(ctx, input.OwnerID, input.Offset, input.Limit)
	if err != nil {
		return nil, apperr.Dependency("file_usecase", "failed to list files", err)
	}

	return &ListOutput{Files: files}, nil
}

func (u *UseCase) DownloadFile(ctx context.Context, input DownloadInput) (*DownloadOutput, error){

	if input.FileID == uuid.Nil() {
		return nil, apperr.InvalidInput("file_usecase", "file id is required", nil)
	}

	if input.OwnerID == uuid.Nil() {
		return nil, apperr.InvalidInput("file_usecase", "owner is required", nil)
	}

	f, err := u.fileRepo.FindByID(ctx, input.FileID)
	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			return nil, apperr.NotFound("file_usecase", "file not found", err)
		}

		return nil, apperr.Dependency("file_usecase", "failed to find file", err)
	}

	if f.OwnerID != input.OwnerID {
		return nil, apperr.Forbidden("file_usecase", "you do not have access to this file", nil)
	}

	reader, err := u.storage.Open(ctx, f.StorageKey)
	if err != nil {
		return nil, apperr.Dependency("file_usecase", "failed to open file", err)
	}

	return &DownloadOutput{File:   f, Reader: reader}, nil
}

func (u *UseCase) DeleteFile(ctx context.Context, fileID uuid.UUID, ownerID uuid.UUID) error {
	if fileID == uuid.Nil() {
		return apperr.InvalidInput("file", "file id is required", nil)
	}

	if ownerID == uuid.Nil() {
		return apperr.InvalidInput("file", "owner is required", nil)
	}

	f, err := u.fileRepo.FindByID(ctx, fileID)
	if err != nil {
		if errors.Is(err, file.ErrNotFound) {
			return apperr.NotFound("file", "file not found", err)
		}

		return apperr.Dependency("file", "failed to find file", err)
	}

	if f.OwnerID != ownerID {
		return apperr.Forbidden("file", "you do not have access to this file", nil)
	}

	if err := u.storage.Delete(ctx, f.StorageKey); err != nil {
		return apperr.Dependency("file", "failed to delete file from storage", err)
	}

	if err := u.fileRepo.Delete(ctx, fileID); err != nil {
		return apperr.Dependency("file", "failed to delete file metadata", err)
	}

	return nil
}
