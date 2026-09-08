# File Sharing

A full-stack file-sharing application for uploading, managing, downloading, and securely sharing files through temporary or revocable links.

The project consists of:

* **Backend:** Go
* **Frontend:** React + TypeScript + Vite
* **Database:** PostgreSQL
* **Infrastructure:** Docker Compose

---

## ✨ Features

* User registration and authentication
* JWT-based authentication
* HTTP-only authentication cookies
* File upload and management
* File download
* File deletion
* Public share links
* Optional expiration for share links
* Share link revocation
* Secure share-token hashing
* PostgreSQL persistence
* Local filesystem storage
* Database migrations
* Centralized application error handling

---

## 🏗️ Architecture

The backend follows a lightweight **Clean Architecture** approach with clear separation between the domain, application, infrastructure, and delivery layers.

```text
                    ┌──────────────────────┐
                    │      HTTP / Gin      │
                    │       Handlers       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Application      │
                    │       UseCases       │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │     Domain      │         │   Application   │
        │ Entities/Repos  │         │   Interfaces    │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌──────────────────────┐
                    │   Infrastructure     │
                    │ PostgreSQL / Storage │
                    │      / Security      │
                    └──────────────────────┘
```

### Project Structure

```text
.
├── cmd/
│   └── main.go
│
├── internal/
│   ├── apperr/
│   │   └── error.go
│   │
│   ├── application/
│   │   ├── auth/
│   │   ├── file/
│   │   └── share/
│   │
│   ├── config/
│   │
│   ├── delivery/
│   │   └── http/
│   │       ├── handler/
│   │       ├── middleware/
│   │       └── router.go
│   │
│   ├── domain/
│   │   ├── user/
│   │   ├── file/
│   │   └── share/
│   │
│   └── infrastructure/
│       ├── postgres/
│       ├── security/
│       └── storage/
│
├── frontend/
│
├── migrations/
├── docker-compose.yml
├── .env.example
└── go.mod
```

Repository interfaces are defined alongside their corresponding domain entities.

Use cases are implemented as concrete structs rather than interfaces to keep the application layer simple and avoid unnecessary abstraction.

---

## 🛠️ Tech Stack

| Technology       | Purpose                                 |
| ---------------- | --------------------------------------- |
| Go               | Backend                                 |
| Gin              | HTTP framework                          |
| PostgreSQL       | Database                                |
| pgx              | PostgreSQL driver and connection pool   |
| React            | Frontend                                |
| TypeScript       | Frontend language                       |
| Vite             | Frontend tooling and development server |
| Docker Compose   | Local infrastructure                    |
| golang-migrate   | Database migrations                     |
| JWT              | Authentication                          |
| bcrypt           | Password hashing                        |
| Local filesystem | File storage                            |

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* Go
* Node.js and npm
* Docker
* Docker Compose

Clone the repository:

```bash
git clone https://github.com/arya237/file-sharing.git
cd file-sharing
```

---

## 1. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Example configuration:

```env
POSTGRES_HOST=localhost
POSTGRES_USER=file_sharing
POSTGRES_PASSWORD=file_sharing
POSTGRES_DB=file_sharing
POSTGRES_PORT=5432
POSTGRES_SSLMODE=disable

JWT_SECRET=change-this-secret
JWT_EXPIRE=12h

FILEPATH=files
```

### JWT Expiration

`JWT_EXPIRE` uses Go's `time.Duration` format.

For example:

```env
JWT_EXPIRE=12h
```

or:

```env
JWT_EXPIRE=30m
```

or:

```env
JWT_EXPIRE=24h
```

---

# 🐘 2. Start PostgreSQL

Start the database and migration services:

```bash
docker compose up -d
```

Docker Compose starts PostgreSQL and runs the database migrations.

Check the containers:

```bash
docker compose ps
```

To view migration logs:

```bash
docker compose logs migrate
```

---

# ▶️ 3. Run the Backend

From the project root:

```bash
go run cmd/main.go
```

The backend will start on:

```text
http://localhost:8080
```

---

# 💻 4. Run the Frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Vite will start the frontend development server and provide the local URL in the terminal.

---

# 🔄 Running the Full Project

For local development, you will typically need three things running:

### Terminal 1 — Infrastructure

```bash
docker compose up -d
```

### Terminal 2 — Backend

```bash
go run cmd/main.go
```

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

The frontend communicates with the Go backend while PostgreSQL runs inside Docker.

---

# 🗄️ Database

The application uses PostgreSQL for persistent data.

The main entities are:

```text
users
  │
  └──────< files
              │
              └──────< shares
```

Database schema changes are managed through migrations located in:

```text
migrations/
```

The migration files are automatically executed when the Docker Compose migration service starts.

---

# 🛑 Stopping the Project

Stop the Docker services:

```bash
docker compose down
```

The PostgreSQL volume is preserved.

To remove the database volume as well:

```bash
docker compose down -v
```

> **Warning:** Removing the volume permanently deletes the PostgreSQL data.

---

# 📄 License

This project is currently provided for educational and portfolio purposes.
