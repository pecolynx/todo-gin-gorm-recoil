import React from "react";
import { TodoList } from "./TodoList";
import { useCreateDispatcher } from "./dispatcher";

export const App = () => {
  const dispatcher = useCreateDispatcher();
  return (
    <div className="App">
      <h1>Recoil Example</h1>
      <h2>Learn recoill with simple todo list app</h2>
      <TodoList
        deleteTodo={dispatcher.deleteTodo}
        updateTodo={dispatcher.updateTodo}
      />
    </div>
  );
};
