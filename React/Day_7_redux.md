## Redux 로 상태관리

- npm install redux
- vue3 를 사용할 때 pinia 를 사용했던 것 처럼 redux로 상태관리를 할 수 있다
- 상태값의 재사용성을 높이고 props의 깊이가 깊어지는 것을 방지하여 컴포넌트 간의 의존도를 낮춘다.
- redux-dev-tools 를 통해 디버깅이 편하다
- 단점 : 패키지 용량이 크다
- 단점 : Flux 패턴에 대한 이해가 필요하다
  => zunstand 는 간소화된 flux 패턴 (러닝커브가 낮다)
- RTK Query를 내장하고 있기 때문에 별도의 데이터 페칭 라이브러리 없이 캐싱, 자동 데이터 리페칭 등의 기능을 사용할 수 있다. 관심사끼리 slice로 나눠서 코드 스플리팅도 가능하다.

<br>

## MVC 패턴이란?

- Model View Controller
- 모델에 데이터 저장, Controller 를 통해 데이터 CRUD, 데이터 변경시 View 로 전달되어 사용자에게 전달
- 사용자가 View 를 통해 데이터를 전달하면 Model 업데이트
- 양방향으로 데이터 관리 가능
- 애플리케이션 규모가 커질 경우 Model <-> View 관계가 복잡해진다.
- 특히나 SPA 일 경우 더더욱 심해질 것
- View 가 다양한 상호작용을 가지게 되면 여러개의 Model 을 업데이트 하고 해당 Model 이 업데이트 되면 다른 View 가 실행되고 ... 하면서 점점 복잡해짐 !!!!
  => 양방향 데이터 흐름의 단점

<br>

## Flux 패턴

- 페이스북에서 MVC 패턴의 해결방안으로 고안해 낸 것
- 단방향 데이터 흐름을 가진다.
- (사용자 입력) Action -> Dispatcher -> Store -> View

1. Action
   - 데이터를 변경하는 행위
   - Dispatcher 에게 전달되는 객체
   - Action Creator 메서드로 새로 발생한 액션의 타입과 데이터를 묶어서 전달

<br>

2. Dispatcher
   - 모든 데이터의 흐름을 관리하는 중앙 허브
   - 어떤 행동을 할 지 결정!! (type 에 맞는 행동)
   - store 들이 등록해놓은 Action 타입마다 콜백함수 존재 => Action 감지시 타입에 맞는 콜백함수 실행
   - Store 데이터 조작은 오직 Dispatcher를 통해서만 가능!!
   - Store 간의 의존성이 있어도 순서에 맞게 콜백 함수를 순차적으로 처리하도록 관리

<br>

3. Store (Model)
   - 상태 저장소
   - 상태와 메서드를 가지고 있음
   - 어떤 타입의 액션이 발생했는 지에 따라 그에 맞는 콜백함수를 Dispatcher에 등록
   - Dispatcher 에서 콜백함수 실행 -> 상태 변경 -> View에게 알림!!

<br>

4. View (리액트 컴포넌트)
   - Store 에서 View 에게 상태 변경을 알리면
   - 최상위 View 는 Store 에서 데이터를 가져와서 자식 View 에게 내려보낸다.
   - 새로운 데이터를 받은 View 는 re-rendering 한다.
   - 사용자가 View 에 어떤 조작을 하면 그에 해당하는 Action 생성
     - 해당 Action 이 다시 Dispatcher에게 전달됨

<br>

### 예시

```javascript
const initialState = {
  number: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return {
        number: state.number + 1,
      };
    default:
      return state;
  }
}
```

- Store 에 number 상태정보 저장
- reducer 함수 -> Dispatcher 에 제공할 메서드
- Add 타입의 액션을 받는다면 ?
- number에서 + 1을 해서 새로운 객체를 상태로 넘겨준다
- 다른 타입의 객체라면 ? 그냥 현재 상태 return

<br>

```javascript
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onAdd = () => {
    dispatch({ type: "ADD" });
  };

  return (
    <div>
      <h1>{state.number}</h1>
      <button onClick={onAdd}>Add</button>
    </div>
  );
}
```

- View 에서 onAdd 함수가 실행된다
- onAdd 함수는 "ADD" 액션을 만들고 이를 dispatcher 에 전달한다.
- Dispatcher 는 이 액션을 reducer 메서드에 맞춰 해석한 뒤 Store 를 업데이트 한다
- Store 가 업데이트 되면 View 가 이를 감지하고 re-render 한다

<br>
<br>

## Start Redux

```javascript
import { createStore } from "redux";

// 데이터를 변경해주는 함수 : reducer
const countModifier = () => {
  return "hello";
};
const countStore = createStore(countModifier);
console.log(countStore.getState()); // "hello"
```

- return 뒤에 적은것이 state
- .getState() 를 통해 state 를 반환한다.
- 상태를 변경하려면 reducer 를 통해 해야한다.

<br>

```javascript
// 데이터를 변경해주는 함수 : reducer
const countModifier = (count = 0, action) => {
  if (action.type === "ADD") {
    return count + 1;
  } else if (action.type === "MINUS") {
    return count - 1;
  } else {
    return count;
  }
  return count;
};
const countStore = createStore(countModifier);
countStore.dispatch({ type: "ADD" });
countStore.dispatch({ type: "ADD" });
countStore.dispatch({ type: "ADD" });
countStore.dispatch({ type: "ADD" });
countStore.dispatch({ type: "MINUS" });

console.log(countStore.getState()); // 3

// 버튼에 연결하기
const handleAdd = () => {
  countStore.dispatch({ type: "ADD" });
  console.log(countStore.getState());
};
const handleMinus = () => {
  countStore.dispatch({ type: "MINUS" });
  console.log(countStore.getState());
};

add.addEventListener("click", handleAdd);
minus.addEventListener("click", handleMinus);
```

- dispatch 를 통해 type 이 들어오면 해당 타입에 따라 분기를 해서 state를 처리한다.
- dispatch 코드가 실행되면 countModifier 함수도 실행된다.

<br>
<br>

### 변화 감지 (subscribe)

```javascript
const onChange = () => {
  console.log(countStore.getState(), "state 변화");
  number.innerText = countStore.getState();
};
countStore.subscribe(onChange);
```

- subscribe 의 인자로 함수를 넣으면, state 값이 변할때마다 함수가 호출된다.

### Switch 구문 활용

```javascript
const countModifier = (count = 0, action) => {
  switch (action.type) {
    case "ADD":
      return count + 1;
    case "MINUS":
      return count - 1;
    default:
      return count;
  }
};
```

- if / else if / else 를 쓰는 것 보다 훨씬 가독성이 좋다
- type 에 String 대신에 변수를 (const ADD = "ADD";) 이런식으로 선언한 뒤
- type 에 변수를 넣어주면 오타가 났을 때 콘솔에 에러를 볼 수 있다.
- 디버깅하기 훨씬 쉬워짐!

<br>
<br>

## State Mutation

```javascript
const addTodo = (text) => {
  return { type: ADD_TODO, text, id: Date.now() };
};
const dispatchAddTodo = (text) => {
  todoStore.dispatch(addTodo(text));
};

const deleteTodo = (id) => {
  return {
    type: DELETE_TODO,
    id,
  };
};
const dispatchDeleteTodo = (event) => {
  const id = parseInt(event.target.parentNode.id);
  todoStore.dispatch(deleteTodo(id));
};

// Reducer
const todoModifier = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [{ id: action.id, text: action.text }, ...state];
    case DELETE_TODO:
      // mutate 하지 않기 위해 splice 가 아닌 filter 를 사용한다.
      const toDos = state.filter((toDo) => toDo.id !== action.id);
      return toDos;
    default:
      return state;
  }
};

const todoStore = createStore(todoModifier);
// Todo 목록을 화면에 나타냄
const paintTodos = () => {
  const toDos = todoStore.getState();
  ul.innerHTML = "";
  toDos.forEach((toDo) => {
    const li = document.createElement("li");
    const delBtn = document.createElement("button");
    delBtn.innerText = "X";
    li.id = toDo.id;
    li.innerText = toDo.text;
    ul.appendChild(li);
    li.appendChild(delBtn);
    delBtn.addEventListener("click", dispatchDeleteTodo);
  });
};
todoStore.subscribe(paintTodos);

// todo를 입력하고 submit 버튼을 눌렀을 때 작동
const onSubmit = (event) => {
  event.preventDefault();
  const toDo = input.value;
  input.value = "";
  dispatchAddTodo(toDo);
};
form.addEventListener("submit", onSubmit);
```

- React 에서는 state 를 mutate 하지않고 새로운 state 를 create 해서 return 한다 !

  <span style="color :orange">**이유는 ??**</span>

  1. 불변성 유지 : 상태를 불변하게 유지하면 상태의 변화가 일어날때마다 새로운 객체를 생성해서 변경된 부분을 쉽게 감지할 수 있게 한다.
  2. 타임 트래블 디버깅 : 상태의 변화 이력 관리 -> 이전 상태로 돌아가거나 상태 변화 시각화
  3. 변경 추적 및 히스토리 관리
  4. 버그를 줄인다.

- array 에 새로운 요소를 추가하려면, 전개구문을 통해 old state 를 불러오고, 그 뒤에 변화분을 덧붙여 새로운 state 를 return
- state 값이 변했을 때 html 을 repaint 할 수 있도록 paint 함수를 만들어서 subscribe 에 넣는다.
- filter : element 가 뒤에 test 식을 만족하는경우에만 새로운 array 에 담아서 return 시켜줌
