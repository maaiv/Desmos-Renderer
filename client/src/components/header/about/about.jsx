import './about.css'
import { FaQuestionCircle } from "react-icons/fa";
import React, { useState } from 'react';


function About() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>

    <div className="about-container">
        <div className="about-button" onClick={()=>{setIsPopupOpen(true)}}>
            <FaQuestionCircle size={24} color="rgb(var(--text-colour))" />
        </div>
    </div>



        <div className={`about-overlay ${isPopupOpen ? "open" : ""}`}>
            <div className="about-content">

                <button className="close-button" onClick={() => { setIsPopupOpen(false)}}>
                    &times;
                </button>

                <h2>About</h2>
                <p className='about-text'>
                    Here are some hotkeys: <br/> <br/>
                    [1]: Line Tool <br/>
                    [2]: Bezier Tool <br/>
                    [3]: Select Tool <br/>
                    [Alt]: Free Move <br/>
                    [Del]: Delete selected graph <br/>
                    [Ctrl + z]: Undo last action <br/>
                    [q]: Show desmos graph buttons <br/>
                    [p]: Hide desmos graph buttons <br/> <br/>


                    I have no idea what else to put here...<br/>
                    This project was fun :))
                </p>

            </div>
        </div>
    
        </>
    )
}

export default About;