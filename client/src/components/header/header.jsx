import './header.css'
import { FaRegUserCircle } from "react-icons/fa";
import Account from "./account/account.jsx"
function Header() {

    return (
        <header className='component-header'>
            <div className="user-container">
            <Account/>
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
