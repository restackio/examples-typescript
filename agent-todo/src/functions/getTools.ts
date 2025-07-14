import { zodFunction } from "openai/helpers/zod";
import { executeTodoWorkflow } from "../workflows/executeTodo";
import { createTodo } from "./createTodo";
import { CreateTodoSchema, ExecuteTodoSchema } from "./types";

export const getTools = async () => {
  const tools = [
    zodFunction({
      name: createTodo.name,
      parameters: CreateTodoSchema,
    }),
    zodFunction({
      name: executeTodoWorkflow.name,
      parameters: ExecuteTodoSchema,
    }),
  ];
  return tools;
};
