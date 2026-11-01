package storage

import (
	"context"
	"io"
)

type ReadSeekCloser interface {
	io.Reader
	io.Seeker
	io.Closer
}

type Storage interface {
	Save(ctx context.Context, key string, reader io.Reader) error
	Open(ctx context.Context, key string) (ReadSeekCloser, error)
	Delete(ctx context.Context, key string) error
}
