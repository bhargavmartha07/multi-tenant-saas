# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Final Stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies (netcat for wait-for-db)
RUN apk add --no-cache netcat-openbsd

# Copy only necessary files from builder
COPY --from=builder /app /app

# Ensure entrypoint is executable
RUN chmod +x ./entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]