import { useCallback } from "react";
import type { ChangeEventHandler } from "react";
import { useRecoilState } from "recoil";
import { todoListState } from "./todoListState";
import type { TodoItemType } from "./todoListState";

type Props = {
  item: TodoItemType;
};

const replaceItemAtIndex = (
  arr: TodoItemType[],
  index: number,
  newValue: TodoItemType,
) => {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
};

const removeItemAtIndex = (arr: TodoItemType[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const TodoItem = ({ item }: Props): JSX.Element => {
  const [todoList, setTodoList] = useRecoilState(todoListState);
  const index = todoList.findIndex((listItem) => listItem === item);

  const editItemText: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value } }) => {
      const newList = replaceItemAtIndex(todoList, index, {
        ...item,
        text: value,
      });
      setTodoList(newList);
    },
    [index, item, setTodoList, todoList],
  );

  const toggleItemCompletion = useCallback(() => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      isComplete: !item.isComplete,
    });
    setTodoList(newList);
  }, [index, item, setTodoList, todoList]);

  const deleteItem = useCallback(() => {
    const newList = removeItemAtIndex(todoList, index);
    setTodoList(newList);
  }, [index, setTodoList, todoList]);

  return (
    <div>
      <input type="text" value={item.text} onChange={editItemText} />
      <input
        type="checkbox"
        checked={item.isComplete}
        onChange={toggleItemCompletion}
      />
      <button type="button" onClick={deleteItem}>
        X
      </button>
    </div>
  );
};
