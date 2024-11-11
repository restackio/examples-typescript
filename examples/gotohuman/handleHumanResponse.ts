import express, { Request, Response } from 'express';
import { client } from "./src/client";
import { HumanResponseEvent } from './src/events';

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.post('/', async (req: Request, res: Response) => {
  console.log(`Received webhook from gotoHuman`, req.body)

  try {
    // Our gotoHuman review form also contains a buttonSelect with the ID 'publishDecision', value: publish|discard
    const workflowResponse = await client.sendWorkflowEvent({
      event: {
        name: HumanResponseEvent.name,
        input: { 
          linkedInPost: req.body?.responseValues?.linkedInPost?.value || "",
          publishDecision: req.body?.responseValues?.publishDecision?.value || ""
        },
      },
      workflow: {
        workflowId: req.body?.meta?.restackWorkflowId,
        runId: req.body?.meta?.restackRunId,
      },
    });
    console.log(`Sent event to workflow. Returned ${workflowResponse}`)
  
    res.status(200).json({msg: 'Processed human feedback ' + workflowResponse})
  } catch(e) {
    console.error("Sending event to workflow failed!", e)
    res.status(500).json({error: `Could not process webhook!`})
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});