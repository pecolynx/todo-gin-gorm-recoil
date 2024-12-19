import { useRecoilValue } from "recoil";
import { TodoItem } from "./TodoItem";
import { TodoItemCreator } from "./TodoItemCreator";
// import { todoListState } from "./todoListState";
import { todoSelectors } from "./todoListState";

export const TodoList = (): JSX.Element => {
  //   const todoList = useRecoilValue(todoListState);
  const todoList = todoSelectors.useGetTodoList();

  console.log(todoList);
  return (
    <>
      <TodoItemCreator />
      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
    </>
  );
};
