import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { client } from './client';
import { specs } from './swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /:
 *   post:
 *     summary: Schedule a workflow
 *     description: Schedule a new workflow with the given name and ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workflowName
 *               - workflowId
 *             properties:
 *               workflowName:
 *                 type: string
 *                 description: Name of the workflow to schedule
 *               workflowId:
 *                 type: string
 *                 description: Unique identifier for the workflow
 *     responses:
 *       200:
 *         description: Workflow scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 runId:
 *                   type: string
 *                   description: The ID of the scheduled workflow run
 */
app.post('/', async (req, res) => {
    const { workflowName, workflowId } = req.body;
    const runId = await client.scheduleWorkflow({ workflowName, workflowId });
    res.json({ runId });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});