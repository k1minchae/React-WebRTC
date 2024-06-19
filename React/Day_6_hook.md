## git pages

```
$ npm i gh-pages
$ npm run build


// package.json

// 마지막에 이거 추가
"hompage" : "https//k1minchae.github.io/TIL"

// script 부분에 이 두개 추가
    "deploy": "gh-pages -d build",
    "predeploy": "npm run build"
$ npm run deploy
```

- build 명령어를 통해 내가 짠 코드를 최적화 해준다.
- script 부분에 해당 코드를 추가하면 명령어 하나만 입력해도 자동으로 그 다음 명령어 입력해줌

<br>

## React Hook

- 리액트 훅은 리액트 클래스형 컴포넌트에서 이용하던 코드를 작성할 필요없이 함수형 컴포넌트에서 다양한 기능을 사용할 수 있게 만들어주는 라이브러리
  (원래는 함수형 component 에 state를 사용할 수 없었다.)
- class component 를 사용하면 this 와 render 를 고려해야 하지만, 함수형 컴포넌트를 쓸 경우엔 신경쓰지 않아도 된다.
- 규칙

  1. 최상위에서만 Hook을 호출해야한다.

     반복문이나 조건문 혹은 중첩된 함수 내에서 Hook을 호출하면 안된다.
     리액트 훅은 호출되는 순서에 의존하기 때문에 조건문이나 반복문 안에서 실행하게 될 경우 해당 부분을 건너뛰는 일이 발생할 수도 있기 때문에 순서가 꼬여 버그가 발생할 수 있다. 
     그렇기 때문에 이 규칙을 따르면 useState 와 useEffect가 여러번 호출되는 경우에도 Hook의 상태를 올바르게 유지할 수 있게 된다.

  2. 리액트 함수 내에서만 Hook을 호출해야한다.

     Hook은 일반적인 js 함수에서는 호출하면 안된다.
     함수형 컴포넌트나 custom hook에서는 호출 가능하다.

```javascript
import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  const increaseCount = () => setCount(count + 1);
  const decreaseCount = () => setCount(count - 1);
  return (
    <div>
      <h1>Use React Hook</h1>
      <p>Count : {count}</p>
      <button onClick={increaseCount}>증가</button>
      <button onClick={decreaseCount}>감소</button>
    </div>
  );
}
```

- React hook 을 사용한 코드

<br>

```javascript
class App extends React.Component {
  state = {
    item: 1,
  };

  increaseCount = () => {
    this.setState((state) => ({
      item: state.item + 1,
    }));
  };

  decreaseCount = () => {
    this.setState((state) => ({
      item: state.item - 1,
    }));
  };

  render() {
    const { item } = this.state;

    return (
      <div>
        <h1>Use React Hook</h1>
        <p>Count: {item}</p>
        <button onClick={this.increaseCount}>증가</button>
        <button onClick={this.decreaseCount}>감소</button>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- React hook 을 사용하지 않으면 코드가 정말 길어진다

<br>

### useInput()

```javascript
import React, { useState } from "react";
import ReactDOM from "react-dom";

const useInput = (initialValue, validator) => {
  const [value, setValue] = useState(initialValue);
  const onChange = (event) => {
    let willUpdate = true;
    if (typeof validator === "function") {
      willUpdate = validator(event.target.value);
      if (willUpdate) {
        setValue(event.target.value);
        console.log("성공");
      } else {
        console.log("길이 초과");
      }
    }
    console.log(event.target.value);
  };
  return { value, onChange };
};

const App = () => {
  const maxLen = (value) => value.length <= 10;
  const name = useInput("Mr. ", maxLen);
  return (
    <div>
      <h1>Use React Hook</h1>
      <input type="text" placeholder="Name" {...name} />
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- input 을 제어하는 훅 만들기
- useState 활용
- validator 를 추가함으로써 조건에 맞을 때만 입력 가능하도록 한다.
- validator 의 타입을 검증하는 이유는 useInput 의 2번째 인자로 다른것이 들어올수 있기 때문!

<br>
<br>

### useTabs()

```javascript
import React, { useState } from "react";
import ReactDOM from "react-dom";

const useTabs = (initialTab, allTabs) => {
  if (!allTabs || !Array.isArray(allTabs)) {
    return;
  }
  const [currentIndex, setCurrentIndex] = useState(initialTab);
  return {
    currentItem: allTabs[currentIndex],
    changeItem: setCurrentIndex,
  };
};
const content = [
  {
    tab: "Section 1",
    content: "I'm the content of the Section 1",
  },
  {
    tab: "Section 2",
    content: "I'm the content of the Section 2",
  },
];
const App = () => {
  const { currentItem, changeItem } = useTabs(0, content);
  return (
    <div>
      <h1>Use React Hook</h1>
      {content.map((section, index) => (
        <button onClick={() => changeItem(index)}>{section.tab}</button>
      ))}
      <div>{currentItem.content}</div>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- Tab 을 전환하면 내용이 바뀌는 훅 만들기
- useState 활용

<br>
<br>

### useTitle()

```javascript
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const useTitle = (initialTitle) => {
  const [title, setTitle] = useState(initialTitle);
  const updateTitle = () => {
    const htmlTitle = document.querySelector("title");
    htmlTitle.innerText = title;
  };
  useEffect(updateTitle, [title]);
  return setTitle;
};

const App = () => {
  const titleUpdater = useTitle("Loading...");
  setTimeout(() => titleUpdater("home"), 5000);
  return (
    <div>
      <h1>Use React Hook</h1>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- title 제목을 바꿔주는 훅
- useEffect 를 사용해서 title 변화를 감지

### 참고 : ref 란 ?

- DOM 을 선택해서 직접 접근할 때 ref를 이용한다.
- React 에서 state 로만 해결할 수 없고 DOM 에 직접 접근해야할 때 사용함
- Ex) 특정 input 에 focus 주기, 스크롤 박스 조작
- 함수형 컴포넌트에서는 useRef 라는 훅을 사용해서 ref 활용

<br>
<br>

### useClick()

```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useClick = (onClick) => {
  if (typeof onClick !== "function") {
    return;
  }
  const element = useRef();
  useEffect(() => {
    // 존재 하는지 확인하고 부여하기
    if (element.current) {
      element.current.addEventListener("click", onClick);
    }
    return () => element.current.removeEventListner("click", onClick);
  }, []);
  return element;
};

const App = () => {
  const sayHello = () => {
    console.log("안뇽");
  };
  const title = useClick(sayHello);
  // setTimeout(() => input.current.focus(), 5000);
  return (
    <div>
      <h1 ref={title}>Hi</h1>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- componentWillUnmount 할 때 eventListener 제거해주는 함수 return
- component 가 배치되지 않았을 때 eventListener 가 들어가지 않도록 하기 위해서
- useEffect 안에 return + 함수를 넣으면 해당 함수는 컴포넌트가 제거될 때 실행된다
- return 안에 안 넣은 함수는 mount될때 실행되고, dependency 가 있으면 update 가 있을때도 실행됨

<br>
<br>

### useConfirm()

```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useConfirm = (message = "", onConfirm, onCancel) => {
  if (onConfirm && typeof onConfirm !== "function") {
    return;
  }
  if (onCancel && typeof onCancel !== "function") {
    return;
  }
  const confirmAction = () => {
    if (confirm(message)) {
      callback();
    } else {
      rejection();
    }
  };
  return confirmAction;
};

const App = () => {
  const deleteWorld = () => console.log("delete");
  const abort = () => console.log("Aborted");
  const confirmDelete = useConfirm("Are you sure?", deleteWorld, abort);
  return (
    <div>
      <button onClick={confirmDelete}>Delete the world</button>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```
- confirm 메세지를 띄우고 사용자가 확인을 눌렀을 때 특정 함수 실행, 취소를 눌렀을 때 특정 함수 실행을 할 수 있는 훅

<br>
<br>

### usePreventLeave()

```javascript
import ReactDOM from "react-dom";

const usePreventLeave = () => {
  const listener = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };
  const enablePrevent = () => {
    console.log("닫지마");
    window.addEventListener("beforeunload", listener);
  };
  const disablePrevent = () => {
    console.log("닫기");
    window.removeEventListener("beforeunload", listener);
  };
  return { enablePrevent, disablePrevent };
};

const App = () => {
  const { enablePrevent, disablePrevent } = usePreventLeave();
  return (
    <div>
      <button onClick={enablePrevent}>Protect</button>
      <button onClick={disablePrevent}>Unprotect</button>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- 사용자가 창을 닫을 때 beforeunload 를 통해 닫기가 load 되기 전에 listener함수를 실행시킨다.
- event.returnValue = "" 는 사용자에게 페이지를 떠나기 전 경고하는 메세지를 표출시켜 준다.

<br>
<br>

### useBeforeLeave()

```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useBeforeLeave = (onBefore) => {
  if (typeof onBefore !== "function") {
    return;
  }
  const handle = () => {
    const { clientY } = event;
    if (clientY <= 0) {
      onBefore();
    }
  };
  useEffect(() => {
    document.addEventListener("mouseleave", handle);
    return () => document.removeEventListener("mouseleave", handle);
  }, []);
};
const App = () => {
  const begForLife = () => {
    confirm("나가시겠습니까?");
  };
  useBeforeLeave(begForLife);
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- 사용자가 상단바에 마우스를 갖다대면 "나가시겠습니까?" 문구 출력
- event 속성중 clientY 는 사용자의 마우스 y좌표

<br>
<br>

### useFadeIn()

```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useFadeIn = (duration = 1, delay = 0) => {
  if (typeof duration !== "number" || typeof delay !== "number") {
    return;
  }
  const element = useRef();
  useEffect(() => {
    if (element.current) {
      const { current } = element;
      current.style.transition = `opacity ${duration}s ease-in-out ${delay}s`;
      current.style.opacity = 1;
    }
  }, []);
  return { ref: element, style: { opacity: 0 } };
};

const App = () => {
  const fadeInH1 = useFadeIn(1, 2);
  const fadeInP = useFadeIn(4, 8);
  return (
    <div>
      <h1 {...fadeInH1}>Hello</h1>
      <p {...fadeInP}>lorem ipsum lalalalaaala</p>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```
- fadein 효과를 훅을 통해 준다

<br>
<br>

### useScroll()
```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useScroll = () => {
  const [state, setState] = useState({
    x: 0,
    y: 0,
  });
  const onScroll = () => {
    setState({ x: window.scrollX, y: window.scrollY });
  };
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return state;
};

const App = () => {
  const { y } = useScroll();
  return (
    <div style={{ height: "1000vh" }}>
      <h1 style={{ position: "fixed", color: y > 100 ? "red" : "blue" }}>Hi</h1>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

- scroll이 임계점을 넘어가면 색 바꾸기

<br>
<br>

### useFullScreen()
```javascript
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

const useFullScreen = () => {
  const element = useRef();
  const triggerFull = () => {
    if (element.current && !document.fullscreenElement) {
      element.current.requestFullscreen();
    }
  };
  const exitFull = () => {
    if (!document.fullscreenElement) {
      return;
    }
    document.exitFullscreen();
  };
  return { element, triggerFull, exitFull };
};

const App = () => {
  const { element, triggerFull, exitFull } = useFullScreen(onFulls);
  return (
    <div style={{ height: "1000vh" }} ref={element}>
      <img
        src=""
        alt=""
      />
      <br />
      <button onClick={exitFull}>작은 화면 보기</button>
      <button onClick={triggerFull}>전체 화면 보기</button>
    </div>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```
- 전체화면으로 만들어준다.
- 또는 전체화면에서 나가게 해준다.

