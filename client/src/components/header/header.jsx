import './header.css'
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from 'react';
import { getCanvasState, setCanvasState } from "../calculatorApp/canvas/canvas.jsx";
import { useAccountContext } from "../../accountContext.jsx";
import Account from "./account/account.jsx"
import SaveButton from "./saveButton/saveButton.jsx";
import Theme from './theme/theme.jsx';
import Github from './github/github.jsx';
import About from './about/about.jsx';
function Header() {

    const { userGraphs } = useAccountContext();


    function getCanvasTitle() {

        if (userGraphs.length === 0) return "Untitled Graph";
        const currentGraph = getCanvasState();

        if ( currentGraph.graphId === null ) {
            return "Untitled Graph";
        }
        else {
            return userGraphs.filter((graph)=>graph._id === currentGraph.graphId)[0].title;
        }
    }

    return (
        <header className='component-header'>

            <div className="account-links">
                <Account/>

                <SaveButton />
            </div>

            <div className="header-title">
                {getCanvasTitle()}
            </div>


            <ul className="nav-links">
                <li className="nav-item">
                    <Theme />
                </li>
                <li className="nav-item">
                    <Github/>
                </li>
                <li className="nav-item">
                    <About/>
                </li>
            </ul>
        </header >
  )
}

export default Header
