import React, { useState } from "react";
import { lexInstruction, parseInstruction } from "./todoDSL"
import "./App.css";

function App() {
  return (
    <div className="App">
      <TodoApp />
    </div>
  );
}

function TodoApp(props) {
  const [todoList, setTodoList] = useState([
    { id: 1, title: "whatever I forgot yesterday", completed: false },
    { id: 2, title: "whatever meant to do today", completed: false },
    { id: 3, title: "the things I never thought I'd do", completed: false },
  ]);

  const [actionBar, setActionBar] = useState({ actionString: ":" });

  function handleStatusClick(id) {
    const todoListCopy = [...todoList];
    const targetItemIdx = todoListCopy.findIndex((x) => x.id === id);
    let targetItemCopy = { ...todoListCopy[targetItemIdx] };
    targetItemCopy.completed = !targetItemCopy.completed;
    todoListCopy[targetItemIdx] = targetItemCopy;
    return setTodoList(todoListCopy);
  }

  function handleActionUpdate(event) {
    const newValue = event.target.value;
    const newState = {actionString: newValue};
    return setActionBar(newState);
  }

  function handleActionKeypress(event) {
    function eventIsEnterKeypress(event) {
      return event.charCode === 13
    }
    return eventIsEnterKeypress(event) ? 
      evaluateCommand(actionBar["actionString"]) :
      null
  }

  function evaluateCommand(str) {
    const commandDict = {
      help : doHelp,
      alert: doAlert,
    }
    const instruction = parseInstruction(str);
    const lexedInstructionOrFalse = lexInstruction(instruction);
    if (!lexedInstructionOrFalse) return;

    const [command, arglist] = lexedInstructionOrFalse;
    const fun = commandDict[command]

    return fun !== undefined ? 
      commandDict[command](arglist) :
      console.log("invalid command")

  }

  function doAlert(args) {
    const message = args.reduce((acc, x) =>  acc + " " + x, "")
    alert(message)
    return
  }

  function doHelp() {
    doAlert(["this will be a help message"]);
  }

  return (
    <div>
      <TodoSearch 
        Value={actionBar} 
        InputHandler={handleActionUpdate} 
        KeypressHandler={handleActionKeypress}/>
      <TodoList todos={todoList} StatusClickHandler={handleStatusClick} />
    </div>
  );
}

function TodoSearch(props) {
  const {Value, InputHandler, KeypressHandler} = props;
  return (
  <input 
    value={Value.actionString} 
    onChange={(e) => InputHandler(e)}
    onKeyPress={(e) => KeypressHandler(e)}
  />)
}

function TodoList(props) {
  const { todos, StatusClickHandler } = props;
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          details={todo}
          StatusClickHandler={StatusClickHandler}
        />
      ))}
    </ul>
  );
}

function TodoItem(props) {
  const { details, StatusClickHandler } = props;
  return (
    <li>
      {details.title}
      <TodoStatus details={details} OnClick={StatusClickHandler} />{" "}
    </li>
  );
}

function TodoStatus(props) {
  const { details, OnClick } = props;
  return (
    <button onClick={() => OnClick(details.id)}>
      {details.completed ? "✔" : "✗"}
    </button>
  );
}

export default App;
