import { z } from "zod";

export const ResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    content: z.string()
  }),
  z.object({
    type: z.literal("function_call"),
    function_name: z.string(),
    function_arguments: z.record(z.any())
  })
]);

export type StructuredResponse = z.infer<typeof ResponseSchema>;

// Todo creation schemas and types
export const CreateTodoSchema = z.object({
  todoTitle: z.string().min(1).describe("The title of the todo to create"),
  todoDescription: z.string().optional().describe("Optional detailed description of the todo"),
}).describe("Creates a new todo but doesn't execute it. Use when a user wants to add a task to their list.");

export type CreateTodoInputType = z.infer<typeof CreateTodoSchema>;
export type CreateTodoOutput = string;

// Todo execution schemas and types
export const ExecuteTodoSchema = z.object({
  todoId: z.string().min(1).describe("The ID of the todo to execute"),
  todoTitle: z.string().optional().describe("The title of the todo to execute (if ID not available)"),
}).describe("Executes a specific todo from the list. Use when a user wants to complete or perform a task.");

export type ExecuteTodoInputType = z.infer<typeof ExecuteTodoSchema>;

export const ExecuteTodoOutputSchema = z.object({
  todoId: z.string(),
  todoTitle: z.string(),
  details: z.string(),
  status: z.string(),
});

export type ExecuteTodoOutput = z.infer<typeof ExecuteTodoOutputSchema>;
