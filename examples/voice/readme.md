# Install dependencies

pnpm i

Add OPENAI_API_KEY and DEEPGRAM_API_KEY keys in .env

pnpm dev-server
pnpm dev-services

# Install Restack Web UI 

To install the Restack Web UI, you can use Docker.
```
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Use frontend with browser microphone:

https://github.com/restackio/voice-frontend

pnpm dev

# Or use Twilio voice calls

## Start ngrok funnel

pnpm ngrok

## Trigger Twilio call with

pnpm call

# Deploy

pnpm restack-up

### Troubleshooting

Error: listen EADDRINUSE: address already in use :::4000

Websocket not properly closed, list which process is using port:

lsof -i :4000

should return for ex. 1234.

Kill process:

kill 1234
