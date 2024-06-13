import { useState, useEffect } from "react";

function CoinTracker() {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  useEffect(() => {
    fetch("https://api.coinpaprika.com/v1/tickers")
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log("성공");
        setCoins(json);
        setLoading(false);
      });
  }, []);
  return (
    <div>
      <h1>The Coins! ({coins.length})</h1>
      {loading ? <strong>Loading...</strong> : null}
      <ul>
        {coins.map((coin, index) => (
          <li key={index}>{coin.name}</li>
        ))}
      </ul>
    </div>
  );
}

function TodoApp() {
  const [toDo, setTodo] = useState("");
  const [toDos, setTodos] = useState([]);
  const onChange = (event) => {
    setTodo(event.target.value);
  };
  const onSubmit = (event) => {
    event.preventDefault();
    // 빈 칸이라면 저장 안 하고 return
    if (toDo === "") {
      return;
    }
    // toDo = "" 이렇게 하면 안 됨! (직접수정 X)
    // 전개구문으로 작성해서 넣어야함
    setTodo("");
    setTodos((currentArray) => [toDo, ...currentArray]);
  };
  // console.log(toDos);
  // console.log(toDos.map((item, index) => <li key={index}>{item}</li>));
  return (
    <div>
      <h3>Todo App</h3>
      <form onSubmit={onSubmit}>
        <input
          onChange={onChange}
          value={toDo}
          type="text"
          placeholder="할 일"
        ></input>
        <button>Add To Do</button>
      </form>
      <hr />
      <ul>
        {toDos.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <p>할 일이 {toDos.length} 개 있습니다.</p>
    </div>
  );
}

function Hello() {
  useEffect(() => {
    console.log("Create Component");
    return () => {
      console.log("Destroy Component");
    };
  }, []);
  return <h1>Hello</h1>;
}
function Cleanup() {
  const [showing, setShowing] = useState(false);
  const onClick = () => {
    setShowing((prev) => !prev);
  };
  return (
    <div>
      <h3>About Cleanup</h3>
      {showing ? <Hello /> : null}
      <button onClick={onClick}>{showing ? "hide" : "show"}</button>
    </div>
  );
}

function App() {
  const [keyWord, setKeyword] = useState("");
  const [counter, setValue] = useState(0);
  const onChange = (event) => {
    setKeyword(event.target.value);
  };
  const onClick = () => {
    setValue((prev) => prev + 1);
  };
  console.log("항상 실행되는 코드");

  // keyWord 가 변할 때만 함수 실행 => keyword 를 지켜본다
  useEffect(() => {
    if (keyWord !== "" && keyWord.length > 5) {
      console.log("검색어 변경될때만 실행 : ", keyWord);
    }
  }, [keyWord]);
  return (
    <div>
      <h1>리액트 짱</h1>
      <input
        value={keyWord}
        onChange={onChange}
        placeholder="Search here ..."
      ></input>
      <br />
      <p>{counter} 만큼 눌렀어</p>
      <button onClick={onClick}>눌러보자</button>
      <hr />
      <Cleanup />
      <hr />
      <TodoApp />
      <hr />
      <CoinTracker />
    </div>
  );
}

export default App;
