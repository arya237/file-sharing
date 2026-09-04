package postgres

import (
	"context"

	"uuid"

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

func (r *ShareRepository) FindByTokenHash(
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

	err := r.db.QueryRow(ctx, query, tokenHash).Scan(
		&s.ID,
		&s.FileID,
		&s.TokenHash,
		&s.ExpiresAt,
		&s.CreatedAt,
		&s.RevokedAt,
	)

	if err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *ShareRepository) ListByFile(
	ctx context.Context,
	fileID uuid.UUID,
) ([]share.Share, error) {
	const query = `
		SELECT
			id,
			file_id,
			token_hash,
			expires_at,
			created_at,
			revoked_at
		FROM shares
		WHERE file_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, fileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	shares := make([]share.Share, 0)

	for rows.Next() {
		var s share.Share

		if err := rows.Scan(
			&s.ID,
			&s.FileID,
			&s.TokenHash,
			&s.ExpiresAt,
			&s.CreatedAt,
			&s.RevokedAt,
		); err != nil {
			return nil, err
		}

		shares = append(shares, s)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return shares, nil
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

	_, err := r.db.Exec(
		ctx,
		query,
		s.ExpiresAt,
		s.RevokedAt,
		s.ID,
	)

	return err
}
