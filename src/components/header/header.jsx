

import './header.css'

function Header() {

    return (
        <header className='component-header'>
            <div className="icon-container">
                tempIcon
            </div>
            <ul className="nav-links">
                <li className="nav-item">
                    <a href="#home" className="nav-link">Home</a>
                </li>
                <li className="nav-item">
                    <a href="#about" className="nav-link">Contact</a>
                </li>
                <li className="nav-item">
                    <a href="#contact" className="nav-link">About</a>
                </li>
            </ul>
        </header >
  )
}

export default Header
