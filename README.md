# byFood Library Management System

A full-stack CRUD application for managing a library of books with URL cleanup service. Built with React/Next.js frontend, Golang backend, and PostgreSQL database, all containerized with Docker.

## Features

- **Full CRUD Operations**: Create, read, update, and delete books with UUID support
- **Modern Frontend**: React/Next.js with TypeScript, Tailwind CSS, search, filtering, and sorting
- **RESTful API**: Golang backend with comprehensive UUID-based API endpoints
- **Database**: PostgreSQL with UUID primary keys and persistent data storage
- **URL Processing**: Additional service for URL cleanup and processing
- **Containerized**: Complete Docker setup with docker-compose
- **Native Swagger Documentation**: Industry-standard OpenAPI documentation with "Try it out" functionality
- **Data Persistence**: Database survives container restarts with named volumes
- **Advanced UI Features**: Real-time search, year filtering, and multi-column sorting
- **Timestamps**: Created and updated timestamps for all books
- **Easy Development**: Makefile with intuitive commands

## Prerequisites

- Docker and Docker Compose installed
- Git for cloning the repository

## Quick Start

1. Clone the repository:
```bash
git clone <your-repo>
cd byfood-library
```

2. Complete setup (builds and starts everything):
```bash
make setup
```

3. Access the application:
   - **Frontend**: http://localhost:3000 (Full-featured UI with search, filters, and sorting)
   - **Backend API**: http://localhost:8080 (RESTful API with UUID support)
   - **API Documentation**: http://localhost:8080/swagger/ (Native Swagger UI with "Try it out")
   - **Database**: localhost:5432 (PostgreSQL with persistent storage)

## Available Commands

### Main Commands
```bash
make setup          # Complete setup from scratch
make dev            # Development with logs
make build          # Build all Docker images
make up             # Start all services in background
make down           # Stop all services
make clean          # Clean up containers and volumes
make health         # Check service health
```

### Backend Commands
```bash
make backend-test           # Run Go tests
make backend-test-verbose   # Run Go tests with verbose output
make backend-logs          # View backend logs
make backend-shell         # Access backend container
```

### Frontend Commands
```bash
make frontend-test    # Run frontend tests
make frontend-logs    # View frontend logs
make frontend-shell   # Access frontend container
```

### Database Commands (with Persistence Management)
```bash
# Safe operations (preserve data)
make db-shell        # Access PostgreSQL shell
make db-stop         # Stop database container (data persists)
make db-restart      # Restart database container (data persists)
make stop            # Stop all containers (data persists)
make restart         # Restart all containers (data persists)

# Backup and restore
make db-backup       # Create database backup in backups/ directory
make db-restore      # List available backups and show restore usage
make db-restore-file BACKUP_FILE=backups/backup_20240101_120000.sql

# DESTRUCTIVE operations (will lose data)
make db-reset        # Reset database and lose all data (asks confirmation)
make clean           # Remove all containers and data (asks confirmation)
```

## API Endpoints

### Books (UUID-based)
- `GET /books` - Get all books with created/updated timestamps
- `GET /books/{id}` - Get book by UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- `POST /books` - Create new book (auto-generates UUID)
- `PUT /books/{id}` - Update book by UUID (updates timestamp)
- `DELETE /books/{id}` - Delete book by UUID

### Documentation & Utils
- `GET /swagger/` - Interactive Swagger UI with native "Try it out" functionality
- `GET /swagger/doc.json` - OpenAPI JSON specification
- `GET /docs` - Redirects to Swagger UI for compatibility
- `POST /process-url` - Clean and process URL
- `GET /health` - Health check

### Example API Requests

#### Create a Book
```bash
curl -X POST http://localhost:8080/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Architecture",
    "author": "Robert Martin",
    "year": 2017
  }'
```

#### Get All Books
```bash
curl http://localhost:8080/books
# Returns array of books with UUIDs and timestamps:
# [
#   {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "title": "Clean Architecture",
#     "author": "Robert Martin", 
#     "year": 2017,
#     "created_at": "2025-08-06T04:07:03.088784Z",
#     "updated_at": "2025-08-06T04:07:03.088784Z"
#   }
# ]
```

#### Get Book by UUID
```bash
curl http://localhost:8080/books/550e8400-e29b-41d4-a716-446655440000
```

#### Update Book
```bash
curl -X PUT http://localhost:8080/books/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Architecture - Updated",
    "author": "Robert C. Martin",
    "year": 2017
  }'
```

#### Process URL
```bash
curl -X POST http://localhost:8080/process-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page?utm_source=google&ref=tracking"
  }'
```

## Frontend Features

The React/Next.js frontend at http://localhost:3000 provides a full-featured book management interface:

### 📚 Book Management
- **View all books** in a responsive table with UUID, title, author, year, and timestamps
- **Add new books** via modal form with validation
- **Edit existing books** with pre-populated form data
- **Delete books** with confirmation prompts
- **View book details** in a detailed modal

### 🔍 Search & Filter
- **Real-time search** by title or author (case-insensitive)
- **Year filtering** with dropdown of available years
- **Advanced sorting** by:
  - Title (A-Z / Z-A)
  - Author (A-Z / Z-A) 
  - Year (Oldest/Newest first)
  - Recently added (by created_at)
  - Recently updated (by updated_at)
- **Result counter** showing filtered vs total books
- **Clear filters** button to reset search/filters

### 💾 Data Display
- **UUID identifiers** for all books
- **Timestamps** showing when books were created and last updated
- **Responsive design** that works on desktop, tablet, and mobile
- **Loading states** and error handling
- **Empty states** with helpful messages

## Project Structure

```
byfood-library/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── contexts/        # Context API for state management
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Golang API server
│   ├── handlers/            # HTTP request handlers
│   ├── models/              # Data models with UUID support
│   ├── database/            # Database connection and UUID schema
│   ├── docs/                # Auto-generated Swagger documentation
│   ├── main.go              # Application entry point with Swagger
│   └── Dockerfile
├── docker-compose.yml        # Multi-service Docker configuration
├── Makefile                 # Development commands
└── README.md
```

## Database Persistence

**🔒 Your data is SAFE by default!** The system uses Docker named volumes for persistence:

- **Database data persists** across container stops/starts, system reboots, and Docker updates
- Normal operations like `make restart`, `make stop`, `docker-compose down` **preserve all data**
- Only `make clean` or `make db-reset` will delete data (with confirmation prompts)
- The `restart: unless-stopped` policy automatically restarts containers after system boot

### Database Backup Strategy
```bash
# Create regular backups
make db-backup              # Creates timestamped backup file

# Restore from backup if needed
make db-restore-file BACKUP_FILE=backups/backup_20240806_143022.sql
```

### Testing Data Persistence

To verify your data survives container restarts:

```bash
# 1. Add a test book
curl -X POST http://localhost:8080/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Persistence Test", "author": "Test Author", "year": 2025}'

# 2. Note the returned UUID, then stop all containers
make down

# 3. Restart everything
make up

# 4. Verify your book still exists (using the UUID from step 1)
curl http://localhost:8080/books | grep "Persistence Test"
```

✅ **Result**: Your book will still be there with the same UUID and timestamps!

## Development

### Local Development Setup

1. Start development environment:
```bash
make dev
```

2. Make changes to the code - both frontend and backend have hot reload enabled

3. Run tests:
```bash
make backend-test
make frontend-test
```

4. Check logs:
```bash
make logs                    # All services
make backend-logs           # Backend only
make frontend-logs          # Frontend only
```

### Database Management

The PostgreSQL database comes with sample data and **persists automatically**:

- **Safe restart**: `make restart` (preserves data)
- **Safe stop**: `make stop` (preserves data)  
- **Access shell**: `make db-shell`
- **Create backup**: `make db-backup`
- **⚠️ Reset data**: `make db-reset` (asks confirmation)

### Testing

Run backend tests:
```bash
make backend-test-verbose
```

The backend includes comprehensive tests for all CRUD operations.

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port (default: 8080)
- `NEXT_PUBLIC_API_URL`: Frontend API base URL

## Troubleshooting

### Services won't start
```bash
make clean setup
```

### Database connection issues
```bash
make db-reset
```

### Port conflicts
Check if ports 3000, 8080, or 5432 are already in use:
```bash
lsof -i :3000
lsof -i :8080
lsof -i :5432
```

### View service logs
```bash
make logs
```

## Architecture

- **Frontend**: React 18 with Next.js 14, TypeScript, Tailwind CSS, Context API, search/filter/sort features
- **Backend**: Go 1.21 with Gorilla Mux router, UUID support, Zap logging, native Swagger/OpenAPI
- **Database**: PostgreSQL 15 with UUID primary keys, timestamps, and persistent named volumes
- **Container**: Docker with multi-stage builds and automatic restarts
- **Documentation**: Native Swagger UI with interactive "Try it out" functionality
- **API**: RESTful design with comprehensive UUID-based endpoints and timestamp tracking

## Development & Reproduction

### For Developers
- **Complete Implementation Guide**: See [prompt.md](./prompt.md) for full system specification
- **Project Specification**: See [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md) for technical details

### Reproducing This System
If you want to recreate this exact system from scratch (e.g., in a new Claude Code session):

1. Use the complete specification in [prompt.md](./prompt.md)
2. The prompt contains all requirements, code examples, and implementation details
3. Following the prompt will produce the identical system with all features

## Contributing

1. Make changes to the codebase
2. Run tests: `make backend-test`
3. Check health: `make health`
4. Update documentation if needed
5. Commit your changes

## License

This project is licensed under the MIT License.