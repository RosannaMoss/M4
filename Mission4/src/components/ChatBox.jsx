import React from "react";
import ChatMessage from "./ChatMessage";
import styles from "./ChatBox.css";

const ChatBox = () => {
  const messages = [
    { id: 1, text: "Hello! How can I help you?", sender: "bot" },
    { id: 2, text: "I need help with my order.", sender: "user" },
    { id: 3, text: "Sure! Can you provide your order ID?", sender: "bot" },
  ];

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatBox}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className={styles.chatInputContainer}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Type a message..."
        />
        <button className={styles.chatSendButton}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
