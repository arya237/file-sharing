export interface FileRecord {
  ID: string;
  OwnerID: string;
  Name: string;
  StorageKey: string;
  MIMEType: string;
  Size: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ListFilesResponse {
  Files: FileRecord[];
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  username: string;
  id: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userID: string;
}

export interface CreateShareRequest {
  expires_at: string | null;
}

export interface CreateShareResponse {
  id: string;
  url: string;
  expires_at: string | null;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

/** Info resolved from the share endpoint's headers via a HEAD request. */
export interface ShareInfo {
  filename: string;
  size: number | null;
}