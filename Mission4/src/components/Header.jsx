import React from "react";
import styles from "./Header.module.css";

const Header = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className={`${styles.header} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.darkMode}>
        <label className={styles.themeSwitch}>
          <input
            type="checkbox"
            className={styles.themeSwitchCheckbox}
            onChange={toggleTheme} // Link toggleTheme function
            checked={isDarkMode} // Sync checkbox with dark mode state
          />
          <div className={styles.themeSwitchContainer}>
            <div className={styles.themeSwitchClouds} />
            <div className={styles.themeSwitchStarsContainer}>
              {/* Updated Stars SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 144 55"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20 10L25 25L10 15L30 15L15 25Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className={styles.themeSwitchCircleContainer}>
              <div className={styles.themeSwitchSunMoonContainer}>
                <div className={styles.themeSwitchMoon}>
                  <div className={styles.themeSwitchSpot} />
                  <div className={styles.themeSwitchSpot} />
                  <div className={styles.themeSwitchSpot} />
                </div>
              </div>
            </div>
          </div>
        </label>
        <button className={styles.liveChatButton}>
          <div className={styles.svggWrapperOne}>
            <div className={styles.svgWrapper}>
              {/* Button SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={24}
                height={24}
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                />
              </svg>
            </div>
          </div>
          <span>Live Chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
