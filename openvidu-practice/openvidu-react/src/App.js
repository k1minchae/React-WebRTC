import React, { useCallback, useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import VideoContainer from "./VideoContainer";
import Chat from "./Chat";
import CornerControl from "./CornerControl";
import StoryContainer from "./StoryContainer";
import "./App.css";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

const CORNERS = [
  { name: "소통 코너", description: "팬들과 소통하는 시간입니다." },
  { name: "게임 코너", description: "팬들과 함께 게임을 즐기는 시간입니다." },
  { name: "편지 코너", description: "팬들에게 편지를 읽어주는 시간입니다." },
  { name: "사연 읽기 코너", description: "사연을 읽어주는 시간입니다." },
];

const STORIES = [
  { title: "사연 1", content: "이것은 첫 번째 사연입니다." },
  { title: "사연 2", content: "이것은 두 번째 사연입니다." },
  { title: "사연 3", content: "이것은 세 번째 사연입니다." },
];

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function App() {
  const [mySessionId, setMySessionId] = useState("SessionA");
  const [myUserName, setMyUserName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [isCreator, setIsCreator] = useState(false);
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [visibleSubscribers, setVisibleSubscribers] = useState([]);
  const [creatorStream, setCreatorStream] = useState(null);
  const [fanAudioStatus, setFanAudioStatus] = useState({});
  const [myAudioStatus, setMyAudioStatus] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userColors, setUserColors] = useState({});
  const [corners, setCorners] = useState(CORNERS);
  const [currentCorner, setCurrentCorner] = useState(null);
  const [stories, setStories] = useState(STORIES);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(-1);

  const OV = useRef(new OpenVidu());

  const handleChangeSessionId = useCallback((e) => {
    setMySessionId(e.target.value);
  }, []);

  const handleChangeUserName = useCallback((e) => {
    setMyUserName(e.target.value);
  }, []);

  const handleChangeMessage = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  const handleSendMessage = useCallback(
    (event) => {
      event.preventDefault();
      if (newMessage.trim() !== "") {
        session.signal({
          data: JSON.stringify({ user: myUserName, text: newMessage }),
          to: [],
          type: "chat",
        });
        setNewMessage("");
      }
    },
    [session, newMessage, myUserName]
  );

  const handleMainVideoStream = useCallback(
    (stream) => {
      if (mainStreamManager !== stream) {
        setMainStreamManager(stream);
      }
    },
    [mainStreamManager]
  );

  const handleChangeCorner = useCallback(
    (corner) => {
      setCurrentCorner(corner);
      if (corner.name === "사연 읽기 코너") {
        setCurrentStoryIndex(-1);
      }
      session.signal({
        data: JSON.stringify(corner),
        to: [],
        type: "corner-changed",
      });
    },
    [session]
  );

  const handleNextStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < stories.length) {
        session.signal({
          data: JSON.stringify({ nextIndex }),
          to: [],
          type: "story-changed",
        });
        return nextIndex;
      }
      return prevIndex;
    });
  }, [stories, session]);

  const joinSession = useCallback(
    (event) => {
      event.preventDefault();
      const mySession = OV.current.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data).clientData;
        if (clientData === "creator") {
          setCreatorStream(subscriber);
        }
        setSubscribers((subscribers) => [...subscribers, subscriber]);
        setFanAudioStatus((prevStatus) => ({
          ...prevStatus,
          [subscriber.stream.connection.connectionId]:
            subscriber.stream.audioActive,
        }));
        setUserColors((prevColors) => ({
          ...prevColors,
          [clientData]: getRandomColor(),
        }));
      });

      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      mySession.on("signal:chat", (event) => {
        const message = JSON.parse(event.data);
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      mySession.on("signal:corner-changed", (event) => {
        const corner = JSON.parse(event.data);
        setCurrentCorner(corner);
        if (corner.name === "사연 읽기 코너") {
          setCurrentStoryIndex(-1);
        }
      });

      mySession.on("signal:story-changed", (event) => {
        const { nextIndex } = JSON.parse(event.data);
        setCurrentStoryIndex(nextIndex);
      });

      setSession(mySession);
    },
    [isCreator]
  );

  useEffect(() => {
    if (session) {
      getToken().then(async (token) => {
        try {
          await session.connect(token, {
            clientData: isCreator ? "creator" : myUserName,
          });

          let publisher = await OV.current.initPublisherAsync(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: isCreator,
            publishVideo: true,
            resolution: "640x480",
            frameRate: 30,
            insertMode: "APPEND",
            mirror: false,
          });

          session.publish(publisher);

          const devices = await OV.current.getDevices();
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          const currentVideoDeviceId = publisher.stream
            .getMediaStream()
            .getVideoTracks()[0]
            .getSettings().deviceId;
          const currentVideoDevice = videoDevices.find(
            (device) => device.deviceId === currentVideoDeviceId
          );

          setMainStreamManager(publisher);
          setPublisher(publisher);
          setCurrentVideoDevice(currentVideoDevice);
          setMyAudioStatus(publisher.stream.audioActive);
          setUserColors((prevColors) => ({
            ...prevColors,
            [myUserName]: getRandomColor(),
          }));
        } catch (error) {
          console.log(
            "There was an error connecting to the session:",
            error.code,
            error.message
          );
        }
      });
    }
  }, [session, isCreator, myUserName]);

  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
    }

    OV.current = new OpenVidu();
    setSession(undefined);
    setSubscribers([]);
    setVisibleSubscribers([]);
    setMySessionId("SessionA");
    setMyUserName("Participant" + Math.floor(Math.random() * 100));
    setMainStreamManager(undefined);
    setPublisher(undefined);
    setCreatorStream(null);
    setFanAudioStatus({});
    setMyAudioStatus(true);
    setChatMessages([]);
    setNewMessage("");
    setUserColors({});
    setCurrentCorner(null);
    setCurrentStoryIndex(-1);
  }, [session]);

  const switchCamera = useCallback(async () => {
    try {
      const devices = await OV.current.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices && videoDevices.length > 1) {
        const newVideoDevice = videoDevices.filter(
          (device) => device.deviceId !== currentVideoDevice.deviceId
        );

        if (newVideoDevice.length > 0) {
          const newPublisher = OV.current.initPublisher(undefined, {
            videoSource: newVideoDevice[0].deviceId,
            publishAudio: isCreator,
            publishVideo: true,
            mirror: true,
          });

          if (session) {
            await session.unpublish(mainStreamManager);
            await session.publish(newPublisher);
            setCurrentVideoDevice(newVideoDevice[0]);
            setMainStreamManager(newPublisher);
            setPublisher(newPublisher);
            setMyAudioStatus(newPublisher.stream.audioActive);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentVideoDevice, session, mainStreamManager, isCreator]);

  const deleteSubscriber = useCallback((streamManager) => {
    setSubscribers((prevSubscribers) => {
      const index = prevSubscribers.indexOf(streamManager);
      if (index > -1) {
        const newSubscribers = [...prevSubscribers];
        newSubscribers.splice(index, 1);
        return newSubscribers;
      } else {
        return prevSubscribers;
      }
    });
    setVisibleSubscribers((prevVisibleSubscribers) => {
      const index = prevVisibleSubscribers.indexOf(streamManager);
      if (index > -1) {
        const newVisibleSubscribers = [...prevVisibleSubscribers];
        newVisibleSubscribers.splice(index, 1);
        return newVisibleSubscribers;
      } else {
        return prevVisibleSubscribers;
      }
    });
  }, []);

  const toggleMyAudio = useCallback(() => {
    if (publisher) {
      const newAudioStatus = !publisher.stream.audioActive;
      publisher.publishAudio(newAudioStatus);
      setMyAudioStatus(newAudioStatus);

      session.signal({
        data: JSON.stringify({
          connectionId: session.connection.connectionId,
          audio: newAudioStatus,
        }),
        to: [],
        type: "audio-toggled",
      });
    }
  }, [publisher, session]);

  const toggleMyVideo = useCallback(() => {
    if (publisher) {
      publisher.publishVideo(!publisher.stream.videoActive);
    }
  }, [publisher]);

  const toggleFanAudio = (audioTracks) => {
    const stateOfAudio = !audioTracks[0].enabled;
    audioTracks[0].enabled = stateOfAudio;
    return stateOfAudio;
  };

  const toggleFanVideo = (videoTracks) => {
    const stateOfVideo = !videoTracks[0].enabled;
    videoTracks[0].enabled = stateOfVideo;
    return stateOfVideo;
  };

  const getAudioFromVideo = (videoElement) => {
    if (videoElement && videoElement.srcObject) {
      const mediaStream = videoElement.srcObject;
      return mediaStream.getAudioTracks();
    }
    return [];
  };

  const getVideoFromVideo = (videoElement) => {
    if (videoElement && videoElement.srcObject) {
      const mediaStream = videoElement.srcObject;
      return mediaStream.getVideoTracks();
    }
    return [];
  };

  const sendAudioToggleSignal = (videoObj, subscriber, session) => {
    const videoElement = videoObj.video;
    const audioTracks = getAudioFromVideo(videoElement);

    if (audioTracks.length > 0) {
      const stateOfAudio = toggleFanAudio(audioTracks);
      console.log("제어한 팬의 오디오 트랙 : ", videoObj.id);

      session.signal({
        data: JSON.stringify({
          connectionId: subscriber.stream.connection.connectionId,
          audio: stateOfAudio,
        }),
        to: [],
        type: "audio-toggled",
      });

      setFanAudioStatus((prevStatus) => ({
        ...prevStatus,
        [subscriber.stream.connection.connectionId]: stateOfAudio,
      }));
    } else {
      console.log("오디오 트랙이 없습니다 : ", videoObj.id);
    }
  };

  const sendVideoToggleSignal = (videoObj, subscriber, session) => {
    const videoElement = videoObj.video;
    const videoTracks = getVideoFromVideo(videoElement);

    if (videoTracks.length > 0) {
      const stateOfVideo = toggleFanVideo(videoTracks);
      console.log("비디오 트랙 토글됨: ", videoObj.id);

      session.signal({
        data: JSON.stringify({
          connectionId: subscriber.stream.connection.connectionId,
          video: stateOfVideo,
        }),
        to: [],
        type: "video-toggled",
      });
    } else {
      console.log("비디오 트랙이 없습니다: ", videoObj.id);
    }
  };

  const controlFansAudio = useCallback(
    (subscriber) => {
      if (subscriber && Array.isArray(subscriber.videos)) {
        subscriber.videos.forEach((videoObj) => {
          sendAudioToggleSignal(videoObj, subscriber, session);
        });
      } else {
        console.log("참여자나 비디오 배열이 없습니다.");
      }
    },
    [session]
  );

  const controlFansVideo = useCallback(
    (subscriber) => {
      if (subscriber && Array.isArray(subscriber.videos)) {
        subscriber.videos.forEach((videoObj) => {
          sendVideoToggleSignal(videoObj, subscriber, session);
        });
      } else {
        console.log("subscriber 객체나 videos 배열이 정의되지 않았습니다.");
      }
    },
    [session]
  );

  const toggleFanVisibility = useCallback(
    (subscriber) => {
      const subscriberId = subscriber.id;
      if (visibleSubscribers.includes(subscriber)) {
        setVisibleSubscribers((prev) =>
          prev.filter((sub) => sub.id !== subscriberId)
        );
      } else {
        setVisibleSubscribers((prev) => [...prev, subscriber]);
      }

      session.signal({
        data: JSON.stringify({
          connectionId: subscriber.stream.connection.connectionId,
          visible: !visibleSubscribers.includes(subscriber),
        }),
        to: [],
        type: "visibility-toggled",
      });
    },
    [session, visibleSubscribers]
  );

  const updateStateWithSignal = useCallback(
    (event) => {
      const data = JSON.parse(event.data);

      if (event.type === "signal:audio-toggled") {
        console.log("오디오 토글 신호 받음: ", data);
        setFanAudioStatus((prevStatus) => ({
          ...prevStatus,
          [data.connectionId]: data.audio,
        }));

        if (data.connectionId === session.connection.connectionId) {
          setMyAudioStatus(data.audio);
        }
      }

      if (event.type === "signal:video-toggled") {
        console.log("비디오 토글 신호 받음: ", data);
      }

      if (event.type === "signal:visibility-toggled") {
        const subscriberId = data.connectionId;
        const subscriber = subscribers.find(
          (sub) => sub.stream.connection.connectionId === subscriberId
        );
        if (subscriber) {
          if (data.visible) {
            setVisibleSubscribers((prev) => [...prev, subscriber]);
          } else {
            setVisibleSubscribers((prev) =>
              prev.filter(
                (sub) => sub.stream.connection.connectionId !== subscriberId
              )
            );
          }
        }
      }

      if (event.type === "signal:corner-changed") {
        const corner = JSON.parse(event.data);
        setCurrentCorner(corner);
        if (corner.name === "사연 읽기 코너") {
          setCurrentStoryIndex(-1);
        }
      }

      if (event.type === "signal:story-changed") {
        const { nextIndex } = JSON.parse(event.data);
        setCurrentStoryIndex(nextIndex);
      }
    },
    [session, subscribers]
  );

  useEffect(() => {
    if (session) {
      session.on("signal:audio-toggled", updateStateWithSignal);
      session.on("signal:video-toggled", updateStateWithSignal);
      session.on("signal:visibility-toggled", updateStateWithSignal);
      session.on("signal:corner-changed", updateStateWithSignal);
      session.on("signal:story-changed", updateStateWithSignal);
    }
  }, [session, updateStateWithSignal]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [leaveSession]);

  const getToken = useCallback(async () => {
    return createSession(mySessionId).then((sessionId) =>
      createToken(sessionId)
    );
  }, [mySessionId]);

  const createSession = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  };

  const createToken = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  };

  return (
    <div className="container">
      {session === undefined ? (
        <div id="join">
          <div id="img-div">
            <img
              src="resources/images/openvidu_grey_bg_transp_cropped.png"
              alt="OpenVidu logo"
            />
          </div>
          <div id="join-dialog" className="jumbotron vertical-center">
            <h1> Join a video session </h1>
            <form className="form-group" onSubmit={joinSession}>
              <p>
                <label>Participant: </label>
                <input
                  className="form-control"
                  type="text"
                  id="userName"
                  value={myUserName}
                  onChange={handleChangeUserName}
                  required
                />
              </p>
              <p>
                <label> Session: </label>
                <input
                  className="form-control"
                  type="text"
                  id="sessionId"
                  value={mySessionId}
                  onChange={handleChangeSessionId}
                  required
                />
              </p>
              <p>
                <label> Are you the creator? </label>
                <input
                  type="checkbox"
                  checked={isCreator}
                  onChange={() => setIsCreator(!isCreator)}
                />
              </p>
              <p className="text-center">
                <input
                  className="btn btn-lg btn-success"
                  name="commit"
                  type="submit"
                  value="JOIN"
                />
              </p>
            </form>
          </div>
        </div>
      ) : null}

      {session !== undefined ? (
        <div id="session">
          <div id="session-header">
            <h1 id="session-title">{mySessionId}</h1>
            <input
              className="btn btn-large btn-danger"
              type="button"
              id="buttonLeaveSession"
              onClick={leaveSession}
              value="Leave session"
            />
            {isCreator && (
              <input
                className="btn btn-large btn-success"
                type="button"
                id="buttonSwitchCamera"
                onClick={switchCamera}
                value="Switch Camera"
              />
            )}
            {isCreator && (
              <input
                className="btn btn-large btn-warning"
                type="button"
                id="buttonToggleAudio"
                onClick={toggleMyAudio}
                value="Toggle Audio"
              />
            )}
            <input
              className="btn btn-large btn-warning"
              type="button"
              id="buttonToggleVideo"
              onClick={toggleMyVideo}
              value="Toggle Video"
            />
          </div>

          {currentCorner && (
            <div id="corner-info">
              <h2>현재 코너: {currentCorner.name}</h2>
              <p>{currentCorner.description}</p>
            </div>
          )}

          {currentCorner && currentCorner.name === "사연 읽기 코너" && (
            <StoryContainer
              stories={stories}
              currentStoryIndex={currentStoryIndex}
              handleNextStory={handleNextStory}
              isCreator={isCreator}
            />
          )}

          <VideoContainer
            publisher={publisher}
            subscribers={subscribers}
            handleMainVideoStream={handleMainVideoStream}
            mainStreamManager={mainStreamManager}
            isCreator={isCreator}
            creatorStream={creatorStream}
            visibleSubscribers={visibleSubscribers}
            fanAudioStatus={fanAudioStatus}
            toggleFanVisibility={toggleFanVisibility}
            controlFansAudio={controlFansAudio}
            controlFansVideo={controlFansVideo}
            myAudioStatus={myAudioStatus}
            currentCorner={currentCorner}
          />

          <Chat
            chatMessages={chatMessages}
            newMessage={newMessage}
            handleChangeMessage={handleChangeMessage}
            handleSendMessage={handleSendMessage}
            userColors={userColors}
          />

          {isCreator && (
            <CornerControl
              corners={corners}
              handleChangeCorner={handleChangeCorner}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
