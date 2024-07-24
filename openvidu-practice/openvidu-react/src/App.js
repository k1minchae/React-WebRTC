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

// 코너 목록 정의
const CORNERS = [
  { name: "소통 코너", description: "팬들과 소통하는 시간입니다." },
  { name: "게임 코너", description: "팬들과 함께 게임을 즐기는 시간입니다." },
  { name: "편지 코너", description: "팬들에게 편지를 읽어주는 시간입니다." },
  { name: "사연 읽기 코너", description: "사연을 읽어주는 시간입니다." },
];

// 사연 목록 정의
const STORIES = [
  { title: "사연 1", content: "이것은 첫 번째 사연입니다." },
  { title: "사연 2", content: "이것은 두 번째 사연입니다." },
  { title: "사연 3", content: "이것은 세 번째 사연입니다." },
];

// 랜덤 색상 생성 함수
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function App() {
  const [mySessionId, setMySessionId] = useState("SessionA"); // 세션 ID 상태
  const [myUserName, setMyUserName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  ); // 사용자 이름 상태
  const [isCreator, setIsCreator] = useState(false); // 크리에이터 여부 상태
  const [session, setSession] = useState(undefined); // 세션 상태
  const [mainStreamManager, setMainStreamManager] = useState(undefined); // 메인 스트림 관리자 상태
  const [publisher, setPublisher] = useState(undefined); // 퍼블리셔 상태
  const [subscribers, setSubscribers] = useState([]); // 구독자 상태
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null); // 현재 비디오 장치 상태
  const [visibleSubscribers, setVisibleSubscribers] = useState([]); // 보이는 구독자 상태
  const [creatorStream, setCreatorStream] = useState(null); // 크리에이터 스트림 상태
  const [fanAudioStatus, setFanAudioStatus] = useState({}); // 팬 오디오 상태
  const [myAudioStatus, setMyAudioStatus] = useState(true); // 나의 오디오 상태
  const [chatMessages, setChatMessages] = useState([]); // 채팅 메시지 상태
  const [newMessage, setNewMessage] = useState(""); // 새로운 메시지 상태
  const [userColors, setUserColors] = useState({}); // 사용자 색상 상태
  const [corners, setCorners] = useState(CORNERS); // 코너 목록 상태
  const [currentCorner, setCurrentCorner] = useState(null); // 현재 코너 상태
  const [stories, setStories] = useState(STORIES); // 사연 목록 상태
  const [currentStoryIndex, setCurrentStoryIndex] = useState(-1); // 현재 사연 인덱스 상태

  const OV = useRef(new OpenVidu()); // OpenVidu 인스턴스 생성

  // 세션 ID 변경 핸들러
  const handleChangeSessionId = useCallback((e) => {
    setMySessionId(e.target.value);
  }, []);

  // 사용자 이름 변경 핸들러
  const handleChangeUserName = useCallback((e) => {
    setMyUserName(e.target.value);
  }, []);

  // 채팅 메시지 변경 핸들러
  const handleChangeMessage = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  // 새로운 채팅 메시지를 보내는 함수
  const handleSendMessage = useCallback(
    (event) => {
      event.preventDefault();
      if (newMessage.trim() !== "") {
        session.signal({
          data: JSON.stringify({ user: myUserName, text: newMessage }),
          to: [], // 모든 참가자에게 전송
          type: "chat",
        });
        setNewMessage("");
      }
    },
    [session, newMessage, myUserName]
  );

  // 메인 비디오 스트림 설정 핸들러
  const handleMainVideoStream = useCallback(
    (stream) => {
      if (mainStreamManager !== stream) {
        setMainStreamManager(stream);
      }
    },
    [mainStreamManager]
  );

  // 코너 전환 핸들러
  const handleChangeCorner = useCallback(
    (corner) => {
      setCurrentCorner(corner);
      if (corner.name === "사연 읽기 코너") {
        setCurrentStoryIndex(-1);
      }
      session.signal({
        data: JSON.stringify(corner),
        to: [], // 모든 참가자에게 전송
        type: "corner-changed",
      });
    },
    [session]
  );

  // 다음 사연으로 넘어가는 함수
  const handleNextStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < stories.length) {
        session.signal({
          data: JSON.stringify({ nextIndex }),
          to: [], // 모든 참가자에게 전송
          type: "story-changed",
        });
        return nextIndex;
      }
      return prevIndex;
    });
  }, [stories, session]);

  // 세션에 참여하는 함수
  const joinSession = useCallback(
    (event) => {
      event.preventDefault();
      const mySession = OV.current.initSession();

      // 새로운 스트림이 생성될 때 구독 추가
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

      // 스트림이 종료될 때 구독 제거
      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      // 예외 발생 시 콘솔에 경고 출력
      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      // 채팅 신호 수신 시 채팅 메시지 업데이트
      mySession.on("signal:chat", (event) => {
        const message = JSON.parse(event.data);
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      // 코너 변경 신호 수신 시 현재 코너 업데이트
      mySession.on("signal:corner-changed", (event) => {
        const corner = JSON.parse(event.data);
        setCurrentCorner(corner);
        if (corner.name === "사연 읽기 코너") {
          setCurrentStoryIndex(-1);
        }
      });

      // 사연 변경 신호 수신 시 현재 사연 인덱스 업데이트
      mySession.on("signal:story-changed", (event) => {
        const { nextIndex } = JSON.parse(event.data);
        setCurrentStoryIndex(nextIndex);
      });

      setSession(mySession);
    },
    [isCreator]
  );

  // 세션이 설정되면 토큰을 가져와서 연결
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

  // 세션을 떠나는 함수
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

  // 카메라 전환 함수
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

  // 구독자 삭제 함수
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

  // 본인 오디오 토글 함수
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
        to: [], // 모든 참가자에게 전송
        type: "audio-toggled",
      });
    }
  }, [publisher, session]);

  // 본인 비디오 토글 함수
  const toggleMyVideo = useCallback(() => {
    if (publisher) {
      publisher.publishVideo(!publisher.stream.videoActive);
    }
  }, [publisher]);

  // 팬의 오디오 트랙 토글 함수
  const toggleFanAudio = (audioTracks) => {
    const stateOfAudio = !audioTracks[0].enabled;
    audioTracks[0].enabled = stateOfAudio;
    return stateOfAudio;
  };

  // 팬의 비디오 트랙 토글 함수
  const toggleFanVideo = (videoTracks) => {
    const stateOfVideo = !videoTracks[0].enabled;
    videoTracks[0].enabled = stateOfVideo;
    return stateOfVideo;
  };

  // 비디오 요소에서 오디오 트랙을 가져오는 함수
  const getAudioFromVideo = (videoElement) => {
    if (videoElement && videoElement.srcObject) {
      const mediaStream = videoElement.srcObject;
      return mediaStream.getAudioTracks();
    }
    return [];
  };

  // 비디오 요소에서 비디오 트랙을 가져오는 함수
  const getVideoFromVideo = (videoElement) => {
    if (videoElement && videoElement.srcObject) {
      const mediaStream = videoElement.srcObject;
      return mediaStream.getVideoTracks();
    }
    return [];
  };

  // 비디오 객체에서 오디오 트랙을 토글하고 신호를 보내는 함수
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
        to: [], // 모든 참가자에게 전송
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

  // 비디오 객체에서 비디오 트랙을 토글하고 신호를 보내는 함수
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
        to: [], // 모든 참가자에게 전송
        type: "video-toggled",
      });
    } else {
      console.log("비디오 트랙이 없습니다: ", videoObj.id);
    }
  };

  // 특정 팬의 오디오 제어 함수
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

  // 특정 팬의 비디오를 제어하는 함수
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

  // 특정 팬의 비디오를 모든 참가자에게 보이거나 숨기는 함수
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
        to: [], // 모든 참가자에게 전송
        type: "visibility-toggled",
      });
    },
    [session, visibleSubscribers]
  );

  // 신호를 받은 클라이언트에서 상태를 업데이트하는 함수
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

  // 세션에 신호 이벤트 핸들러 등록
  useEffect(() => {
    if (session) {
      session.on("signal:audio-toggled", updateStateWithSignal);
      session.on("signal:video-toggled", updateStateWithSignal);
      session.on("signal:visibility-toggled", updateStateWithSignal);
      session.on("signal:corner-changed", updateStateWithSignal);
      session.on("signal:story-changed", updateStateWithSignal);
    }
  }, [session, updateStateWithSignal]);

  // 페이지를 떠나기 전 세션을 떠나는 이벤트 핸들러 등록
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [leaveSession]);

  // 세션 토큰 가져오기
  const getToken = useCallback(async () => {
    return createSession(mySessionId).then((sessionId) =>
      createToken(sessionId)
    );
  }, [mySessionId]);

  // 세션 생성 함수
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

  // 세션 토큰 생성 함수
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
