import './header.css'
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from 'react';
import Account from "./account/account.jsx"
import SaveButton from "./saveButton/saveButton.jsx";
function Header() {


    return (
        <header className='component-header'>

            <div className="account-links">
                <div className="user-container">
                    <Account/>
                </div>

                <SaveButton />
            </div>


            <ul className="nav-links">
                <li className="nav-item">
                    <a href="#" className="nav-link">Light</a>
                </li>
                <li className="nav-item">
                    <a href="#contact" className="nav-link">Contact</a>
                </li>
                <li className="nav-item">
                    <a href="#about" className="nav-link">About</a>
                </li>
            </ul>
        </header >
  )
}

export default Header
