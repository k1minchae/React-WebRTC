import { useState, useEffect } from "react";

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
      <br></br>
      <p>{counter} 만큼 눌렀어</p>
      <button onClick={onClick}>눌러보자</button>
      <hr></hr>
      <Cleanup />
    </div>
  );
}

export default App;
