import type { FC } from "react";
import { useRecoilValue } from "recoil";
import { TodoItem } from "./TodoItem";
import { TodoItemCreator } from "./TodoItemCreator";
import { todoListState } from "./todoListState";

export const TodoList = (): JSX.Element => {
  const todoList = useRecoilValue(todoListState);
  return (
    <>
      <TodoItemCreator />
      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
    </>
  );
};
