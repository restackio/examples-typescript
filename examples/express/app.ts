import Restack from '@restackio/ai';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const connectionOptions = {
    engineId: process.env.RESTACK_ENGINE_ID!,
    address: process.env.RESTACK_ENGINE_ADDRESS!,
    apiKey: process.env.RESTACK_ENGINE_API_KEY!,
};

const client = new Restack(
    process.env.RESTACK_ENGINE_API_KEY ? connectionOptions : undefined
);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.post('/', async (req, res) => {
    const { workflowName, workflowId } = req.body;
    const runId = await client.scheduleWorkflow({ workflowName, workflowId });
    res.json({ runId });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});