import PropTypes from "prop-types";

function Movie({ medium_cover_image, title, genres, rating }) {
  return (
    <div
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
      <img src={medium_cover_image} alt="img" style={{ width: "100%" }} />
      <h3>{title}</h3>
      <ul style={{ marginRight: "auto" }}>
        {genres.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      <p style={{ marginRight: "auto" }}>평점 : {rating}</p>
    </div>
  );
}
Movie.propTypes = {
  medium_cover_image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  genres: PropTypes.arrayOf(PropTypes.string).isRequired,
  rating: PropTypes.number.isRequired,
};
export default Movie;
