import React, { useState, useEffect } from 'react';

function TodoList() {
  const [today, setToday] = useState('');
  const tasks = [
    'React 문서 읽기',
    'Tailwind CSS 연습하기',
    '스터디 과제 완료하기',
    '알고리즘 문제 풀이',
    'GitHub에 코드 푸시하기',
  ];

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

  return (
    <div className="my-12">
      <h1 className="font-['Ownglyph'] text-2xl text-center">{today}</h1>
      <ul className="my-4 w-[60vh]">
        {tasks.map((task, index) => (
          <li key={index} className='font-["Ownglyph"] text-xl flex items-center mt-1'>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-500"
                style={{ accentColor: 'green' }}
              />
              <span className="ml-2">{task}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
