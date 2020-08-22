import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";

import { TodoStatus, TodoItem, TodoList } from "./App";

let container = null;

// data examples

// A Todo is an object

const todo1 = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};
const todo2 = {
  userId: 1,
  id: 2,
  title: "quis ut nam facilis et officia qui",
  completed: true,
};
const todo3 = {
  userId: 1,
  id: 3,
  title: "fugiat veniam minus",
  completed: false,
};
const todo4 = {
  userId: 2,
  id: 4,
  title: "nemo perspiciatis repellat ut dolor libero commodi blanditiis omnis",
  completed: true,
};

// A TodoList is a list of Todos

const todoListOneUser = [todo1, todo2, todo3];
const todoListTwoUsers = [todo1, todo2, todo3, todo4];

// all callbacks in the following tests are the identity function,
// because we're not testing bubbling-state yet.
const identity = (x) => x;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("TodoStatus unit tests", () => {
  it("renders a ✔ when the task is completed", () => {
    act(() => {
      render(<TodoStatus details={todo2} onClick={identity} />, container);
    });

    expect(container.textContent).toBe("✔");
  });

  it("renders a ✗ when the task is incomplete", () => {
    act(() => {
      render(<TodoStatus details={todo1} onClick={identity} />, container);
    });
    expect(container.textContent).toBe("✗");
  });
});

describe("TodoItem unit tests", () => {
  it("has a title corresponding to its detailsProp", () => {
    act(() => {
      render(
        <TodoItem details={todo1} StatusClickHandler={identity} />,
        container
      );
    });
    expect(container.childNodes[0].textContent).toMatch(todo1.title);
  });
});

describe("TodoList unit tests", () => {
  it("renders whatever todos it's sent", () => {
    act(() => {
      render(
        <TodoList todos={todoListTwoUsers} statusClickHandler={identity} />,
        container
      );
    });
    expect(container.childNodes.length === todoListOneUser.length);
  });
});
