// import "./App.css";
// import { useState } from "react";

// // import { Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
// import ChatApp from "./components/ChatBox";

// function App() {
//   return (
//     <div>
//       <Header></Header>
//       <ChatApp></ChatApp>
//     </div>
//   );
// }

// export default App;

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
