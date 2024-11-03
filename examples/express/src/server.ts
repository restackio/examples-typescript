import express from 'express';
import dotenv from 'dotenv';
import { client } from './client';

dotenv.config();

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