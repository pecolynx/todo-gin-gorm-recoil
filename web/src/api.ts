import type { TodoItemType } from "./todoListState";

export const fetchTodoListAPI = async (): Promise<TodoItemType[]> => {
  return await fetch("http://localhost:8080/api/todo").then((res) =>
    res.json(),
  );
};

export const addTodoAPI = async (text: string): Promise<TodoItemType> => {
  return await fetch("http://localhost:8080/api/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  }).then((res) => res.json());
};

export const deleteTodoAPI = async (id: number): Promise<void> => {
  return await fetch("http://localhost:8080/api/todo", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  }).then((res) => res.json());
};

export const updateTodoAPI = async (id: number, text: string) => {
  return await fetch("http://localhost:8080/api/todo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, text }),
  }).then((res) => res.json());
};
