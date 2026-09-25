FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    procps \
 && rm -rf /var/lib/apt/lists/*

# Install OpenCode CLI globally
RUN npm install -g opencode-ai@latest

# Set working directory
WORKDIR /app

# Copy application files
COPY server.mjs entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Default environment variables
ENV PORT=8080
ENV NODE_ENV=production
ENV NO_COLOR=1

# Expose port
EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
