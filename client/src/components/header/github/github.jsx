import React from "react";
import './github.css'
import { FaGithub } from "react-icons/fa";

function Github() {

  return (
    <div className="github-container">
        <a href="https://github.com/maaiv/Desmos-Renderer" target="_blank" className="github-button">
            <FaGithub size={25} color="rgb(var(--text-colour))" />
        </a>
    </div>
  );
}

export default Github;