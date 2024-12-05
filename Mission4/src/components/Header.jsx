import React from "react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>Live Chat</h1>
      <nav className={styles.nav}>
        <button className={styles.navButton}>Home</button>
        <button className={styles.navButton}>About</button>
        <button className={styles.navButton}>Contact Us</button>
      </nav>
    </header>
  );
};

export default Header;
