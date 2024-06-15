## 영화 애플리케이션 제작 실습
```javascript
  useEffect(() => {
    fetch(
      "https://yts.mx/api/v2/list_movies.json?minimum_rating=9&sort_by=year"
    )
      .then((response) => response.json())
      .then((json) => {
        setMovies(json.data.movies);
        console.log(json.data.movies);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);
```
- 여태까지는 데이터를 가져오려면 fetch + then 을 썼다.
- 하지만 더 많이 쓰이는 방법이 있음 !

<br>

**더 많이 쓰이는 방법**

```javascript
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const getMovies = async () => {
    const response = await fetch(
      "https://yts.mx/api/v2/list_movies.json?minimum_rating=9&sort_by=year"
    );
    const json = await response.json();
    setMovies(json.data.movies);
    setLoading(false);
  };
  useEffect(() => {
    getMovies();
  }, []);
```
- async await 을 활용해서 데이터를 가져오는 걸 더 많이 쓴다.

<br>

**response -> json 과정을 하나로 합치기**

```javascript
    const json = await (
      await fetch(
        "https://yts.mx/api/v2/list_movies.json?minimum_rating=9&sort_by=year"
      )
    ).json();
```

- 처음에는 await fetch 의 결과물을 response로 선언해서 그걸 또 await 해서 json으로 바꿔서 가져왔는데 response 로 선언할 필요 없이 괄호로 묶어서 해도 된다.