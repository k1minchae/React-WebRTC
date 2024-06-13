## 리액트 프로젝트 만들기

이전까지는 cdn 방식으로 script 를 import 해서 사용했지만 이제부터는 npx 패키지를 통해 리액트 프로젝트를 생성해서 사용 !

```
npx create-react-app my-app
cd my-app
npm start
```

=> 초기세팅은 Vue 와 별다를 게 없군 ,,,
<br>
<br>

### Prop-types 설치

```
$ npm i prop-types
$ npm install --global yarn
$ yarn add prop-types
```

<br>
<br>

**적용하기**

```javascript
import PropTypes from "prop-types";
function Button({ text }) {
  return <button>{text}</button>;
}
Button.propTypes = {
  text: PropTypes.string.isRequired,
};
export default Button;
```

<br>
<br>

### 특정 컴포넌트에만 CSS 적용하기

1. src 폴더에 Button.module.css 를 만든다
2. 해당 파일에 CSS 를 작성한다 (예시 btn 클래스를 만들어 CSS 스타일을 작성)
3. Button 컴포넌트에서 <code>import styles from "./Button.module.css";</code>를 한다.
4. 속성을 추가한다 <code>className={Styles.btn}</code>

=> 이렇게 모듈을 통해 css 스타일을 추가하면 이름이 겹치는 걸 고민하지 않아도 된다 ! 다른 모듈에서 같은 class이름을 사용해도 괜찮음

<br>
<hr>

### useState 의 문제점

```javascript
import { useState } from "react";
function App() {
  const [counter, setValue] = useState(0);
  const onClick = () => {
    setValue((current) => current + 1);
  };
  console.log("API를 불러온다면?? render 1번만 하고싶어");
  return (
    <div>
      <h1>리액트 좋아요</h1>
      <button onClick={onClick}>눌러보자</button>
      <p>{counter} 만큼 눌렀어</p>
    </div>
  );
}

export default App;
```

- API를 불러올 때는 state 값의 변화가 있더라도 계속 render 하고싶지 않을 수가 있다.
- 그런데 지금 useState 를 사용하면 계속계속 re-render 되어버림 ㅠㅠ

<br>
<br>

### 문제가 되는 상황

```javascript
import { useState, useEffect } from "react";

function App() {
  const [keyWord, setKeyword] = useState("");
  const [counter, setValue] = useState(0);
  const onChange = (event) => {
    setKeyword(event.target.value);
  };
  const onClick = () => {
    setValue((current) => current + 1);
  };
  console.log("항상 실행되는 코드");
  console.log("항상 실행 : ", keyWord);

  // keyWord 가 변할 때만 함수 실행 => keyword 를 지켜본다
  useEffect(() => {
    console.log("검색어 변경될때만 실행 : ", keyWord);
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
    </div>
  );
}

export default App;
```

- <code>console.log("항상 실행 : ", keyWord);</code>는 키워드가 변경되지 않았는데도 클릭 이벤트 발생으로 인해 컴포넌트가 재 렌더링 될 때 자꾸 실행된다
- 그렇지 않기 위해 useEffect 를 사용하는 거임!!

<br>
<br>

## useEffect 사용하기

- useEffect(function, [])
  - 두번째 인자로는 array 를 넣는다. array 에 들어있는 값을 지켜보고 해당 값이 변할때만 첫번째 인자인 function 을 실행한다
  - 빈 리스트를 넣으면 딱 한 번만 실행되고 더이상 실행되지 않음
  - 이거 완전 Vue 의 watch가 생각나는 기능이자나

<br>

```javascript
useEffect(() => {
  if (keyWord !== "" && keyWord.length > 5) {
    console.log("검색어 변경될때만 실행 : ", keyWord);
  }
}, [keyWord]);
```

- if 문을 사용해서 추가 조건을 넣을 수 있다 !

<br>
<br>

### Clean up

```javascript
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
```

- 이렇게 코드를 짜면 null 과 Hello 컴포넌트가 토글된다.
- Hello 가 show 될때마다 component 를 새로 생성하고 null 로 변할 때마다 없애버린다
- 컴포넌트를 없애버릴 때는 return 에 들어있는 함수가 실행된다!
- component 가 없어질 때 분석결과를 보내야 하는 경우 유용하게 쓰일 수 있음
- 컴포넌트가 언제 생성되고 삭제됐는지 쉽게 알 수 있다 !

<br>
<br>

### 렌더링이 자꾸 두번씩 되는 이유

자꾸 콘솔에 2개씩 찍히길래 이상함을 느끼고 찾아보니깐 ...

```javascript
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
```

- index.js 에 있는 StrictMode 때문이었다 !!
- 개발 중 이중 렌더링으로 버그를 쉽게 발견하라고 만들어진 기능이라고 하네요,,
- 추가적인 기능이 더 있는 거 같지만 아직은 패스 !
