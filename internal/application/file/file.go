package file

import (
	"context"
	"io"
	"path/filepath"
	"strings"
	"time"
	"uuid"

	"github.com/arya237/file-sharing/internal/apperr"
	"github.com/arya237/file-sharing/internal/domain/file"
)

type Storage interface {
	Save(ctx context.Context, key string, reader io.Reader) error
	Open(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
}

type UseCase struct{
	fileRepo file.Repository
	storage Storage
}

func NewFileUseCase(repo file.Repository, storage Storage) *UseCase{
	return &UseCase{
		fileRepo: repo,
		storage: storage,
	}
}

func (u *UseCase) UploadFile(ctx context.Context, input UploadInput) (*UploadOutput, error){
	name := strings.TrimSpace(input.Name)

	if name == ""{
		return nil, apperr.InvalidInput("file_usecase", "file name is required", nil)
	}

	if input.OwnerID == uuid.Nil(){
		return nil, apperr.InvalidInput("file_usecase", "owner is required", nil)
	}

	if input.Reader == nil {
		return nil, apperr.InvalidInput(
			"file",
			"file content is required",
			nil,
		)
	}

	if input.Size <= 0 || input.Size > 1024 * 1024 * 100{
		return nil, apperr.InvalidInput(
			"file",
			"File size ranges from 1 B to 100 MB.",
			nil,
		)
	}

	now := time.Now().UTC()

	newFile := &file.File{
		ID: uuid.New(),
		OwnerID: input.OwnerID,
		Name: filepath.Base(name),
		StorageKey: uuid.New().String(),
		MIMEType: input.MIMEType,
		Size: input.Size,
		CreatedAt: now,
		UpdatedAt: now,
	}

	err := u.storage.Save(ctx, newFile.StorageKey, input.Reader)
	if err != nil{
		return nil, apperr.Dependency("file_usecase", "failed to store file", nil)
	}

	if err := u.fileRepo.Create(ctx, newFile); err != nil{
		return nil, apperr.Dependency("file_usecase", "failed to save file metadate", nil)
	}

	return &UploadOutput{
		File: newFile,
	}, nil

}

