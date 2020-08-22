import React, { useState, useEffect } from "react";
import { parseInstruction, tokenizeInstruction } from "./todoDSL";
import "./App.css";

function App() {
  return (
    <div className="App">
      <TodoApp />
    </div>
  );
}

/**
 * Consumes props and produces a React element representing a Todo app.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
function TodoApp(props) {
  const [todoList, setTodoList] = useState([]);

  const [actionBar, setActionBar] = useState({ actionString: ":help" });

  const [settings, setSettings] = useState({
    filter: "(x) => true",
    userId: 1,
    showCompleted: true,
  });

  const [helpFacet, setHelpFacet] = useState("");

  useEffect(() => {
    const fun = () => {
        fetch("https://jsonplaceholder.typicode.com/todos").then(
          (res) => res.json()).then(
            (res) => setTodoList(res)).catch(
              (error) => console.log(error))};
    fun();
  }, []);

  // note that every command should return 'true' if it succeeds, 'false' otherwise.
  const commandDict = {
    help: {
      fun: doHelp,
      usage: ":help < list-commands | <cmd> | hide >",
    },
    alert: {
      fun: doAlert,
      usage: ':alert < [^"]* >',
    },
    filter: {
      fun: doFilter,
      usage: ":filter < lambda(x) -> boolean >",
    },
    setuser: {
      fun: doSetUser,
      usage: ":setuser < int > ",
    },
    showcompleted: {
      fun: doShowCompleted,
      usage: ":showcompleted < boolean >",
    },
    add: {
      fun: doAdd,
      usage: ':add < [^"]+ >',
    },
  };

  /**
   * Consumes the id of a todo in my state variable todoList and
   * returns a copy of the todoList with the "completed" status of
   * the corresponding todo inverted. As a side-effect, modifies
   * the corresponding global state.
   * ASSUMES that the todo exists!
   *
   * @param {number} id
   * @modifies {{todoList}}
   * @return {Array<Object>}
   */
  function handleStatusClick(id) {
    const todoListCopy = [...todoList];
    const targetItemIdx = todoListCopy.findIndex((x) => x.id === id);
    let targetItemCopy = { ...todoListCopy[targetItemIdx] };
    targetItemCopy.completed = !targetItemCopy.completed;
    todoListCopy[targetItemIdx] = targetItemCopy;
    setTodoList(todoListCopy);
    return todoList;
  }

  /**
   * consumes an Event and returns an `actionBar`
   * corresponding to it. As a side-effect, sets the global
   * state variable `actionBar` to this value.
   *
   * @param {Event} event
   * @modifies: {actionBar}
   * @return {Object}
   */
  function handleActionUpdate(event) {
    const newValue = event.target.value;
    const newState = { actionString: newValue };
    setActionBar(newState);
    return newState;
  }

  /**
   * Consumes an Event and attempts to evaluate whatever
   * string is in the actionBar as a todoDSL expression.
   * If this is successful, returns true; if it's unsuccessful,
   * return false. As a side-effect, if the string was a valid
   * expression, whatever its side-effects are will take place.
   *
   * @param {Event} event
   * @modifies {Tons of stuff}
   * @return {boolean}
   */
  function handleActionKeypress(event) {
    function eventIsEnterKeypress(event) {
      return event.charCode === 13;
    }
    return eventIsEnterKeypress(event)
      ? evaluateCommand(actionBar["actionString"])
      : false;
  }

  /**
   * consumes a strings which may or may not be a valid todoDSL expression.
   * if it's a valid expression and it executes successfully,  produces `true`;
   * if not, produces `false`. As a side effect, can do anything todoDSL can do.
   *
   * @param {string} str
   * @modifies {tons of stuff}
   * @return {boolean}
   */
  function evaluateCommand(str) {
    function cleanUpDecorator(func) {
      setActionBar({ actionString: ":" });
      return func;
    }

    function validCommandP(str) {
      return Object.keys(commandDict).includes(str);
    }

    const instruction = tokenizeInstruction(str);
    const lexedInstructionOrFalse = parseInstruction(instruction);
    if (!lexedInstructionOrFalse) return false;

    const [command, arglist] = lexedInstructionOrFalse;
    if (!validCommandP(command)) return false;

    const fun = commandDict[command]["fun"];

    const funWithCleanup = cleanUpDecorator(fun);

    if (command !== "help") setHelpFacet("");

    return fun !== undefined ? funWithCleanup(arglist) : false;
  }

  /** doAdd
   * todoDSL command. Consumes an array of strings and produces a
   * new todoList with a new todo whose title corresponds to that array
   * of strings. As a side-effect, it updates the todoList State.
   *
   * @param {Array<String>} arglist
   * @modifies {todoList}
   * @return {Array<Todo>}
   */
  function doAdd(arglist) {
    //TODO upgrade todoDSL so it can handle quoted strings!
    const newContent = arglist.join(" ");

    // WARNING/TODO dangerous assumption: we assume that we can never
    // delete todos, and that all users share the same state.
    // This is functionality that should be governed
    // by a database, but in the meantime...
    const nextId = todoList.length + 1;

    const newTodo = {
      id: nextId,
      title: newContent,
      completed: false,
      userId: settings.userId,
    };

    let todoListCopy = todoList.slice();
    todoListCopy.push(newTodo);
    setTodoList(todoListCopy);
    return true;
  }

  /** doShowCompleted
   * todoDSL command. consumes an array of strings and produces a copy
   * of the Settings state object in which `showCompleted` is set to the
   * boolean value represented by arglist[0]. As a side-effect, updates
   * Settings with the new object.
   *
   * @param {Array<string>} arglist
   * @modifies{settings}
   * @return {Object}
   */
  function doShowCompleted(arglist) {
    const [doOrDoNot, ...rest] = arglist;
    let settingsCopy = { ...settings };
    settingsCopy["showCompleted"] = doOrDoNot === "true";
    setSettings(settingsCopy);
    return settingsCopy;
  }

  /** doHelp
   * todoDSL command. consumes an array of strings `arglist`
   * and produces the corresponding helpFacet value.
   * As a side-effect, updates helpFacet with this value.
   * Note that this can set the helpFacet to nonsense; this is
   * intended behaviour.
   *
   * @param {Array<string>} arglist
   * @modifies {helpFacet}
   * @return {string}
   */
  function doHelp(arglist) {
    const res = arglist.length === 0 ? "help" : arglist[0];
    setHelpFacet(res);
    return res;
  }

  /**
   * consumes an array of strings `arglist` and produces the
   * message that they represent. as a sideeffect, fires an
   * alert with this message.
   *
   * @param {Array<string>} arglist
   * @return {string}
   */
  function doAlert(arglist) {
    const message = arglist.reduce((acc, x) => acc + " " + x, "");
    alert(message);
    return message;
  }

  /*
   * Consumes an array of strings `arglist` and produces a copy of the global
   * state object `settings` in which the userId has been set to `arglist[0]`.
   * ASSUMES that `arglist[0]` is a valid input for parseInt. As a side-effect,
   * updates `settings` with the new object.
   *
   * @param {Array<string>} arglist
   * @modifies {settings}
   * @return {Object}
   */
  function doSetUser(arglist) {
    const [userId, ...rest] = arglist;
    let settingsCopy = { ...settings };
    settingsCopy["userId"] = parseInt(userId);
    setSettings(settingsCopy);
    return settingsCopy;
  }

  /**
   * Consumes an array of strings `arglist` and produces a copy of the global
   * state variable `settings` in which the key `filter` has as a value the predicate
   * reporesented by the arglist. As a side-effect, updates `settings` with the new object.
   *
   * example:
   * doFilter(["(x)", "=>", "x.completed"]) -> (x) => x.completed
   * @param {Array<string>} arglist
   * @modifies {settings}
   * @return {Object}
   */
  function doFilter(arglist) {
    const predicate = arglist.join(" ");
    let settingsCopy = { ...settings };
    settingsCopy["filter"] = predicate;
    return setSettings(settingsCopy);
  }
  /**
   * consumes a todoList and a function, OR a string representing
   * a function, and applies the function to the todolist as a filter,
   * returning the resulting subset.
   *
   * @param {Array<Todo>} todoList
   * @param { Function | String }
   * @return {Array<Todo>}
   */
  function arbitraryFilterTodos(todoList) {
    const filterStringOrFunc = settings["filter"];
    switch (typeof filterStringOrFunc) {
      case "string":
        return todoList.filter(eval(filterStringOrFunc));
      case "function":
        return todoList.filter(filterStringOrFunc);
      default:
        throw "blowout in the filter facade";
    }
  }

  /**HelpStringed in the global
   * state variable `settings`.
   *
   * @param {Array<todo>} todoList
   * @return {Array<todo>}
   */
  function userFilterTodos(todoList) {
    return todoList.filter((x) => x.userId === settings.userId);
  }

  /**
   * consumes a todoList and produces the subset of its members
   * given the value of the state variable `settings.showCompleted`.
   *
   * @param {Array<todo>} todoList
   * @param {Boolean} bool
   * @return {Array<todo>}
   */
  function statusFilterTodos(todoList) {
    return todoList.filter((x) => settings.showCompleted || !x.completed);
  }

  /**
   * consumes a todoList and applies every filter to it. returns the filtered todolist.
   *
   * @param {Array<todo>} todoList
   * @return {Array<todo>}
   */
  function applyTodoFilters(todoList) {
    return arbitraryFilterTodos(statusFilterTodos(userFilterTodos(todoList)));
  }

  return (
    <div>
      <TodoSearch
        Value={actionBar}
        InputHandler={handleActionUpdate}
        KeypressHandler={handleActionKeypress}
      />
      <Help Facet={helpFacet} CommandDict={commandDict} />
      <TodoList
        todos={applyTodoFilters(todoList)}
        StatusClickHandler={handleStatusClick}
      />
    </div>
  );
}

/**
 * Consumes props and produces a React element representing a Help interface,
 * or null if no interface can be found.
 *
 * @param {Object} props
 * @return {Symbol(react.element) | null }
 */
function Help(props) {
  const { Facet, CommandDict } = props;
  const commands = Object.keys(CommandDict);

  /**
   * consumes Facet, a string representing the part of the help system
   * to fetch, and commandDict, an object representing all of the valid
   * todoDSL commands, and produces the appropriate piece of help.
   *
   * @param {string} Facet
   * @param {Object} CommandDict
   * @return { string || Array<string> || undefined }
   */
  function getHelp(Facet, CommandDict) {
    if (commands.includes(Facet)) {
      return CommandDict[Facet]["usage"];
    } else if (Facet === "list-commands") {
      return getCommandList(CommandDict);
    } else {
      return undefined;
    }
  }

  /**
   * Consumes an object whose keys are all valid todoDSL commands,
   * and produces an array whose members are the usage instructions
   * for those commands.
   *
   * @param {Object} CommandDict
   * @return {Array<string>}
   */
  function getCommandList(CommandDict) {
    return Object.keys(CommandDict)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map((key) => CommandDict[key]["usage"]);
  }

  const help = getHelp(Facet, CommandDict);

  switch (typeof help) {
    case "string":
      return <HelpString Content={help} />;
    case "object":
      return <HelpList ContentList={help} />;
    default:
      return null;
  }
}

/**
 * Consumes an object `props` and produces a React element representing a piece
 * of help.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
function HelpString(props) {
  const { Content, Key } = props;
  return (
    <li className="alert alert-info list-group-item" key={Key}>
      {Content}
    </li>
  );
}

/**
 * Consumes an object `props` and produces a React element representing an
 * array of pieces of help.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
function HelpList(props) {
  const { ContentList } = props;
  return (
    <ul className="list-group">
      {ContentList.map((Content, idx) => (
        <HelpString Key={idx} Content={Content} />
      ))}
    </ul>
  );
}

/**
 * Consumes an object `props` and produces a React element representing an
 * input area used for interacting with the TodoApp
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
export function TodoSearch(props) {
  const { Value, InputHandler, KeypressHandler } = props;
  return (
    <input
      type="text"
      className="form-control"
      value={Value.actionString}
      onChange={(e) => InputHandler(e)}
      onKeyPress={(e) => KeypressHandler(e)}
    />
  );
}

/**
 * Consumes an object `props` and produces a React element representing a
 * list of Todos
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
export function TodoList(props) {
  const { todos, StatusClickHandler } = props;
  return (
    <ul className="list-group">
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

/**
 * Consumes an object `props` and produces a React element representing a
 * single Todo
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
export function TodoItem(props) {
  const { details, StatusClickHandler } = props;
  return (
    <li className="list-group-item d-flex justify-content-between">
      {details.title}
      <TodoStatus details={details} OnClick={StatusClickHandler} />{" "}
    </li>
  );
}

/**
 * Consumes an object `props` and produces a React element representing the
 * status of a todo
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
export function TodoStatus(props) {
  const { details, OnClick } = props;
  return (
    <button
      type="button"
      className="btn btn-light"
      onClick={() => OnClick(details.id)}
    >
      {details.completed ? "✔" : "✗"}
    </button>
  );
}

export default App;
