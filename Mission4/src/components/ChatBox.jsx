import React, { useState } from "react";
import styles from "./ChatBox.module.css";

const ChatApp = ({ isDarkMode }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "I’m Tina. I help you choose the right insurance policy. May I ask you a few  questions to make sure I recommend the best policy for you?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [sessionId, setSessionId] = useState(null); // Track session ID
  const [loading, setLoading] = useState(false);

  const validateInput = (input) => {
    if (typeof input !== "string" || input.trim() === "") {
      console.error("Invalid input. Expected a non-empty string.");
      return false;
    }
    return true;
  };

  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (!validateInput(trimmedInput)) {
      alert("Please enter a valid response.");
      return;
    }

    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput(""); // Clear the input field
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: trimmedInput, sessionId }), // Include sessionId
      });

      if (response.ok) {
        const data = await response.json();

        // Update session ID if it's provided in the response
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        const botMessage = { sender: "bot", text: data.botResponse };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.botResponse ||
          "I'm sorry, I couldn't process your request.";
        setMessages((prev) => [...prev, { sender: "bot", text: errorMessage }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "An error occurred. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.chatContainer} ${
        isDarkMode ? styles.darkMode : styles.lightMode
      }`}
    >
      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.sender === "bot" ? styles.bot : styles.user
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.chatInputContainer}>
        <input
          type="text"
          className={styles.chatInput}
          value={userInput}
          placeholder="Type your response..."
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleSendMessage();
          }}
        />
        <button
          className={styles.chatSendButton}
          onClick={handleSendMessage}
          disabled={loading || !userInput.trim()} // Disable when loading or input is empty
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
