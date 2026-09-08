package local

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/arya237/file-sharing/internal/application/storage"
)

type Storage struct {
	basePath string
}

func NewStorage(basePath string) *Storage {
	return &Storage{
		basePath: basePath,
	}
}

func (s *Storage) filePath(key string) string {
	return filepath.Join(s.basePath, key)
}

func (s *Storage) Save(ctx context.Context, key string, reader io.Reader) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	if err := os.MkdirAll(s.basePath, 0755); err != nil {
		return fmt.Errorf("create files directory: %w", err)
	}

	file, err := os.Create(s.filePath(key))
	if err != nil {
		return fmt.Errorf("create files file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, reader); err != nil {
		os.Remove(s.filePath(key))
		return fmt.Errorf("write files file: %w", err)
	}
	return nil
}

func (s *Storage) Open(ctx context.Context, key string) (storage.ReadSeekCloser, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	file, err := os.Open(s.filePath(key))
	if err != nil {
		return nil, fmt.Errorf("open files file: %w", err)
	}

	return file, nil
}

func (s *Storage) Delete(ctx context.Context, key string) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	if err := os.Remove(s.filePath(key)); err != nil {
		return fmt.Errorf("delete files file: %w", err)
	}

	return nil
}
