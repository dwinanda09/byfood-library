.PHONY: build up down logs test-backend test-frontend clean restart

build:
	docker-compose build

up:
	docker-compose up -d

up-logs:
	docker-compose up

down:
	docker-compose down

logs:
	docker-compose logs -f
backend-logs:
	docker-compose logs -f backend

backend-shell:
	docker-compose exec backend sh

backend-test:
	docker-compose exec backend go test ./...

backend-test-verbose:
	docker-compose exec backend go test -v ./...

frontend-logs:
	docker-compose logs -f frontend

frontend-shell:
	docker-compose exec frontend sh

frontend-test:
	docker-compose exec frontend npm test

db-shell:
	docker-compose exec postgres psql -U postgres -d byfood_library

db-stop:
	docker-compose stop postgres

db-restart:
	docker-compose restart postgres

db-reset:
	@echo "WARNING: This will DELETE ALL database data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	docker-compose down -v
	docker-compose up -d postgres
	sleep 5
	docker-compose up -d

db-backup:
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U postgres byfood_library > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up to backups/ directory"

db-restore:
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@echo "Usage: make db-restore-file BACKUP_FILE=backups/backup_20240101_120000.sql"

db-restore-file:
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE=path/to/backup.sql"; exit 1; fi
	docker-compose exec -T postgres psql -U postgres byfood_library < $(BACKUP_FILE)
	@echo "Database restored from $(BACKUP_FILE)"

dev: build up-logs

restart:
	docker-compose restart

stop:
	docker-compose stop

clean:
	@echo "WARNING: This will DELETE ALL data including database!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	docker-compose down -v
	docker system prune -f

health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8080/health || echo "Backend not healthy"
	@echo "\nChecking frontend..."
	@curl -f http://localhost:3000 || echo "Frontend not accessible"

setup: clean build up
	@echo "Waiting for services to start..."
	@sleep 10
	@make health