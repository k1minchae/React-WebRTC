import { useState, useEffect } from "react";
function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const getMovies = async () => {
    const json = await (
      await fetch(
        "https://yts.mx/api/v2/list_movies.json?minimum_rating=9&sort_by=year"
      )
    ).json();
    setMovies(json.data.movies);
    setLoading(false);
  };
  useEffect(() => {
    getMovies();
  }, []);
  console.log(movies);
  console.log(movies);
  return (
    <div>
      <h1>영화 애플리케이션</h1>
      <hr />
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {loading
          ? "Loading..."
          : movies.map((movie, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid black",
                  padding: "1%",
                  width: "40%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "1%",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={movie.medium_cover_image}
                  alt="movie-img"
                  style={{ width: "100%" }}
                />
                <h3>{movie.title}</h3>
                <ul style={{ marginRight: "auto" }}>
                  {movie.genres.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
                <p style={{ marginRight: "auto" }}>평점 : {movie.rating}</p>
              </div>
            ))}
      </div>
    </div>
  );
}

export default App;
