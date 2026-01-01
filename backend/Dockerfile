FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for migrations)
RUN npm install

# Copy source code
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

EXPOSE 5000

CMD ["npm", "start"]

ENTRYPOINT ["./entrypoint.sh"]