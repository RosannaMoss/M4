import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import styles from "./ChatBox.module.css";

const ChatBox = ({ isDarkMode }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
      sender: "bot",
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async (message) => {
    const newMessages = [
      ...messages,
      { id: messages.length + 1, text: message, sender: "user" },
    ];
    setMessages(newMessages);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: message }),
      });

      const text = await response.text();
      const json = JSON.parse(text);

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: json.botResponse, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: "I'm sorry, there was an issue with the server. Please try again later.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleSendClick = () => {
    if (userInput.trim()) {
      sendMessage(userInput);
      setUserInput("");
    }
  };

  return (
    <div
      className={`${styles.chatContainer} ${
        isDarkMode ? styles.darkMode : styles.lightMode
      }`}
    >
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className={styles.chatSendButton} onClick={handleSendClick}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
