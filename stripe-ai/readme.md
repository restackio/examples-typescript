# Overview

This example showcases how to make interactions with stripe ai. For the purpose of the example we will tell the stripe agent to create a new product with price a set price and to create a payment link for it. The Agent will respond with the payment link of the newly created product.

# Requirements

- Node 20 or higher

```bash
brew install nvm
nvm use 20
```

# Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```bash
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Start services

Where all your code is defined, including workflow steps.

add OPENAI_API_KEY, STRIPE_SECRET_KEY in .env

```bash
npm i
npm run build
npm run dev
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule workflow to send email

In another shell:

```bash
npm run schedule
```

Will schedule to start example workflow immediately. The code for this is on `scheduleWorkflow.ts`. In here you can see how the createPaymentLinkWorkflow is executed.


## Deploy on Restack Cloud

To deploy the application on Restack, you can create an account at [Restack Console](https://console.restack.io)
