package postgres

import (
	"context"
	"errors"

	"github.com/arya237/file-sharing/internal/domain/user"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	const query = `
		INSERT INTO users (
			id,
			username,
			password_hash,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(
		ctx,
		query,
		u.ID,
		u.Username,
		u.PasswordHash,
		u.CreatedAt,
		u.UpdatedAt,
	)

	return err
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*user.User, error) {
	const query = `
		SELECT
			id,
			username,
			password_hash,
			created_at,
			updated_at
		FROM users
		WHERE username = $1
	`

	var u user.User

	err := r.db.QueryRow(ctx, query, username).Scan(
		&u.ID,
		&u.Username,
		&u.PasswordHash,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, user.ErrNotFound
	}

	if err != nil {
		return nil, err
	}

	return &u, nil
}
