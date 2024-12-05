import React from "react";
import styles from "./ChatMessage.module.css";

const ChatMessage = ({ message, sender }) => {
  const isUser = sender === "user";
  return (
    <div className={isUser ? styles.userWrapper : styles.botWrapper}>
      <div className={isUser ? styles.userMessage : styles.botMessage}>
        {message}
      </div>
    </div>
  );
};

export default ChatMessage;
