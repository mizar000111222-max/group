import React, { Component } from "react";
import './NavBar.css'

class Navbar extends Component {
    render() {
        return(
            <nav className="NavbarItems">
                <h1 className="navbar-logo">
                    <i >
                        <img src="images/wp.png" alt="whatsapp logo" />
                    </i>
                </h1>
                <h1 className="text-center text-white font-bold">Group WhatsApp</h1>
            </nav>
        )
    }
}

export default Navbar