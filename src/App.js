import React, { useState } from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <TodoApp />
    </div>
  );
}

function TodoApp(props) {
  const [todoList, setTodoList] = useState([
    {id: 1, title:"whatever I forgot yesterday", completed:false},
    {id: 2, title:"whatever meant to do today", completed: false},
    {id: 3, title:"the things I never thought I'd do", completed: false}
  ])

  function handleStatusClick(id) {
    const todoListCopy = [...todoList];
    const targetItemIdx = todoListCopy.findIndex((x) => x.id === id);
    let targetItemCopy = { ... todoListCopy[targetItemIdx]}
    targetItemCopy.completed = !targetItemCopy.completed;
    todoListCopy[targetItemIdx] = targetItemCopy;
    return setTodoList(todoListCopy);

  }
  return (
    <div>
    <TodoSearch />
    <TodoList todos={todoList} StatusClickHandler={handleStatusClick}/>
    </div>
  )
}

function TodoSearch(props) {
  return (
    <input />
  )
}

function TodoList(props) {
  const {todos, StatusClickHandler} = props;
  return (
    <ul>
    {
      todos.map((todo) => <TodoItem details={todo} StatusClickHandler={StatusClickHandler}/>)
    }
    </ul>
  )
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
  const {details, OnClick} = props;
  return (
  <button onClick={() => OnClick(details.id)}>
    {details.completed ? "✔" : "✗"}
  </button>
    )
}

export default App;
