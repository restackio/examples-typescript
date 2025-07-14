import { log } from "@restackio/ai/function";
import { CreateTodoInputType, CreateTodoOutput } from "./types";

export const createTodo = async ({ todoTitle }: CreateTodoInputType): Promise<CreateTodoOutput> => {
  const todo_id = `todo-${Math.floor(Math.random() * 10000)}`;
  log.info("createTodo", { todo_id, todoTitle });
  return `Created the todo '${todoTitle}' with id: ${todo_id}`;
};
