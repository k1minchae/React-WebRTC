import React from "react";

const CornerControl = ({ corners, handleChangeCorner }) => {
  return (
    <div id="corner-container" className="col-md-12">
      <h3>코너 전환</h3>
      {corners.map((corner, index) => (
        <button key={index} onClick={() => handleChangeCorner(corner)}>
          {corner.name}
        </button>
      ))}
    </div>
  );
};

export default CornerControl;
