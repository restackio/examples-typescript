# ------- Image ----------

FROM node:20-bullseye-slim AS installer

RUN apt-get update \
  && apt-get install -y ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY ./package.json ./app/package.json
COPY ./tsconfig.json ./app/tsconfig.json


WORKDIR /app

RUN npm install

# ------- Builder ----------

FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY --from=installer /app .
COPY ./src ./src

RUN npm run build

# ------- Runner ----------

FROM node:20-bullseye-slim AS runner

RUN apt-get update \
  && apt-get install -y ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 service
RUN adduser --system --uid 1001 service
USER service

WORKDIR /app

COPY --from=builder /app .

ENV NODE_OPTIONS=”--max-old-space-size=4096″

CMD ["node", "dist/services"]