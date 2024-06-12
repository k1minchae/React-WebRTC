# 2024-06-11 (화)

### 왜 리액트가 좋은 지?

- 생태계가 크다
- React Native 를 활용하여 앱 제작까지 확장 가능
- interactive
- **재사용성이 좋다**
  - Vue 는 컴포넌트를 분리하려면 새로운 파일을 만들어야 했는데, 리액트는 그렇지 않아도 되고, 컴포넌트를 아주 작은 단위로도 분리하기가 쉽게 만들어져 있다.
  - props 를 전달하는 과정에서 2개의 파일을 오가지 않아도 된다!!
- **React 는 라이브러리고, Vue 는 프레임워크이다.**
  - Vue에서 개발을 할 때는 Vue의 문법에 국한되어 있기 때문에 좀 더 제약이 많다.
  - 하지만, React 환경에서 개발할 때는 프레임워크의 틀에 갇히지 않고 다양하게 자신만의 스타일로 개발할 수 있다.

---

```javascript
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
  </body>
  <script
    crossorigin
    src="https://unpkg.com/react@18/umd/react.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
  ></script>
  <script>
    const root = document.getElementById("root");
    const span = React.createElement('span', {id: 'good-span', style: {color: 'red'}}, 'hello i am a span');
    ReactDOM.render(span, root);
  </script>
</html>

```

- CDN 방식으로 이용
- 바닐라js 와의 구조적 차이는, 요소를 생성하면서 동시에 props와 innerText 까지 한 번에 부여 가능하다는 것이다.

```javascript
const button = React.createElement(
  "button",
  {
    onClick: (event) => console.log("click"),
  },
  "Click me"
);
const container = React.createElement("div", null, [h3, button]);
ReactDOM.render(container, root);
```

- 심지어 props에 eventlistener 까지 함께 부여 가능하다.
  => on + event 형식으로 작성

---

1. 더욱 편리하게 사용하기 위해 <code> babel/standalone</code> 활용

   ```javascript
   <script type="text/babel">
     const root = document.getElementById("root"); const Title= (
     <h3 id="title" onMouseEnter={() => console.log("mouse is inside")}>
       {" "}
       Hello I'm a title
     </h3>
     ); const Button = <button
       style={{ backgroundColor: "tomato" }}
       onClick={() => {
         console.log("클릭!");
       }}
     >
       {" "}
       Click me{" "}
     </button>; const container = React.createElement('div', null, [Title, Button])
     ReactDOM.render(container, root);
   </script>
   ```

- html과 생김새가 비슷해져서 코드의 가독성이 좋아졌다

2. 각 요소를 컴포넌트 화 하기

   ```javascript
   const Title = () => {
     return (
       <h3 id="title" onMouseEnter={() => console.log("mouse is inside")}>
         Hello I'm a title
       </h3>
     );
   };
   const Button = () => {
     return (
       <button
         style={{ backgroundColor: "tomato" }}
         onClick={() => {
           console.log("클릭!");
         }}
       >
         Click me{" "}
       </button>
     );
   };

   const Container = (
     <div>
       <Title />
       <Button />
     </div>
   );
   ReactDOM.render(Container, root);
   ```

   - <span style="color:orange">새 파일을 만들지 않고도 컴포넌트로 쓸 수 있다!!</span>
   - 직접 만든 컴포넌트의 경우 대문자로 생성해야 한다.
   - **소문자일 경우 html 요소와 구별하지 못 함**

3. 반응형 변수 구현해보기

   ```javascript
   let counter = 0;
   function countUp() {
     counter += 1;
     console.log({ counter });
     reRender();
   }
   function reRender() {
     ReactDOM.render(<Container />, root);
   }
   const Container = () => (
     <div>
       <h3>total clicks: {counter}</h3>
       <button onClick={countUp}>Click me </button>
     </div>
   );
   ```

   - 함수가 실행될 때마다 다시 컴포넌트를 render
   - 좋은 점은 컴포넌트 전체를 render 하더라도 바뀐 부분만 교체해준다!! (똑똑하네)
   - 그래도 이 방식 자체는 구리다
     - 데이터가 바뀔 때마다 직접 render를 넣어줘야하는데 모든 부분에 넣는다고 생각하면 얼마나 비효율적인가...

4. <code>useState</code> 함수를 통해 반응형 변수 구현

   ```javascript
    <script type="text/babel">
    const root = document.getElementById("root");

    function App() {
      const data = React.useState(0);
      const [counter, setCounter] = data;
      const onClick = () => {
      const onClick = () => {
        // setCounter(counter + 1);
        setCounter((current) => current + 1);
      };
      return (
        <div>
          <h3>total clicks: {counter}</h3>
          <button onClick={onClick}>Click me !</button>
        </div>
      );
    }
    ReactDOM.render(<App />, root);
   </script>
   ```

- <code>useState</code> 함수는 데이터와 함수를 반환한다.

  - useState의 첫 번째 파라미터는 데이터의 기본값이다.
  - 데이터가 바뀌면 자동으로 함수가 실행된다.

    => 이거를 통해 반응형 변수를 쉽게 구현할 수 있음!

- counter 값을 증가시킬 때 <code>counter + 1</code>로 직접 변수를 증가시켜도 되지만
- js 특성상 비동기적으로 동작하는 경우가 대부분이기에 안전하게 함수형으로 변수를 증가시켰다.

## 분 - 시간 변환기 구현 실습

```javascript
 <script type="text/babel">
   const root = document.getElementById("root");

   function App() {
     const [amount, setAmount] = React.useState(0);
     const [inverted, setInverted] = React.useState(false);
     const onChange = (event) => {
       setAmount(event.target.value);
     };
     const reset = () => {
       setAmount(0);
     };
     const onFlip = () => {
       reset();
       setInverted((current) => !current);
     };
     return (
       <div>
         <h1>super Converter</h1>
         <label htmlFor="minutes">Minutes : </label>
         <input
           placeholder="Minutes"
           type="number"
           id="minutes"
           value={inverted ? amount * 60 : amount}
           onChange={onChange}
           disabled={inverted === true}
         />
         <h4>You want to convert {amount}</h4>
         <label htmlFor="hours">Hours : </label>
         <input
           value={inverted ? amount : Math.round(amount / 60)}
           placeholder="Hours"
           type="number"
           id="hours"
           disabled={inverted === false}
           onChange={onChange}
         />
         <button onClick={reset}>Reset</button>
         <button onClick={onFlip}>{inverted ? "되돌리기" : "전환"}</button>
       </div>
     );
   }
   ReactDOM.render(<App />, root);
 <script>
```

1. 구현 사항
   - 초기값 : 분을 입력하면 시간으로 계산해준다.
   - Reset 버튼을 클릭하면 입력값, 계산값이 초기화된다
   - 전환 버튼을 클릭하면 시간 -> 분을 계산하는 계산기로 전환된다.
     - 이 경우에 전환 버튼은 되돌리기 버튼으로 바뀐다.
2. state
   - amount : 필요한 값 (분/시간)
   - inverted : false 일 경우 분->시간 계산기 작동 // true 일 경우 반대
     - input value 가 inverted 값에 따라 변환된다
     - 삼항연산자를 활용하여 분기처리 한다

## 2개의 변환기 구현

```javascript
  <script type="text/babel">
    const root = document.getElementById("root");

    function MinutesToHours() {
      const [amount, setAmount] = React.useState(0);
      const [inverted, setInverted] = React.useState(false);
      const onChange = (event) => {
        setAmount(event.target.value);
      };
      const reset = () => {
        setAmount(0);
      };
      const onFlip = () => {
        reset();
        setInverted((current) => !current);
      };
      return (
        <div>
          <label htmlFor="minutes">Minutes : </label>
          <input
            placeholder="Minutes"
            type="number"
            id="minutes"
            value={inverted ? amount * 60 : amount}
            onChange={onChange}
            disabled={inverted === true}
          />
          <label htmlFor="hours">Hours : </label>
          <input
            value={inverted ? amount : Math.round(amount / 60)}
            placeholder="Hours"
            type="number"
            id="hours"
            disabled={inverted === false}
            onChange={onChange}
          />
          <button onClick={reset}>Reset</button>
          <button onClick={onFlip}>{inverted ? "되돌리기" : "변환"}</button>
        </div>
      );
    }

    function KmToMiles() {
      const [amount, setAmount] = React.useState(0);
      const [inverted, setInverted] = React.useState(false);
      const onChange = () => {
        setAmount(event.target.value);
      };
      const reset = () => {
        setAmount(0);
      };
      const onFlip = () => {
        reset();
        setInverted((current) => !current);
      };
      return (
        <div>
          <label htmlFor="kilometers">kilometers : </label>
          <input
            value={inverted ? (amount * 1.60934).toFixed(4) : amount}
            id="kilometers"
            placeholder="킬로미터"
            type="number"
            onChange={onChange}
          />
          <label htmlFor="miles">miles : </label>
          <input
            value={inverted ? amount : (amount * 0.621371).toFixed(4)}
            id="miles"
            placeholder="마일"
            type="number"
            onChange={onChange}
          />
          <button onClick={reset}>리셋</button>
          <button onClick={onFlip}>{inverted ? "되돌리기" : "전환"}</button>
        </div>
      );
    }

    function App() {
      const [index, setIndex] = React.useState("0");
      const onSelect = () => {
        setIndex(event.target.value);
      };
      return (
        <div>
          <h1>Super Converter</h1>
          <select onChange={onSelect}>
            <option value="0">원하는 변환기를 고르세요.</option>
            <option value="1">minutes/hours</option>
            <option value="2">km/miles</option>
          </select>
          <hr />
          {index === "0" ? "please select your converter !" : null}
          {index === "1" ? <MinutesToHours /> : null}
          {index === "2" ? <KmToMiles /> : null}
        </div>
      );
    }
    ReactDOM.render(<App />, root);
  </script>
```

- 변환기 자체는 위에서 한것과 동일하다. (시간-분 변환기, km-miles 변환기)
- 차이점 : 각 변환기를 컴포넌트화 했다.
- app 컴포넌트에서 index state를 통해 어떤 변환기를 보여줄 지 결정한다.
