import React from "react";
import styles from "./ChatMessage.css";

const ChatMessage = ({ message, sender }) => {
  const isUser = sender === "user";
  return (
    <div className={`chat-message ${isUser ? "user-message" : "bot-message"}`}>
      {message}
    </div>
  );
};

export default ChatMessage;
