# Restack AI - Human in the loop example

This example will illustrate how you can handle events that will receive feedback as input and have a function that will acknowledge the feedback was received.
It will also showcase how a workflow can be left running indefinitely until a condition is met by the usage of the `condition`.

Idea is the humanLoop workflow will have two events:

1. feedback. This event will be triggered whenever you want to send feedback to your desired AI. For simplicity purposes, the function called on this event will just reply with a message that the feedback was received.
2. end. This event will be triggered when you are done with interactions and you want your workflow to be done and exit. Right now it sets the `endWorkflow` local variable on the workflow to true, which will make the `condition` set to resolve successfully and exit the workflow. You can use this example as guidance on how you can keep a workflow running until the end event is sent and how it will handle the events you have defined for the time it is running.

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

```bash
pnpm i
pnpm dev
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule a workflow

In another shell run following command:

```bash
pnpm schedule
```

Will schedule to start example workflow immediately. This runs the `scheduleWorkflow` file.


## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
