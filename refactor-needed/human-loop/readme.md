# Restack AI - Agent with Human in the loop

This example will illustrate how you can handle events that will receive feedback as input and have a function that will acknowledge the feedback was received.
It will also showcase how an agent is left running indefinitely until a condition is met by the usage of the `condition`.

The Agent with Human in the loop will have two events:

1. feedback. This event will be triggered whenever you want to send feedback to your desired AI. For simplicity purposes, the function called on this event will just reply with a message that the feedback was received.

2. end. This event will be triggered when you are done with interactions and you want your agent to be done and exit. Right now it sets the `endEvent` local variable on the agent to true, which will make the `condition` set to resolve successfully and exit the agent. You can use this example as guidance on how you can keep an agent running until the end event is sent and how it will handle the events you have defined for the time it is running.

# Requirements

- Node 20 or higher

brew install nvm
nvm use 20

- pnpm

brew install pnpm

# Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 -p 9233:9233 p 10233:10233 ghcr.io/restackio/restack:main
```

# Start services

Where all your code is defined, including agent steps.

```bash
pnpm i
pnpm dev
```

Your code will be running and syncing with Restack engine to execute agents or functions.

# Schedule an agent

In another shell run following command:

```bash
pnpm schedule
```

Will schedule to start example agent immediately. This runs the `scheduleAgent` file.

## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
