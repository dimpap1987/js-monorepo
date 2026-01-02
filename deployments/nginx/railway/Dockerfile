FROM nginx:1.25.4-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy configs (build context should be deployments/nginx)
COPY railway/nginx.conf /etc/nginx/nginx.conf
COPY railway/default.conf.template /etc/nginx/templates/default.conf.template
COPY shared/proxy_params.conf /etc/nginx/proxy_params.conf
COPY shared/cloudflare-ips.conf /etc/nginx/cloudflare-ips.conf

# Startup script - substitute env vars and start nginx
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT \$API_RAILWAY \$API_PORT \$NEXT_APP_RAILWAY \$NEXT_APP_PORT" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["/docker-entrypoint.sh"]
