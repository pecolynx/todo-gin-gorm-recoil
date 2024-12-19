import { useCallback, useState } from "react";
import type { ChangeEventHandler } from "react";
import { useSetRecoilState } from "recoil";
import { todoListState } from "./todoListState";

import { useCreateDispatcher } from "./dispatcher";

// utility for creating unique Id
let id = 0;
const getId = () => {
  return id++;
};

export const TodoItemCreator = (): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const setTodoList = useSetRecoilState(todoListState);
  const dispatcher = useCreateDispatcher();

  //   const addItem = useCallback(() => {
  //     setTodoList((oldTodoList) => [
  //       ...oldTodoList,
  //       {
  //         id: getId(),
  //         text: inputValue,
  //         isComplete: false,
  //       },
  //     ]);
  //     setInputValue("");
  //   }, [inputValue, setTodoList]);

  const addItem = () => {
    dispatcher.addTodo(inputValue, () => {
      setInputValue("");
    });
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value } }) => {
      setInputValue(value);
    },
    [],
  );

  return (
    <div>
      <input type="text" value={inputValue} onChange={onChange} />
      <button type="button" onClick={addItem}>
        Add
      </button>
    </div>
  );
};
