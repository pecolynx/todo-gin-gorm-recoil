import { atom, selector, useRecoilValue } from "recoil";
import { fetchTodoListAPI } from "./api";

export type TodoItemType = {
  id: number;
  text: string;
  isComplete: boolean;
};

export const todoListState = atom<TodoItemType[]>({
  key: "todoListState",
  default: selector({
    key: "initialTodoListState",
    get: async () => await fetchTodoListAPI(),
  }),
});

const todoListSelector = selector({
  key: "todoListSelector",
  get: ({ get }) => get(todoListState),
});

export const todoSelectors = {
  useGetTodoList: () => useRecoilValue(todoListSelector),
};
