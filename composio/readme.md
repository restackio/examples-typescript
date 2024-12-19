# Overview

The Composio example showcases how you can use the Restack AI together with [Composio](https://composio.dev). A workflow has been created that will create an even on the google calendar of the provided entity.

# Requirements

- Node 20 or higher

```bash
brew install nvm
nvm use 20
```

- pnpm

```bash
brew install pnpm
```

# Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```bash
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Start services

Where all your code is defined, including workflow steps.

add `COMPOSIO_API_KEY` and `OPENAI_API_KEY` in .env

```bash
pnpm i
pnpm build
pnpm dev
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule a workflow

In another shell:

```bash
pnpm schedule
```

Will schedule to start example workflow immediately. The code for this is on `scheduleWorkflow.ts`. In here you can see how the createCalendarEventWorkflow is scheduled to be exectuted.

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
