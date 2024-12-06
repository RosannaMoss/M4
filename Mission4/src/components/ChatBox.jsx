import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import styles from "./ChatBox.module.css";

const ChatBox = () => {
  // Initialize messages with Tina's introductory message
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
      sender: "bot",
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async (message) => {
    // Append user message to chat
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
        body: JSON.stringify({ userMessage: message }), // Send only the user's message
      });

      const text = await response.text();
      const json = JSON.parse(text);

      // Add Tina's response to the chat
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
      sendMessage(userInput); // Pass only the user input
      setUserInput(""); // Clear the input box after sending
    }
  };

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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)} // Update userInput state
        />
        <button className={styles.chatSendButton} onClick={handleSendClick}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
