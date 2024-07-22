import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import UserVideoComponent from "./UserVideoComponent";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CORNERS = [
  { name: "소통 코너", description: "팬들과 소통하는 시간입니다." },
  { name: "게임 코너", description: "팬들과 함께 게임을 즐기는 시간입니다." },
  { name: "편지 코너", description: "팬들에게 편지를 읽어주는 시간입니다." },
];

export default function App() {
  const [mySessionId, setMySessionId] = useState("SessionA");
  const [myUserName, setMyUserName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [isCreator, setIsCreator] = useState(false); // 크리에이터인지 여부 설정
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [visibleSubscribers, setVisibleSubscribers] = useState([]); // 보이는 구독자들
  const [creatorStream, setCreatorStream] = useState(null); // 크리에이터 스트림
  const [fanAudioStatus, setFanAudioStatus] = useState({}); // 팬 오디오 상태
  const [myAudioStatus, setMyAudioStatus] = useState(true); // 내 오디오 상태
  const [chatMessages, setChatMessages] = useState([]); // 채팅 메시지 상태
  const [newMessage, setNewMessage] = useState(""); // 새로운 메시지 입력 상태
  const [userColors, setUserColors] = useState({}); // 사용자 색상 상태
  const [corners, setCorners] = useState(CORNERS); // 코너 정보 상태
  const [currentCorner, setCurrentCorner] = useState(null); // 현재 코너 상태

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
      session.signal({
        data: JSON.stringify(corner),
        to: [], // 모든 참가자에게 전송
        type: "corner-changed",
      });
    },
    [session]
  );

  // 세션에 참여하는 함수
  const joinSession = useCallback(
    (event) => {
      event.preventDefault(); // 폼 제출 기본 동작 방지
      const mySession = OV.current.initSession();

      // 스트림 생성 시 구독 추가
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

      // 스트림 종료 시 구독 삭제
      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      // 예외 발생 시 경고 로그 출력
      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      // 채팅 메시지 수신 핸들러 추가
      mySession.on("signal:chat", (event) => {
        const message = JSON.parse(event.data);
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      // 코너 전환 수신 핸들러 추가
      mySession.on("signal:corner-changed", (event) => {
        const corner = JSON.parse(event.data);
        setCurrentCorner(corner);
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
            publishAudio: isCreator, // 크리에이터면 오디오 활성화, 팬이면 비활성화
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
    setChatMessages([]); // 채팅 메시지 초기화
    setNewMessage("");
    setUserColors({});
    setCurrentCorner(null); // 현재 코너 초기화
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
            publishAudio: isCreator, // 크리에이터는 오디오 활성화, 팬은 비활성화
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

      // 팬이 자신의 오디오 상태를 변경했을 때 신호를 보냅니다.
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

      // 오디오 상태 변경을 다른 참가자들에게 알리기 위해 신호를 보냄
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

      // 비디오 상태 변경을 다른 참가자들에게 알리기 위해 신호를 보냄
      session.signal({
        data: JSON.stringify({
          connectionId: subscriber.stream.connection.connectionId,
          video: stateOfVideo,
        }),
        to: [], // 모두에게 신호 전송
        type: "video-toggled", // 신호 타입을 'video-toggled'로 설정
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
        // 이미 보이는 경우 숨김
        setVisibleSubscribers((prev) =>
          prev.filter((sub) => sub.id !== subscriberId)
        );
      } else {
        // 보이지 않는 경우 표시
        setVisibleSubscribers((prev) => [...prev, subscriber]);
      }

      // 팬의 비디오 상태 변경을 다른 참가자들에게 알림
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
        // 해당 connectionId를 가진 참가자의 오디오 상태를 업데이트
        console.log("오디오 토글 신호 받음: ", data);
        // 팬의 오디오 상태 업데이트
        setFanAudioStatus((prevStatus) => ({
          ...prevStatus,
          [data.connectionId]: data.audio,
        }));

        // 만약 이 신호를 받은 팬이라면 자신의 오디오 상태 업데이트
        if (data.connectionId === session.connection.connectionId) {
          setMyAudioStatus(data.audio);
        }
      }

      if (event.type === "signal:video-toggled") {
        // 해당 connectionId를 가진 참가자의 비디오 상태를 업데이트
        console.log("비디오 토글 신호 받음: ", data);
        // 여기서 UI를 업데이트하여 비디오 상태를 반영
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
    return response.data; // 세션 ID 반환
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

          <div id="video-container" className="col-md-12">
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
                        <span>
                          {isAudioActive ? "마이크 ON" : "마이크 OFF"}
                        </span>
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

          <div id="chat-container" className="col-md-12">
            <h3>채팅</h3>
            <div id="chat-box">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className="chat-message"
                  style={{ color: userColors[msg.user] }}
                >
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={handleChangeMessage}
                placeholder="메시지를 입력하세요"
              />
              <button type="submit">전송</button>
            </form>
          </div>

          {isCreator && (
            <div id="corner-container" className="col-md-12">
              <h3>코너 전환</h3>
              {corners.map((corner, index) => (
                <button key={index} onClick={() => handleChangeCorner(corner)}>
                  {corner.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
