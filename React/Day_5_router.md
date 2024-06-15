## React-router
- 설치 : <code>$ npm install react-router-dom</code>
```javascript
// App.js
import 
{ 
  BrowserRouter as Router, 
  Switch, 
  Route, 
  Link 
} 
from "react-router-dom";
```
- Router 종류 2가지 : Hash, Browser
- Switch의 역할 : Router 찾아줌 ! => React 6버전 이상에서는 지원하지 않음

<br>

```javascript
import { HashRouter as Router, Route, Routes } from "react-router-dom";

    <Routes>
        {isLoggedIn ? (
          <Route path="/" element={<Home />}></Route>
        ) : (
          <Route path="/" element={<Auth />}></Route>
        )}
      </Routes>
```
- 6 버전 이상에서는 이렇게 하면 된다.

<br>
```javascript
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/movie">
          <Detail />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
```
- movie를 위에다가 올려야 함 !
- 안 그러면 Home 이 먼저 인식돼서 자꾸 홈 router 로 push된다 ...

<br>

```javascript
// Movie.js
import { Link } from "react-router-dom";

<Link to="/movie">{title}</Link>
<Link to={`/movie/${id}`}>{title}</Link>

// App.js
<Route path="/movie/:id">

// Detail.js
import { useParams } from "react-router-dom";
function Detail() {
  const { id } = useParams();
  console.log(id);
  return <h1>Detail</h1>;
}
export default Detail;

```

- 이렇게 to 속성에 router의 path 를 적어주면 해당 라우터로 이동한다.
- a태그로 쓴다면 새로고침 되면서 이동되지만 router-link를 활용하면 그렇지 않음!
- variable routing 도 가능 !
- useParams 함수를 쓰면 parameter 에 넣은 변수 꺼내올 수 있다 => object 로 반환됨

<br>

```javascript
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
function Detail() {
  const { id } = useParams();
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(true);
  const getMovie = async () => {
    const json = await (
      await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
    ).json();
    console.log(json.data.movie);
    setMovie(json.data.movie);
    setLoading(false);
  };
  useEffect(() => {
    getMovie();
  }, []);
  console.log(id);
  return (
    <div>
      <h1>{loading ? "Loading..." : movie.title}</h1>
      <img src={movie.large_cover_image} alt={movie.id} />
      <p>{movie.description_intro}</p>
    </div>
  );
}
export default Detail;
```
- Router에 들어있는 변수를 가져와서 api를 통해 movie detail 정보를 불러온다.
