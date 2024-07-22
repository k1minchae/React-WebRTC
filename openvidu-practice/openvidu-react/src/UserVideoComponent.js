import React from "react";
import OpenViduVideoComponent from "./OvVideo";
import "./UserVideo.css";

const UserVideoComponent = ({ streamManager }) => {
  const videoRef = React.useRef();

  React.useEffect(() => {
    if (streamManager && !!videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  const getNicknameTag = () => {
    return JSON.parse(streamManager.stream.connection.data).clientData;
  };

  return (
    <div>
      {streamManager !== undefined ? (
        <div className="streamcomponent">
          <video autoPlay={true} ref={videoRef} />
          <div>
            <p>{getNicknameTag()}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserVideoComponent;
