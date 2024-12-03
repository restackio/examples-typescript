# Overview

This example showcases how to send emails with a Restack workflow using the sendgrid api. You can easily choose another email provider and update the code.
You can schedule two scenarios of the workflow.

1. It will be successfull and send an email.
2. The email content generation step will fail once to showcase how Restack handles retries automatically. Once failure is caught, step will be retry automatically and rest of workflow will be executed as expected and email will be sent.

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

add OPENAI_API_KEY, SENDGRID_API_KEY, FROM_EMAIL in .env

```bash
npm i
npm build
npm dev
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

# Schedule workflow to send email

In another shell:

```bash
npm run schedule
```

Will schedule to start example workflow immediately. The code for this is on `scheduleWorkflow.ts`. In here you can see how the sendEmailWorkflow is scheduled to be exectuted.

# Schedule workflow to send email with simulated failure and retries

In another shell:

```bash
npm run schedule-retries
```

Will schedule to start example workflow immediately. The code for this is on `scheduleWorkflowRetries.ts`. In here you can see how the sendEmailWorkflow is scheduled to be exectuted and the step to generate email content is force to have a failure and show how Restack will handle retries automatically for you. Step will fail once and be successfull on the next retry, then rest of steps defined on workflow will be exectuted correctly
