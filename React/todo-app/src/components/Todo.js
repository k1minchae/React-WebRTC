import React from 'react';
import TodoList from './TodoList';
import { useSelector, useDispatch } from 'react-redux';
import { add } from '../redux/todoSlice';

function Todo() {
  const todo = useSelector((state) => state.todo);
  const [text, setText] = React.useState('');
  const dispatch = useDispatch();

  const handleAdd = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    dispatch(add(text));
    setText('');
    console.log(todo);
  };

  return (
    <div>
      <div className="flex flex-col items-center m-12">
        <h1 className="font-['EFJejudoldam'] text-4xl">
          <span className="text-red-500">T</span>
          <span className="text-green-700">o</span>
          <span className="text-blue-900">d</span>
          <span className="text-green-700">o</span>
          <span>-</span>
          <span className="text-orange-400">L</span>
          <span className="text-blue-900">i</span>
          <span className="text-pink-600">s</span>
          <span className="text-blue-900">t</span>
        </h1>
        <div className="w-[60%] flex flex-col items-center">
          <form className="mt-12 mb-4 w-[60%] flex flex-row justify-center">
            <input
              className="
                width-[100%]
                border-1
                border-dashed
                border-t-0
                border-x-0
                border-b-green-700 mr-4 w-[40%]"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={handleAdd}
              className="bg-yellow-400 p-1 rounded-lg px-2 hover:bg-yellow-500"
              type="submit"
            >
              <span className='font-["Ownglyph"] text-xl'>추가 !</span>
            </button>
          </form>
          <TodoList />
        </div>
      </div>
    </div>
  );
}

export default Todo;
