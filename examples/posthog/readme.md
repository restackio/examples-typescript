# Motivation

We built this to autonomous AI to watch Posthog Session Recording and create a digest on Linear (optional)

Its using OpenAI GPT-4o-mini to analyse recordings.
And OpenAI O1-preview to reason and create a digest in Markdown.

By default we retrieve all recodings from last 24 hours, so by scheduling the workflow to run every day we get a digest of all new recordings.

# Install dependencies

pnpm i

# Add necessary keys from .env.example in .env

To get Linear team id, enter command K then search UUID and click Developer: Copy model UUID and select the team where you want to create issues.

# Run operator

pnpm dev

# Schedule digest workflow with

pnpm workflow
