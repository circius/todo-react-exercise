import React, { useState } from "react";
import { parseInstruction, tokenizeInstruction } from "./todoDSL"
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
    { id: 1, title: "whatever I forgot yesterday", completed: false, userId: 1 },
    { id: 2, title: "whatever meant to do today", completed: false, userId: 1 },
    { id: 3, title: "the things I never thought I'd do", completed: false, userId: 1 },
    { id: 4, title: "my first thought on the matter", completed: false, userId: 2},
    { id: 5, title: "not my finest work", completed: false, userId: 2}
  ]);

  const [actionBar, setActionBar] = useState({ actionString: ":" });

  const [settings, setSettings] = useState({
  filter: "(x) => true",
  userId: 1,
  showCompleted: true,
})

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
    function cleanUpDecorator(func){
      setActionBar({ actionString : ":" })
      return func
    }
    
    const instruction = tokenizeInstruction(str);
    const lexedInstructionOrFalse = parseInstruction(instruction);
    if (!lexedInstructionOrFalse) return;

    const [command, arglist] = lexedInstructionOrFalse;
    const fun = commandDict[command]

    return fun !== undefined ? 
      cleanUpDecorator(commandDict[command](arglist)) :
      console.log("invalid command")
  }

  function doAdd(arglist) {
    //TODO upgrade todoDSL so it can handle quoted strings!
    const newContent = arglist.join(" ")

    // WARNING/TODO dangerous assumption: we assume that we can never
    // delete todos. This is functionality that should be governed
    // by a database, but in the meantime...
    const nextId = todoList.length + 1

    const newTodo = {
      id: nextId, title: newContent, completed: false, userId: settings.userId
    }

    let todoListCopy = todoList.slice()
    todoListCopy.push(newTodo)
    return setTodoList(todoListCopy)
  }

  function doShowCompleted(arglist) {
    const [doOrDoNot, ...rest] = arglist
    let settingsCopy = {...settings}
    settingsCopy["showCompleted"] = doOrDoNot === "true"
    return setSettings(settingsCopy)
  }

  function doHelp() {
    doAlert(["this will be a help message"]);
  }

  function doAlert(args) {
    const message = args.reduce((acc, x) =>  acc + " " + x, "")
    alert(message)
  }

  function doSetUser(arglist) {
    const [userId, ...rest] = arglist
    let settingsCopy = {...settings}
    settingsCopy["userId"] = parseInt(userId)
    return setSettings(settingsCopy)
  }

  function doFilter(arglist) {
    const predicate = arglist.join(" ")
    let settingsCopy = {...settings}
    settingsCopy["filter"] = predicate
    return setSettings(settingsCopy)
  }

  function arbitraryFilterTodos(todoList) {
    const filterStringOrFunc = settings["filter"]
    switch(typeof(filterStringOrFunc)){
      case "string":
        return todoList.filter(eval(filterStringOrFunc));
      case "function":
        return todoList.filter(filterStringOrFunc);
      default:
        console.log("blowout in the filter facade")
        return
    }
  }

  function userFilterTodos(todoList) {
    return todoList.filter((x) => x.userId === settings.userId )
  }

  function statusFilterTodos(todoList) {
        return settings.showCompleted ? 
      todoList : 
      todoList.filter((x) => x.completed === false)
  }

  function applyTodoFilters(todoList) {
    return arbitraryFilterTodos(
            statusFilterTodos(
            userFilterTodos(todoList)))
  }

  return (
    <div>
      <TodoSearch 
        Value={actionBar} 
        InputHandler={handleActionUpdate} 
        KeypressHandler={handleActionKeypress}/>
      <TodoList 
        todos={applyTodoFilters(todoList)} 
        StatusClickHandler={handleStatusClick} />
    </div>
  );
}

function TodoSearch(props) {
  const {Value, InputHandler, KeypressHandler} = props;
  return (
  <input
    type="text"
    className="form-control" 
    value={Value.actionString} 
    onChange={(e) => InputHandler(e)}
    onKeyPress={(e) => KeypressHandler(e)}
  />)
}

function TodoList(props) {
  const { todos, StatusClickHandler } = props;
  return (
    <ul
      className="list-group">
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
    <li
      className="list-group-item d-flex justify-content-between">
      {details.title}
      <TodoStatus details={details} OnClick={StatusClickHandler} />{" "}
    </li>
  );
}

function TodoStatus(props) {
  const { details, OnClick } = props;
  return (
    <button
      type="button" 
      className="btn btn-light"
      onClick={() => OnClick(details.id)}>
      {details.completed ? "✔" : "✗"}
    </button>
  );
}

export default App;
