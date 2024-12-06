import React from "react";
import styles from "./Header.module.css";
import planeLogo from "../assets/paperPlane.png";
import styled from "styled-components";

const Header = () => {
  return (
    <header className={styles.header}>
      <button className={styles.headerButton}>
        <div className={styles.svggWrapperOne}>
          <div className={styles.svgWrapper}>
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
      </button>{" "}
    </header>
  );
};

export default Header;

// export default Header;
