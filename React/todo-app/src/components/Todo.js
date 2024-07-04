import TodoList from './TodoList';
function Todo() {
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
        <TodoList />
      </div>
    </div>
  );
}

export default Todo;
