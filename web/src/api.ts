import type { TodoItemType } from "./todoListState";

export const fetchTodoListAPI = async (): Promise<TodoItemType[]> => {
  return await fetch("http://localhost:8080/api/todo").then((res) =>
    res.json(),
  );
};
