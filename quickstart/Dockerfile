# Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files and env file if it exists
COPY package*.json .env* ./

# Copy package files
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm install
RUN npm add -D typescript

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Define environment variables
ARG RESTACK_ENGINE_ID
ENV RESTACK_ENGINE_ID=${RESTACK_ENGINE_ID}

ARG RESTACK_ENGINE_ADDRESS 
ENV RESTACK_ENGINE_ADDRESS=${RESTACK_ENGINE_ADDRESS}

ARG RESTACK_ENGINE_API_KEY
ENV RESTACK_ENGINE_API_KEY=${RESTACK_ENGINE_API_KEY}

EXPOSE 3000

CMD ["node", "dist/services.js"]
