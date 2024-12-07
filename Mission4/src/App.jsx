import React from "react";
import { useState } from "react";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "light" : "dark"
    );
  };

  return (
    <>
      <div>
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <ChatBox isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

export default App;
