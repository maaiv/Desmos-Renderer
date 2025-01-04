import React, { useState } from "react";
import './theme.css'
const lightTheme = {
    "--accent-colour": "216, 132, 255",
    "--accent-colour2": "217, 160, 244",
    "--background-colour": "239, 234, 242",
    "--background-colour2": "220, 216, 224",
    "--text-colour": "20, 19, 20",
};

const darkTheme = {
    "--accent-colour": "174, 0, 255",
    "--accent-colour2": "147, 18, 207",
    "--background-colour": "43, 40, 44",
    "--background-colour2": "58, 53, 59",
    "--text-colour": "221, 221, 221",
};

function Theme() {
  const [theme, setTheme] = useState("dark");

  const switchTheme = (newTheme) => {
    const themeVariables = newTheme === "light" ? lightTheme : darkTheme;

    for (const [key, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(key, value);
    }

    setTheme(newTheme);
  };

  return (
    <div className="theme-container">
      <div className={`theme-button-light ${theme === "light" ? "active" : ""}`} onClick={() => switchTheme("light")}>
        
      </div>

      <div className={`theme-button-dark ${theme === "dark" ? "active" : ""}`} onClick={() => switchTheme("dark")}>
      </div>
    </div>
  );
}

export default Theme;