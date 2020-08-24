import React from "react";
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
