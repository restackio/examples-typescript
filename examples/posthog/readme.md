# Motivation

We built this to autonomous AI to watch Posthog Session Recording and create a digest on Linear (optional)

Its using OpenAI GPT-4o-mini to analyse recordings.
And OpenAI O1-preview to reason and create a digest in Markdown.

By default we retrieve all recodings from last 24 hours, so by scheduling the workflow to run every day we get a digest of all new recordings.

# Install Restack Web UI 

To install the Restack Web UI, you can use Docker.
```
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

# Install dependencies

pnpm i

# Add necessary keys from .env.example in .env

To get Linear team id, enter command K then search UUID and click Developer: Copy model UUID and select the team where you want to create issues.

# Run operator

pnpm dev

# Schedule digest workflow with

pnpm schedule

## Deploy on Restack

pnpm restack-up

To deploy the application on Restack, you can use the provided `restack_up.mjs` script. This script utilizes the Restack Cloud SDK to define and deploy your application stack. It sets up the necessary environment variables and configures the application for deployment. 

To get started, ensure you have the required Restack Cloud credentials and environment variables set up. Then, run the script to initiate the deployment process. 

For more detailed information on deploying your repository to Restack, refer to the [Restack Cloud deployment documentation](https://docs.restack.io/restack-cloud/deployrepo).
