import React, { useState, useEffect } from "react";
import { commandDict, evaluateCommand } from "./todoDSL";
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

  const gettersAndSetters = {
    todoList: {getter: todoList, setter: setTodoList},
    actionBar: {getter: actionBar, setter: setActionBar},
    settings: {getter: settings, setter: setSettings},
    helpFacet: {getter: helpFacet, setter: setHelpFacet}
  }

  useEffect(() => {
    const fun = () => {
      fetch("https://jsonplaceholder.typicode.com/todos").then(
        (res) => res.json()).then(
          (res) => setTodoList(res)).catch(
            (error) => console.log(error));
    };
    fun();
  }, []);

  /** Event Handlers */

  /**
   * Consumes the id of a todo in my state variablecommandDict todoList and
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
      ? evaluateCommand(actionBar["actionString"], gettersAndSetters)
      : false;
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
        throw Error("blowout in the filter facade");
    }
  }

  /**
   * Consumes a todoList and produces those todos whose userID corresponds
   * to the one specified in the TodoApp's settings.
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

