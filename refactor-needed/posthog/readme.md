# Motivation

We built this to autonomous AI to watch Posthog Session Recording and create a digest on Linear (optional)

Its using OpenAI GPT-4.1-mini to analyse recordings.
And OpenAI O1-preview to reason and create a digest in Markdown.

By default we retrieve all recodings from last 24 hours, so by scheduling the workflow to run every day we get a digest of all new recordings.

# Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```
docker run -d --pull always --name restack -p 5233:5233 -p 6233:6233 -p 7233:7233 -p 9233:9233 p 10233:10233 ghcr.io/restackio/restack:main
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

For more detailed information on deploying your repository to Restack, refer to the [Restack Cloud documentation](https://docs.restack.io/restack-cloud).
