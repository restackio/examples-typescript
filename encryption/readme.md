# Requirements

- Node 20 or higher

brew install nvm
nvm use 20

- pnpm

brew install pnpm

# Install Restack Web UI 

To install the Restack Web UI, you can use Docker.
```
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Start services

Where all your code is defined, including workflow steps.

add OPENAI_API_KEY in .env

```bash
pnpm i

pnpm dev
```
Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule a workflow

In another shell:

pnpm schedule

Will schedule to start example workflow immediately.

# Architecture

```mermaid
flowchart TD
    C[fa:fa-bolt scheduleWorkflow client] -->|registers workflow with schedule| E{Restack Engine}
    E --> |queries results| C
    E -->|pulls queue with input| P1[fa:fa-ship restack pod]
    E -->|orchestrates with rate limit| P2[fa:fa-ship openai pod]
    P1 -->|runs| W[fa:fa-th-list example workflow]
    P1 -->|runs| Go[fa:fa-code goodbye function]
    P2 -->|runs| Gr[fa:fa-code greet function]
    P1 -->|sends status + output | E
    P2 -->|sends status output | E
```

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
