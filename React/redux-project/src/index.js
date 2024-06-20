import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createStore } from "redux";

const input = document.querySelector("#input");
const form = document.querySelector("#form");
const ul = document.querySelector("ul");

const ADD_TODO = "ADD_TODO";
const DELETE_TODO = "DELETE_TODO";

const addTodo = (text) => {
  return { type: ADD_TODO, text, id: Date.now() };
};
const dispatchAddTodo = (text) => {
  todoStore.dispatch(addTodo(text));
};

const deleteTodo = (id) => {
  return {
    type: DELETE_TODO,
    id,
  };
};
const dispatchDeleteTodo = (event) => {
  const id = parseInt(event.target.parentNode.id);
  todoStore.dispatch(deleteTodo(id));
};

// Reducer
const todoModifier = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [{ id: action.id, text: action.text }, ...state];
    case DELETE_TODO:
      // mutate 하지 않기 위해 splice 가 아닌 filter 를 사용한다.
      const toDos = state.filter((toDo) => toDo.id !== action.id);
      return toDos;
    default:
      return state;
  }
};

const todoStore = createStore(todoModifier);
// Todo 목록을 화면에 나타냄
const paintTodos = () => {
  const toDos = todoStore.getState();
  ul.innerHTML = "";
  toDos.forEach((toDo) => {
    const li = document.createElement("li");
    const delBtn = document.createElement("button");
    delBtn.innerText = "X";
    li.id = toDo.id;
    li.innerText = toDo.text;
    ul.appendChild(li);
    li.appendChild(delBtn);
    delBtn.addEventListener("click", dispatchDeleteTodo);
  });
};
todoStore.subscribe(paintTodos);

// todo를 입력하고 submit 버튼을 눌렀을 때 작동
const onSubmit = (event) => {
  event.preventDefault();
  const toDo = input.value;
  input.value = "";
  dispatchAddTodo(toDo);
};
form.addEventListener("submit", onSubmit);
