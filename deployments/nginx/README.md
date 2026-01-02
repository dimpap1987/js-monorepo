# Nginx Configurations

Environment-specific nginx configurations with graceful upstream handling.

## Structure

```
nginx/
├── shared/                    # Common configs
│   ├── proxy_params.conf      # Shared proxy headers
│   └── cloudflare-ips.conf    # Cloudflare IP ranges for real IP
├── dev/                       # Local development
│   ├── nginx.conf
│   ├── default.conf.template
│   └── docker-compose.yml
├── prod/                      # Self-hosted production with SSL
│   ├── nginx.conf
│   ├── default.conf.template
│   └── docker-compose.yml
└── railway/                   # Railway deployment
    ├── nginx.conf
    ├── default.conf.template
    └── Dockerfile
```

## Usage

### Development (HTTP only)

```bash
cd deployments/nginx/dev
docker-compose up
# Access: http://localhost
```

### Production (Self-hosted with SSL)

```bash
cd deployments/nginx/prod
NGINX_SERVER_NAME=yourdomain.com docker-compose up -d
# Access: https://yourdomain.com
```

Requires SSL certificates at:

- `/etc/letsencrypt/live/${NGINX_SERVER_NAME}/fullchain.pem`
- `/etc/letsencrypt/live/${NGINX_SERVER_NAME}/privkey.pem`

### Railway

Build from `deployments/nginx` directory:

```bash
docker build -f railway/Dockerfile -t nginx-railway .
```

**Railway Environment Variables:**

| Variable           | Example                     | Description              |
| ------------------ | --------------------------- | ------------------------ |
| `PORT`             | (auto)                      | Railway injects this     |
| `API_RAILWAY`      | `my-api.railway.internal`   | API service hostname     |
| `API_PORT`         | `3333`                      | API service port         |
| `NEXT_APP_RAILWAY` | `next-app.railway.internal` | Next.js service hostname |
| `NEXT_APP_PORT`    | `3000`                      | Next.js service port     |

## Features

- **Graceful startup**: Uses variable-based upstreams - nginx starts even if backends are down
- **Cloudflare support**: Real client IP via CF-Connecting-IP header (prod/railway)
- **Rate limiting**: 50 req/s with burst of 15 on `/api` and `/grafana`
- **WebSocket support**: `/ws` endpoint with 24h timeout
- **Health endpoint**: `/health` returns 200 OK (bypasses upstreams)
- **JSON logging**: Structured logs for easy parsing (prod/railway)

## Load Balancing

Nginx uses variable-based upstreams for graceful degradation. For load balancing:

- **Docker Swarm/K8s**: Scale services and Docker/K8s handles LB at DNS level
- **Railway**: Use Railway's horizontal scaling - automatic LB

The current config works with scaling out of the box.
