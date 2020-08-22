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

  const [actionBar, setActionBar] = useState({ actionString: ":help" });

  const [settings, setSettings] = useState({
  filter: "(x) => true",
  userId: 1,
  showCompleted: true,
})

  const [helpFacet, setHelpFacet] = useState("")

  const commandDict = {
    help : {
      fun: doHelp, 
      usage: ":help < list-commands | <cmd> | hide >"},
    alert: {
      fun: doAlert, 
      usage: ":alert < [^\"]* >"},
    filter: {
      fun: doFilter, 
      usage: ":filter < lambda(x) -> boolean >"},
    setuser: {
      fun: doSetUser, 
      usage: ":setuser < int > "},
    showcompleted: {
      fun: doShowCompleted, 
      usage: ":showcompleted < boolean >"},
    add: {
      fun: doAdd,
      usage: ":add < [^\"]+ >"},
  }

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

    function validCommandP(str) {
      return Object.keys(commandDict).includes(str)
    }

    const instruction = tokenizeInstruction(str);
    const lexedInstructionOrFalse = parseInstruction(instruction);
    if (!lexedInstructionOrFalse) return;

    const [command, arglist] = lexedInstructionOrFalse;
    if (!validCommandP(command)) return;

    const fun = commandDict[command]["fun"]

    const funWithCleanup = cleanUpDecorator(fun)

    if (command !== "help") setHelpFacet("")

    return fun !== undefined ? 
      funWithCleanup(arglist) :
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

  function doHelp(arglist) {
    setHelpFacet("help")
    return arglist.length === 0 ?
      setHelpFacet('help') :
      setHelpFacet(arglist[0])
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
      <Help
        Facet={helpFacet}
        CommandDict={commandDict}
      />
      <TodoList 
        todos={applyTodoFilters(todoList)} 
        StatusClickHandler={handleStatusClick} />
    </div>
  );
}

function Help(props) {
  const {Facet, CommandDict} = props
  const commands = Object.keys(CommandDict)

  function getHelp(Facet, CommandDict) {
   if (commands.includes(Facet)) {
      return CommandDict[Facet]["usage"]
    } else if (Facet === "list-commands") {
      return getCommandList(CommandDict)
    } else {
      return undefined;
    }
  }

  function getCommandList(CommandDict) {
    return Object.keys(CommandDict).
    sort((a, b) => a[0] < b[0] ? -1 : 1).
    map((key) => CommandDict[key]["usage"])
  }

  const help = getHelp(Facet, CommandDict)

  switch (typeof(help)) {
    case "string":
      return <HelpString Content={help}/>
    case "object":
      return <HelpList ContentList={help} />
    default:
      return null
  }
}

function HelpString(props) {
  const {Content, Key} = props
  return (
    <li className="alert alert-info list-group-item" key={Key}>
    {Content}
    </li>
  )
}

function HelpList(props) {
  const {ContentList} = props
  return (
    <ul className="list-group">
      {ContentList.map(
        (Content, idx) => <HelpString Key={idx} Content={Content}/>)}
    </ul>
  )
}

export function TodoSearch(props) {
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

export function TodoList(props) {
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

export function TodoItem(props) {
  const { details, StatusClickHandler } = props;
  return (
    <li
      className="list-group-item d-flex justify-content-between">
      {details.title}
      <TodoStatus details={details} OnClick={StatusClickHandler} />{" "}
    </li>
  );
}

export function TodoStatus(props) {
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
