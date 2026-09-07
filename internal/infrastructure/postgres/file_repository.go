package postgres

import (
	"context"

	"uuid"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/arya237/file-sharing/internal/domain/file"
)

type FileRepository struct {
	db *pgxpool.Pool
}

func NewFileRepository(db *pgxpool.Pool) *FileRepository {
	return &FileRepository{
		db: db,
	}
}

func (r *FileRepository) Create(
	ctx context.Context,
	f *file.File,
) error {
	const query = `
		INSERT INTO files (
			id,
			owner_id,
			original_name,
			storage_key,
			mime_type,
			size,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.Exec(
		ctx,
		query,
		f.ID,
		f.OwnerID,
		f.Name,
		f.StorageKey,
		f.MIMEType,
		f.Size,
		f.CreatedAt,
		f.UpdatedAt,
	)

	return err
}

func (r *FileRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*file.File, error) {
	const query = `
		SELECT
			id,
			owner_id,
			original_name,
			storage_key,
			mime_type,
			size,
			created_at,
			updated_at
		FROM files
		WHERE id = $1
	`

	var f file.File

	err := r.db.QueryRow(ctx, query, id).Scan(
		&f.ID,
		&f.OwnerID,
		&f.Name,
		&f.StorageKey,
		&f.MIMEType,
		&f.Size,
		&f.CreatedAt,
		&f.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &f, nil
}

func (r *FileRepository) ListByOwner(
	ctx context.Context,
	ownerID uuid.UUID,
	offset int,
	limit int,
) ([]file.File, error) {
	const query = `
		SELECT
			id,
			owner_id,
			original_name,
			storage_key,
			mime_type,
			size,
			created_at,
			updated_at
		FROM files
		WHERE owner_id = $1
		ORDER BY created_at DESC
		OFFSET $2
		LIMIT $3
	`

	rows, err := r.db.Query(ctx, query, ownerID, offset, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	files := make([]file.File, 0)

	for rows.Next() {
		var f file.File

		if err := rows.Scan(
			&f.ID,
			&f.OwnerID,
			&f.Name,
			&f.StorageKey,
			&f.MIMEType,
			&f.Size,
			&f.CreatedAt,
			&f.UpdatedAt,
		); err != nil {
			return nil, err
		}

		files = append(files, f)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return files, nil
}

func (r *FileRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	const query = `
		DELETE FROM files
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, id)

	return err
}
