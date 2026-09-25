FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    procps \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g opencode-ai@latest

WORKDIR /app

COPY server.mjs entrypoint.sh auth.bundle.txt* ./
RUN chmod +x entrypoint.sh

ENV PORT=10000
ENV NODE_ENV=production
ENV NO_COLOR=1
ENV DEFAULT_MODEL=opencode/ling-3.0-flash-fin-free
ENV BRIDGE_API_KEY=clink-zen-cloud-2026

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:10000/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
