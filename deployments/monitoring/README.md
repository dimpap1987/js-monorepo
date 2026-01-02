# Monitoring Stack

Full observability stack with metrics, traces, and logs for the js-monorepo applications.

## Architecture

```
┌──────────────┐     ┌──────────────┐
│   my-api     │     │   next-app   │  ◄── Instrumented with OpenTelemetry
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                ▼
┌────────────────────────────────────┐
│     OpenTelemetry Collector        │  ◄── Central telemetry hub
│    (4317 gRPC / 4318 HTTP)         │
└────┬──────────┬───────────┬────────┘
     │          │           │
     ▼          ▼           ▼
┌────────┐  ┌───────────┐  ┌────────┐
│ Tempo  │  │Prometheus │  │  Loki  │
│(traces)│  │ (metrics) │  │ (logs) │
└────────┘  └─────┬─────┘  └────────┘
                  │
         ┌────────┴─────────┐
         │    Exporters     │
         ├──────────────────┤
         │ • Node Exporter  │  ◄── System metrics
         │ • cAdvisor       │  ◄── Container metrics
         │ • Postgres Exp.  │  ◄── Database metrics
         │ • Redis Exporter │  ◄── Cache metrics
         └──────────────────┘

                ▼
┌───────────────────────────────────┐
│            Grafana                │  ◄── Unified dashboards
│  • Metrics (Prometheus)           │
│  • Traces (Tempo)                 │
│  • Logs (Loki)                    │
└───────────────────────────────────┘
```

## Quick Start

### Development Mode (Local Apps)

Use this when running `my-api` and `next-app` locally (not in containers):

```bash
# Start monitoring stack
cd deployments/monitoring
make dev

# In your root .env, ensure:
# OTEL_HOSTNAME=localhost
# OTEL_ENABLED=true

# Start your apps normally
pnpm dev:my-api
pnpm dev:next
```

**Access URLs:**

- Grafana: http://localhost:3001 (auto-login enabled)
- Prometheus: http://localhost:9090
- Tempo: http://localhost:3200
- Loki: http://localhost:3100

### Production Mode (Containerized Apps)

Use this when running everything in Docker:

```bash
# First, start the application stack
cd deployments/my-api_next-app
docker compose up -d

# Then start monitoring
cd ../monitoring
make prod
```

## Available Commands

```bash
make help           # Show all commands

# Development
make dev            # Start monitoring for local development
make dev-down       # Stop development stack
make dev-logs       # View logs
make dev-restart    # Restart stack

# Production
make prod           # Start monitoring for production
make prod-down      # Stop production stack
make prod-logs      # View logs
make prod-restart   # Restart stack

# Utilities
make status         # Show container status
make reload-prom    # Reload Prometheus config
make clean          # Remove all data (DESTRUCTIVE!)
```

## Environment Configuration

### Development (.env.dev)

```bash
# Connects to LOCAL services via host.docker.internal
DATABASE_URL=postgresql://user:mypassword@host.docker.internal:5432/my-db
REDIS_URL=redis://host.docker.internal:6379
```

### Production (.env.prod)

```bash
# Connects to CONTAINERIZED services on super-network
DATABASE_URL=postgresql://user:mypassword@postgres:5432/my-db
REDIS_URL=redis://redis:6379
GRAFANA_ADMIN_PASSWORD=CHANGE_ME_IN_PRODUCTION
```

## Application Configuration

### my-api (apps/my-api/src/otel.ts)

OpenTelemetry is auto-initialized on startup. Configure via environment:

```bash
OTEL_HOSTNAME=localhost    # For development
OTEL_HOSTNAME=otel-collector  # For production
OTEL_ENABLED=false         # To disable telemetry
```

### next-app (apps/next-app/instrumentation.ts)

Uses Next.js instrumentation hook. Configure via environment:

```bash
OTEL_HOSTNAME=localhost    # For development
OTEL_HOSTNAME=otel-collector  # For production
OTEL_ENABLED=false         # To disable telemetry
```

## Pre-built Dashboards

Located in `grafana/provisioning/dashboards/definitions/`:

1. **HTTP OTEL Metrics** - Request rates, latencies, error rates
2. **Node Exporter** - System CPU, memory, disk, network
3. **PostgreSQL** - Connections, query performance, cache hits
4. **Redis** - Memory usage, commands/sec, evictions
5. **cAdvisor** - Container CPU, memory, network

## Alerting (Production Only)

Alerting is configured for production via Alertmanager. Alert rules include:

### Infrastructure Alerts

- High CPU usage (>80% warning, >95% critical)
- High memory usage (>85% warning, >95% critical)
- Disk space running low (>80% warning, >95% critical)

### Application Alerts

- High HTTP error rate (>5% warning, >25% critical)
- High API latency (P95 > 2s)
- No traffic detected (>10 minutes)

### Database Alerts

- PostgreSQL down
- High connection count
- Slow queries
- Deadlocks detected

### Redis Alerts

- Redis down
- High memory usage
- Key eviction rate high

### Configuration

Edit `config/alertmanager.yml` to configure notifications:

```yaml
receivers:
  - name: 'critical-receiver'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'
        channel: '#alerts-critical'
```

## Troubleshooting

### No metrics from local apps

1. Ensure monitoring stack is running: `make status`
2. Check `OTEL_HOSTNAME=localhost` in your root `.env`
3. Check `OTEL_ENABLED=true` in your root `.env`
4. Restart your app after changing env vars
5. Check OTEL collector logs: `docker logs otel-collector_dev`

### Postgres/Redis exporter not working

1. Check that Postgres/Redis is running locally
2. Verify credentials in `.env.dev` match your local setup
3. Check exporter logs: `docker logs postgres-exporter_dev`

### Grafana dashboards empty

1. Wait ~30 seconds for data to populate
2. Check Prometheus targets: http://localhost:9090/targets
3. Ensure the correct datasource is selected in dashboard

### Container-to-host networking issues (macOS/Windows)

The dev config uses `host.docker.internal` which works on:

- Docker Desktop for Mac
- Docker Desktop for Windows

On Linux, you may need to use the host's actual IP address.

## Directory Structure

```
deployments/monitoring/
├── docker-compose.yml          # Base compose file
├── docker-compose.dev.yml      # Dev overrides (ports, host.docker.internal)
├── docker-compose.prod.yml     # Prod overrides (alerting, health checks)
├── Makefile                    # Management commands
├── .env.dev                    # Development environment
├── .env.prod                   # Production environment
├── config/
│   ├── prometheus.yaml         # Production Prometheus config
│   ├── prometheus.dev.yaml     # Development Prometheus config
│   ├── alert.rules.yml         # Alerting rules
│   ├── alertmanager.yml        # Alertmanager config
│   ├── otel-collector-config.yaml      # Prod OTEL config
│   ├── otel-collector-config.dev.yaml  # Dev OTEL config
│   ├── tempo.yaml              # Tempo config
│   ├── loki.yaml               # Loki config
│   ├── promtail.yaml           # Prod Promtail config
│   └── promtail.dev.yaml       # Dev Promtail config
└── grafana/
    ├── config.monitoring       # Grafana credentials
    └── provisioning/
        ├── datasources/        # Auto-configured datasources
        └── dashboards/         # Auto-loaded dashboards
```
