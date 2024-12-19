import { useCallback, useState } from "react";
import type { ChangeEventHandler, FC } from "react";
import { useSetRecoilState } from "recoil";
import { todoListState } from "./todoListState";

// utility for creating unique Id
let id = 0;
const getId = () => {
  return id++;
};
export const TodoItemCreator: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const setTodoList = useSetRecoilState(todoListState);
  const addItem = useCallback(() => {
    setTodoList((oldTodoList) => [
      ...oldTodoList,
      {
        id: getId(),
        text: inputValue,
        isComplete: false,
      },
    ]);
    setInputValue("");
  }, [inputValue, setTodoList]);
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value } }) => {
      setInputValue(value);
    },
    [],
  );
  return (
    <div>
      <input type="text" value={inputValue} onChange={onChange} />
      <button onClick={addItem}>Add</button>
    </div>
  );
};
