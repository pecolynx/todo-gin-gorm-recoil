import { TodoItem } from "./TodoItem";
import { TodoItemCreator } from "./TodoItemCreator";
import { updateTodoAPI } from "./api";
import { todoSelectors } from "./todoListState";

interface Props {
  deleteTodo: (id: number) => void;
  updateTodo: (id: number, text: string, isComplete: boolean) => void;
}

export const TodoList = ({ deleteTodo, updateTodo }: Props): JSX.Element => {
  const todoList = todoSelectors.useGetTodoList();

  console.log(todoList);
  return (
    <>
      <TodoItemCreator />
      {todoList.map((todoItem) => (
        <TodoItem
          key={todoItem.id}
          item={todoItem}
          deleteTodo={deleteTodo}
          updateTodo={updateTodo}
        />
      ))}
    </>
  );
};
