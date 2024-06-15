import { useState, useEffect } from "react";
import Movie from "./Movie";
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
  return (
    <div>
      <h1>영화 애플리케이션</h1>
      <hr />
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {loading
          ? "Loading..."
          : movies.map((movie) => (
              <Movie
                key={movie.id}
                title={movie.title}
                medium_cover_image={movie.medium_cover_image}
                rating={movie.rating}
                genres={movie.genres}
              />
            ))}
      </div>
    </div>
  );
}

export default App;
