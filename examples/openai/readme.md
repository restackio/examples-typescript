# Requirements

- Node 20 or higher

brew install nvm
nvm use 20

- pnpm

brew install pnpm

# Start pods

Where all your code is defined, including workflow steps.

add OPENAI_API_KEY in .env

pnpm i

pnpm dev

Your code will be running in pods and syncing with Restack engine to execute workflows or functions.

# Schedule a workflow

In another shell:

pnpm workflow

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

# Deploy

pnpm restack-up
