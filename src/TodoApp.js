import React, { useState, useEffect } from "react";
import { parseInstruction, tokenizeInstruction } from "./todoDSL";
import { Help } from "./Help";
import { TodoList } from "./TodoList";

/**
 * Consumes props and produces a React element representing a Todo app.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
export function TodoApp(props) {
  const [todoList, setTodoList] = useState([]);

  const [actionBar, setActionBar] = useState({ actionString: ":help" });

  const [settings, setSettings] = useState({
    filter: "(x) => true",
    userId: 1,
    showPredicate: (x) => !x.completed,
  });

  const [helpFacet, setHelpFacet] = useState("");

  useEffect(() => {
    const fun = ()help => {
      fetch("https://jsonplaceholder.typicode.com/todos").then(
        (res) => res.json()).then(
          (res) => setTodoList(res)).catch(
            (error) => console.log(error));
    };
    fun();
  }, []);

  /** Event Handlers */

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

  /** SUPPLEMENTARY CODE FOR todoDSL. 
   * TODO: how can I refactor this out of TodoApp? I want it in todoDSL, but it has
   * these calls to the various state Hooks...
   */

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
    show: {
      fun: doShow,
      usage: ":show < completed | todo | all >",
    },
    add: {
      fun: doAdd,
      usage: ':add < [^"]+ >',
    },
  };

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
    if (!lexedInstructionOrFalse)
      return false;

    const [command, arglist] = lexedInstructionOrFalse;
    if (!validCommandP(command))
      return false;

    const fun = commandDict[command]["fun"];

    const funWithCleanup = cleanUpDecorator(fun);

    if (command !== "help")
      setHelpFacet("");

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

  /** doShow
   * todoDSL command. consumes an array of strings `arglist` and produces a copy
   * of the Settings state object in which `showFilter` is set to a predicate
   * corresponding semantically to arglist[0]. As a side-effect, updates
   * Settings with the new object.
   *
   * @param {Array<string>} arglist
   * @modifies{settings}
   * @return {Object}
   */
  function doShow(arglist) {
    const predDict = {
      all: (x) => true,
      completed: (x) => x.completed,
      todo: (x) => !x.completed
    };
    const predicate = predDict[arglist];
    if (predicate === undefined)
      return false;

    let settingsCopy = { ...settings };
    settingsCopy["showPredicate"] = predicate;
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
        KeypressHandler={handleActionKeypress} />
      <Help Facet={helpFacet} CommandDict={commandDict} />
      <TodoList
        todos={applyTodoFilters(todoList)}
        StatusClickHandler={handleStatusClick} />
    </div>
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
      onKeyPress={(e) => KeypressHandler(e)} />
  );
}

