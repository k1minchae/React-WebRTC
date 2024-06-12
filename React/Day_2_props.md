1. props로 component 에 객체 전달

```javascript
<script type="text/babel">
  const root = document.getElementById("root");
  function Btn(props) {
    console.log(props.text);

    return (
      <button
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "10px 20px",
          border: 0,
          borderRadius: 10,
          fontSize: props.big ? 18 : 16,
        }}
      >
        Save Changes
      </button>
    );
  }
  function App() {
    return (
      <div>
        <Btn text="save Changes" big={true} />
        <Btn text="Continue" big={false} />
      </div>
    );
  }
  ReactDOM.render(<App />, root);
</script>
```

- <code>function Btn({text, big})</code> 이라고 하면 props.big 이라고 안 하고 바로 big에 접근 가능
- props 를 통해 컴포넌트에 변수를 전달할 수 있게 되었다 !
- 컴포넌트의 첫 번째 파라미터로 props 객체를 받는다.
- 버튼을 하나만 만들어 두면 그 안에 내용을 자유롭게 바꿀 수 있게 됨 => 재사용성 Good

1. 부모 컴포넌트의 state를 props로 전달
   ```javascript
    <script type="text/babel">
    const root = document.getElementById("root");
    function Btn(props) {
      console.log(props.text, "was rendered");
      return (
        <button
          onClick={props.onClick}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px",
            border: 0,
            borderRadius: 10,
          }}
        >
          {props.text}
        </button>
      );
    }
    function App() {
      const [value, setValue] = React.useState("Save Changes");
      const changeValue = () => {
        setValue("Revert Changes");
      };
      return (
        <div>
          <Btn text={value} onClick={changeValue} />
          <Btn text="Continue" />
        </div>
      );
    }
    ReactDOM.render(<App />, root);
   </script>
   ```

- 부모 컴포넌트의 state인 value 를 자식인 Btn 에게 전달한다.
- 이 때 함수도 props로 전달할 수 있다!
- 클릭을 통해 changeValue 함수를 실행시켜서 value값을 바꿔보았다.
  - 근데 왜 값이 바뀌지 않은 Continue 버튼까지 re-render 된걸까?
    ```javascript
    const MemorizedBtn = React.memo(Btn);
    function App() {
      const [value, setValue] = React.useState("Save Changes");
      const changeValue = () => {
        setValue("Revert Changes");
      };
      return (
        <div>
          <MemorizedBtn text={value} onClick={changeValue} />
          <MemorizedBtn text="Continue" />
        </div>
      );
    }
    ReactDOM.render(<App />, root);
    ```
    - 이렇게 바꾸면 Continue 버튼은 re-render 되지 않는다.
    - 어플리케이션 최적화에 도움이 됨!

## Prop-types

cdn 방식으로 설치

```javascript
<script src="https://unpkg.com/prop-types@15.7.2/prop-types.js"></script>;

Btn.propTypes = {
  text: PropTypes.string.isRequired,
  fontSize: PropTypes.number,
};
function App() {
  const [value, setValue] = React.useState("Save Changes");
  const changeValue = () => {
    setValue("Revert Changes");
  };
  return (
    <div>
      <Btn text="Save Changes" fontSize={18} />
      <Btn text="Continue" fontSize="18" />
    </div>
  );
}
```

- 이 모듈을 이용하면 올바르지 않은 값일 경우 콘솔에 에러 메세지를 띄워준다.
- 위 경우에는 fontSize 가 문자열로 들어있어서 에러메세지가 출력됨

- props 객체 속성에 기본값 설정하는 법
  ```javascript
  function Btn({ text, fontSize = 30 }) {
    return (
      <button
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "10px 20px",
          border: 0,
          borderRadius: 10,
          fontSize: fontSize,
        }}
      >
        {text}
      </button>
    );
  }
  function App() {
    const [value, setValue] = React.useState("Save Changes");
    const changeValue = () => {
      setValue("Revert Changes");
    };
    return (
      <div>
        <Btn text="Save Changes" fontSize={18} />
        <Btn text="Continue" />
      </div>
    );
  }
  ```
  - 만약 fontSize props를 전달하지 않는다면 undefined 가 된다.
  - 그럴 경우에 기본값을 할당해두면 해당 값이 전달됨 !!
  - 이건 사실 react 문법은 아니고 걍 JS문법임
