CREATE TABLE shares (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    CONSTRAINT fk_shares_file
        FOREIGN KEY (file_id)
            REFERENCES files(id)
            ON DELETE CASCADE
);

CREATE INDEX idx_shares_file_id
    ON shares (file_id);