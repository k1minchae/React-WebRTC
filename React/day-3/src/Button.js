import PropTypes from "prop-types";
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
Button.propTypes = {
  text: PropTypes.string.isRequired,
};
export default Button;
