FROM node:18-alpine

WORKDIR /app

# Install dependencies for Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-dejavu

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy application code
COPY src ./src
COPY sessions ./sessions

# Create sessions directory
RUN mkdir -p sessions

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "src/server.js"]
