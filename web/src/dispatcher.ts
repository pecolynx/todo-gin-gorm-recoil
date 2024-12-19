import { useRecoilCallback } from "recoil";
import { addTodoAPI, deleteTodoAPI, updateTodoAPI } from "./api";
import { todoListState } from "./todoListState";

// postSuccessProcess: () =>void

export const useCreateDispatcher = () => {
  const addTodo = useRecoilCallback(
    ({ set }) =>
      async (text: string, postSuccessProcess: () => void) => {
        const newTodo = await addTodoAPI(text);
        set(todoListState, (oldTodos) => [...oldTodos, newTodo]);
        postSuccessProcess();
      },
    [],
  );

  const deleteTodo = useRecoilCallback(
    ({ set }) =>
      async (id: number) => {
        await deleteTodoAPI(id);
        set(todoListState, (oldTodos) =>
          oldTodos.filter((todo) => todo.id !== id),
        );
      },
    [],
  );

  const updateTodo = useRecoilCallback(
    ({ set }) =>
      async (id: number, text: string, isComplete: boolean) => {
        const updatedTodo = await updateTodoAPI(id, text, isComplete);
        set(todoListState, (oldTodos) =>
          oldTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
        );
      },
    [],
  );

  return {
    addTodo,
    deleteTodo,
    updateTodo,
  };
};
