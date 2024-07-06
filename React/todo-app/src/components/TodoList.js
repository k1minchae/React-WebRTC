import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { remove } from '../redux/todoSlice';

function TodoList() {
  const [today, setToday] = useState('');

  const currentDate = () => {
    const date = new Date();
    const months = String(date.getMonth() + 1).padStart(2, '0');
    const days = String(date.getDate()).padStart(2, '0');
    const years = String(date.getFullYear());
    setToday(`${years}년 ${months}월 ${days}일`);
  };

  useEffect(() => {
    currentDate();
  }, []);

  const todo = useSelector((state) => state.todo);
  const dispatch = useDispatch();
  const handleRemove = (e) => {
    const id = parseInt(e.target.parentNode.id);
    dispatch(remove(id));
    console.log(id);
  };

  return (
    <div className="">
      <h1 className="font-['Ownglyph'] text-2xl text-center">{today}</h1>
      <ul className="my-4 w-[100%]">
        {todo.map(({ text, id }) => (
          <li key={id} id={id} className='font-["Ownglyph"] text-xl flex items-center mt-1'>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-500"
                style={{ accentColor: 'green' }}
              />
              <span className="ml-2">{text}</span>
            </label>
            <button className="ml-auto" onClick={handleRemove}>
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
