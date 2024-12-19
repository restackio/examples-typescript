# Introduction to the Express Together LlamaIndex Example

This project demonstrates how to build a simple Express application that integrates with the Together AI API and utilizes Restack for deployment. The application showcases the ability to schedule workflows and handle requests for generating chat completions using the Together AI service.

## Key Features

- **Express Server**: A lightweight server that listens for incoming requests and processes them.
- **Services**: The application includes services to run workflows and functions, initiated alongside the server in the `server.ts` file.
- **Together AI Integration**: Utilizes the Together AI API to generate chat completions based on user input.
- **Workflow Management**: Supports scheduling and managing workflows through a RESTful interface.
- **Docker Support**: Easily build and run the application in a Docker container for consistent deployment across environments.
- **Restack Deployment**: Simplifies the deployment process to the Restack Cloud, allowing for scalable and efficient application management.

# Run Restack in Docker

docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main

# Open the Desktop UI

http://localhost:5233

# Install dependencies

```
pnpm install
```

## Run the Express server

```
pnpm dev
```

The server should be up at http://localhost:8000

## Send a test request to the chatCompletionBasic workflow

```
curl -X POST http://localhost:8000 -H "Content-Type: application/json" -d '{"workflowName": "chatCompletionBasic", "workflowId": "chatCompletionBasic", "input": {"name": "Martin"}}'
```

## Test the simple RAG workflow for Llamaindex

curl -X POST http://localhost:8000 -H "Content-Type: application/json" -d '{"workflowName": "llamaindexTogetherSimple", "workflowId": "llamaindexTogetherSimple-123"}'

## Build and Run Docker Container

Build the Docker image and run the container with:

```
pnpm docker:dev
```

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
