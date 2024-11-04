# Restack Get Started

A sample repository, which demonstrates working with Restack Framework and optional Restack OpenAI integration.

For a full Typescript documentation refer to <https://docs.restack.io/libraries/typescript/reference>

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
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

## Schedule a demo Workflow

```bash
pnpm schedule-workflow
```

This will trigger a demo Workflow - a _greeting_, which is a simple function and _goodbye_, which uses [@restackio/integration-openai](https://www.npmjs.com/package/@restackio/integrations-openai).

## Deploy on Restack Cloud

``` bash
pnpm restack-up
```

To deploy the application on Restack, you can use the provided `restackUp.ts` script. This script utilizes the Restack Cloud SDK to define and deploy your application stack. It sets up the necessary environment variables and configures the application for deployment.

To get started, ensure you have the required Restack Cloud credentials and environment variables set up. Then, run the script to initiate the deployment process.

For more detailed information on deploying your repository to Restack, refer to the [Restack Cloud deployment documentation](https://docs.restack.io/restack-cloud/deployrepo).
