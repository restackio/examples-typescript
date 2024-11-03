# Build stage
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./

# Install dependencies including TypeScript
RUN pnpm install
RUN pnpm add -D typescript

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm run build

# Production stage
FROM node:20-bullseye-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files, source code, and built code
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN pnpm install --prod

EXPOSE 8000

CMD ["node", "dist/server.js"]