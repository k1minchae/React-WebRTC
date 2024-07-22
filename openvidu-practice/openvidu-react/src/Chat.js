import React from "react";

const Chat = ({
  chatMessages,
  newMessage,
  handleChangeMessage,
  handleSendMessage,
  userColors,
}) => {
  return (
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
  );
};

export default Chat;
