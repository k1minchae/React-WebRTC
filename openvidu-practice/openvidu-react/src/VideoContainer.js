import React from "react";
import UserVideoComponent from "./UserVideoComponent";

const VideoContainer = ({
  publisher,
  subscribers,
  handleMainVideoStream,
  mainStreamManager,
  isCreator,
  creatorStream,
  visibleSubscribers,
  fanAudioStatus,
  toggleFanVisibility,
  controlFansAudio,
  controlFansVideo,
  myAudioStatus,
  currentCorner,
}) => {
  return (
    <div
      id="video-container"
      className={`col-md-12 ${
        currentCorner && currentCorner.name === "사연 읽기 코너"
          ? "reduced-width"
          : ""
      }`}
    >
      {!isCreator && creatorStream && (
        <div className="stream-container col-md-12">
          <h3>크리에이터 화면</h3>
          <UserVideoComponent streamManager={creatorStream} />
        </div>
      )}
      <div className="stream-container col-md-12">
        <h3>내 화면</h3>
        <UserVideoComponent streamManager={publisher} />
        <span>{myAudioStatus ? "마이크 ON" : "마이크 OFF"}</span>
      </div>
      <div className="col-md-12">
        {subscribers.map((sub, i) => {
          const connectionData = JSON.parse(
            sub.stream.connection.data
          ).clientData;
          const connectionId = sub.stream.connection.connectionId;
          const isAudioActive = fanAudioStatus[connectionId];

          if (isCreator || visibleSubscribers.includes(sub)) {
            return (
              <div
                key={sub.id}
                className="stream-container col-md-6 col-xs-6"
                onClick={() => handleMainVideoStream(sub)}
              >
                <div className="stream-wrapper">
                  <UserVideoComponent streamManager={sub} />
                  <span>{connectionData}</span>
                  <span>{isAudioActive ? "마이크 ON" : "마이크 OFF"}</span>
                </div>
                {isCreator && (
                  <div>
                    <button onClick={() => controlFansAudio(sub)}>
                      Mute/Unmute
                    </button>
                    <button onClick={() => controlFansVideo(sub)}>
                      Enable/Disable Video
                    </button>
                    <button onClick={() => toggleFanVisibility(sub)}>
                      {visibleSubscribers.includes(sub)
                        ? "Hide from All"
                        : "Show to All"}
                    </button>
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default VideoContainer;
