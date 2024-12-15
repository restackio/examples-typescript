# Restack Examples for Typescript

Restack is an open source framework for building autonomous AI applications in TypeScript. It helps developers build resilient, autonomous AI workflows that can execute logic and API calls reliably, maintain state over weeks or months, and self-improve over time. The examples in this repository demonstrate how to build TypeScript applications using Restack's features.

## Quick Start

Start the Restack Engine and Web UI using Docker:

```
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

Or using Docker Compose:

```
docker compose up -d --build --pull always
```

The Restack Web UI will be available at http://localhost:5233

## Examples

### Autonomous AI Examples

- [posthog](posthog) - Analyzes PostHog session recordings and creates Linear digests
- [voice](voice) - Voice processing with Deepgram and OpenAI

[Find more autonomous examples](https://docs.restack.io/examples)

## Examples of key Restack functionalities

- [child-workflows](child-workflows) - Example of parent-child workflow orchestration
- [encryption](encryption) - Example of encrypted data handling in workflows
- [human-loop](human-loop) - Example of human-in-the-loop workflows

### Examples with Service Provider (OpenAI, Gemini & more)

- [openai](openai) - Basic OpenAI integration example
- [gemini](gemini) - Example using Google's Gemini model
- [composio](composio) - Calendar event creation with AI
- [gotohuman](gotohuman) - Human-in-the-loop example using gotoHuman
- [expresss-together-llamaindex](express-together-llamaindex) - Together AI and LlamaIndex integration with Express
- [nextjs-together-llamaindex](nextjs-together-llamaindex) - Together AI and LlamaIndex integration with Next.js

### Framework Examples
- [nextjs](nextjs) - Integration with Next.js applications
- [express](express) - Basic Express server to schedule restack workflows 
- [swagger](swagger) - Express server with Swagger documentation to trigger restack workflow from Swagger UI


## Documentation

For detailed documentation and guides, visit [https://docs.restack.io/](https://docs.restack.io/)

Join our community on [Discord](https://discord.com/invite/79JuDTNEQm) for support and discussions.

## Local Restack Components

### Restack Engine

The Restack Engine uses Temporal to reliably run and manage AI workflows. It handles all the complex orchestration behind the scenes, including:

- Long-running workflows that maintain state for days or months
- Detailed workflow replay and debugging
- Automated event processing and handling
- Scheduled and recurring job execution
- Smart API rate limiting
- Persistent memory and state management

### Restack Web Interface

The web-based dashboard lets you:

- Track and troubleshoot running workflows
- Step through and replay workflow executions
- Test and validate individual functions
- Create and manage workflow schedules
- Access complete execution logs and history
