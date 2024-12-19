# Restack AI - Discord Human in the loop example

This example will illustrate how you can utilize the Discord API and the Discord bot to get new messages from a channel and reply accordingly

The idea is the loop workflow will do the following:

1. Read new messages with the bot tagged after the last messages the bot sent.
2. Reverse a message and reply with the backwards message on the channel.
3. If a 'STOP' message is detected with the bot tagged, the loop will end.

# Requirements

- Node 20 or higher

brew install nvm
nvm use 20

- npm

brew install npm

# Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Start services

Go to this directory and run

```bash
DISCORD_BOT_TOKEN=<your-bot-token> npm run service
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule a workflow

In another shell run following command:

```bash
DISCORD_BOT_TOKEN=<your-bot-token> DISCORD_BOT_ID=<your-bot-id> DISCORD_CHANNEL_ID=<your-channel-id> npm run schedule
```

Will schedule to start example workflow immediately. This runs the `scheduleWorkflow` file.

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
