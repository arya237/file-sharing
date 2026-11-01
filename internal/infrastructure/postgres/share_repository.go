package postgres

import (
	"context"
	"errors"

	"uuid"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/arya237/file-sharing/internal/domain/share"
)

type ShareRepository struct {
	db *pgxpool.Pool
}

func NewShareRepository(db *pgxpool.Pool) *ShareRepository {
	return &ShareRepository{
		db: db,
	}
}

func (r *ShareRepository) Create(
	ctx context.Context,
	s *share.Share,
) error {
	const query = `
		INSERT INTO shares (
			id,
			file_id,
			token_hash,
			expires_at,
			created_at,
			revoked_at
		)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Exec(
		ctx,
		query,
		s.ID,
		s.FileID,
		s.TokenHash,
		s.ExpiresAt,
		s.CreatedAt,
		s.RevokedAt,
	)

	return err
}

func (r *ShareRepository) FindByToken(
	ctx context.Context,
	tokenHash string,
) (*share.Share, error) {
	const query = `
		SELECT
			id,
			file_id,
			token_hash,
			expires_at,
			created_at,
			revoked_at
		FROM shares
		WHERE token_hash = $1
	`

	var s share.Share

	err := r.db.QueryRow(
		ctx,
		query,
		tokenHash,
	).Scan(
		&s.ID,
		&s.FileID,
		&s.TokenHash,
		&s.ExpiresAt,
		&s.CreatedAt,
		&s.RevokedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, share.ErrNotFound
	}

	if err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *ShareRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*share.Share, error) {
	const query = `
		SELECT
			id,
			file_id,
			token_hash,
			expires_at,
			created_at,
			revoked_at
		FROM shares
		WHERE id = $1
	`

	var s share.Share

	err := r.db.QueryRow(
		ctx,
		query,
		id,
	).Scan(
		&s.ID,
		&s.FileID,
		&s.TokenHash,
		&s.ExpiresAt,
		&s.CreatedAt,
		&s.RevokedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, share.ErrNotFound
	}

	if err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *ShareRepository) Update(
	ctx context.Context,
	s *share.Share,
) error {
	const query = `
		UPDATE shares
		SET
			expires_at = $1,
			revoked_at = $2
		WHERE id = $3
	`

	tag, err := r.db.Exec(
		ctx,
		query,
		s.ExpiresAt,
		s.RevokedAt,
		s.ID,
	)

	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return share.ErrNotFound
	}

	return nil
}

func (r *ShareRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	const query = `
		DELETE FROM shares
		WHERE id = $1
	`

	tag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return share.ErrNotFound
	}

	return nil
}
