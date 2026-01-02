# Monitoring Stack Makefile
# Commands for managing the monitoring infrastructure in dev and prod environments

.PHONY: help dev dev-down dev-logs prod prod-down prod-logs status clean rebuild

# Default target
help:
	@echo "Monitoring Stack Management"
	@echo ""
	@echo "Development Commands (for local development):"
	@echo "  make dev          - Start monitoring stack for LOCAL development"
	@echo "  make dev-down     - Stop development monitoring stack"
	@echo "  make dev-logs     - View development stack logs"
	@echo "  make dev-restart  - Restart development stack"
	@echo ""
	@echo "Production Commands (for containerized apps):"
	@echo "  make prod         - Start monitoring stack for PRODUCTION"
	@echo "  make prod-down    - Stop production monitoring stack"
	@echo "  make prod-logs    - View production stack logs"
	@echo "  make prod-restart - Restart production stack"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make status       - Show running containers"
	@echo "  make clean        - Remove all monitoring data volumes"
	@echo "  make reload-prom  - Reload Prometheus configuration"
	@echo ""
	@echo "Access URLs (Development):"
	@echo "  Grafana:    http://localhost:3001"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Tempo:      http://localhost:3200"
	@echo "  Loki:       http://localhost:3100"

# ===========================================
# Development Commands
# ===========================================

# Create dev network if it doesn't exist
dev-network:
	@docker network inspect super-network >/dev/null 2>&1 || \
		docker network create super-network

# Start development monitoring stack
dev: dev-network
	@echo "Starting monitoring stack for LOCAL development..."
	@echo "Your local apps should use OTEL_HOSTNAME=localhost"
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d
	@echo ""
	@echo "Monitoring stack started!"
	@echo "  Grafana:    http://localhost:3001 (auto-login enabled)"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  OTEL HTTP:  http://localhost:4318"
	@echo ""
	@echo "Configure your local apps with:"
	@echo "  OTEL_HOSTNAME=localhost"
	@echo "  OTEL_ENABLED=true"

# Stop development stack
dev-down:
	@echo "Stopping development monitoring stack..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev down

# View development logs
dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev logs -f

# Restart development stack
dev-restart: dev-down dev

# ===========================================
# Production Commands
# ===========================================

# Ensure super-network exists (created by other deployments)
prod-network:
	@docker network inspect super-network >/dev/null 2>&1 || \
		(echo "Error: super-network does not exist. Start my-api_next-app first." && exit 1)

# Start production monitoring stack
prod: prod-network
	@echo "Starting monitoring stack for PRODUCTION..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
	@echo ""
	@echo "Monitoring stack started!"
	@echo "Access Grafana via your reverse proxy at /grafana"

# Stop production stack
prod-down:
	@echo "Stopping production monitoring stack..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod down

# View production logs
prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs -f

# Restart production stack
prod-restart: prod-down prod

# ===========================================
# Utility Commands
# ===========================================

# Show status of monitoring containers
status:
	@echo "=== Monitoring Containers ==="
	@docker ps --filter "name=prometheus" --filter "name=grafana" --filter "name=loki" \
		--filter "name=tempo" --filter "name=otel" --filter "name=promtail" \
		--filter "name=exporter" --filter "name=cadvisor" --filter "name=alertmanager" \
		--format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Reload Prometheus configuration (requires --web.enable-lifecycle)
reload-prom:
	@echo "Reloading Prometheus configuration..."
	@curl -X POST http://localhost:9090/-/reload 2>/dev/null && echo "Prometheus configuration reloaded" || \
		echo "Failed to reload. Is Prometheus running with --web.enable-lifecycle?"

# Clean up all monitoring data (DESTRUCTIVE!)
clean:
	@echo "WARNING: This will delete all monitoring data!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
	@echo "All monitoring data cleaned"

# Rebuild without cache
rebuild:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev build --no-cache
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod build --no-cache
