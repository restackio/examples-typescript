# Restack Child workflow Example

A sample repository, demonstrating how to use child workflows with Restack AI.

For a full Typescript documentation refer to <https://docs.restack.io/libraries/typescript>

## Requirements

- **Node 20+**, **pnpm** (or other package manager)

## Install dependencies and start services

```bash
pnpm i
pnpm dev
```

This will start Node.js app with two Restack Services. Your code will be running and syncing with Restack engine to execute workflows or functions.

## Start Restack Studio

To start the Restack Studio, you can use Docker.

```bash
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

## Schedule the parent workflow

```bash
pnpm schedule-workflow
```

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
