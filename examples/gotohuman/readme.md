# gotoHuman | Restack - Human in the loop

[gotoHuman](https://www.gotohuman.com?utm_source=github&utm_medium=restack_repo_example&utm_campaign=readme) is a human-in-the-loop solution for autonomous AI agents, making it very easy to review AI-generated content, approve actions and tool calls, or simply provide input.

It's a great fit for Restack since both are built for autonomous AI agents, long-running workflows and asynchronous events.  
With gotoHuman you can request a human review with a single call. You pass along your AI-generated content and any context relevant for human decision-making. You and your team can then review and edit content and provide input or decisions in gotoHuman. And Restack allows to gracefully handle the webhook response from this review that might only be coming in after some hours, days or even weeks.

## Example
This example workflow takes a topic and turns it into an AI-generated LinkedIn post. This draft is then sent to gotoHuman for review and editing. When the review gets submitted the workflow continues to publish the actual post.  
There are two parts:

1. The Restack workflow with these steps:
- Draft a LinkedIn pots with OpenAI for given topic
- Request human review via gotoHuman
- Wait for review response to publish post
2. An ExpressJS endpoint
- Listens for the webhook from gotoHuman that's triggered for each submitted review
- Sends a Restack event to our long-running workflow

## Set up human review

gotoHuman offers review forms that can be tailored to every use case.  
Go ahead and create a new form at [app.gotohuman.com](https://app.gotohuman.com?utm_source=github&utm_medium=restack_repo_example&utm_campaign=readme).  
We'll enter the webhook in a step below.

For our example add these components to your form:
- a dynamic *header* with ID `topic`
- a dynamic *text* with ID `linkedInPost`
- a *buttonSelect* with ID `publishDecision` and two fixed choices with IDs `publish` and `discard`

Don't forget to save your form.  
At the bottom of our form builder you can see an example SDK request to send (as we do in `requestReview.ts`).  
Here you also find your **API key** and the **form ID**.

## Environment variables
Set up
```js
OPENAI_API_KEY=
GOTOHUMAN_API_KEY=
GOTOHUMAN_FORM_ID=
```

## Start Restack engine

Requires Node 20 or higher

```bash
pnpm i
pnpm dev
```

Your code will be running and syncing with Restack engine to execute workflows or functions.

## Start the webhook API endpoint

In another shell run:

```bash
pnpm endpoint
```

This is set up to run on port 4000 per default.  
When running locally you need ngrok to make the API accessible to gotoHuman:

```bash
ngrok http  http://localhost:4000
```

Copy the public URL to your form's **webhook** field.

## Start the workflow

In another shell run:

```bash
pnpm schedule
```

Will schedule to start example workflow immediately. This runs the `scheduleWorkflow` file.  
We are using a hard-coded topic here, but you could also trigger a workflow run with a dynamic value from e.g. another API endpoint.

## Install Restack Web UI

To install the Restack Web UI, you can use Docker.

```
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main
```

