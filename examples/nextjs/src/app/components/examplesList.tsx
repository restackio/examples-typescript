export type Example = {
  name: string;
  description: string;
  integrations: string[];
  workflowName: string;
  input: Record<string, any>;
};

export const examples = [
  {
    name: "Hello world",
    description: "Example workflow to say hello and goodbye",
    integrations: ["openai"],
    workflowName: "helloWorkflow",
    input: { name: "test" },
  },
];
