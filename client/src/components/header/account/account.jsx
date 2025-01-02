import "./account.css";
import React, { useEffect, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const db = "https://desmos-renderer.onrender.com"
// const db = "http://localhost:5050"; 

function Account() {
    // State to control the dropdown visibility
    const [isOpen, setIsOpen] = useState(false);
    const [graphs, setGraphs] = useState([]);

    const { loginWithRedirect } = useAuth0();

    const { logout } = useAuth0();

    const { getIdTokenClaims, user, isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        if (isAuthenticated) {
            let userInfo = {userid: 0, email: user.email};
            addUser(userInfo);
        }
        return;
        }, [isAuthenticated]
    )

    useEffect(() => {
        async function getGraphs() {
            const response = await fetch(db + `/graphs/`);

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const graphs = await response.json();
            setGraphs(graphs);
        }
            getGraphs();
            return;
        }, []
    );

    async function deleteGraphs(id) {
        await fetch(db + `/graphs/${id}`, {
            method: "DELETE",
        });
        const newGraphs = graphs.filter((el) => el._id !== id);
        setGraphs(newGraphs);
    }

    async function addUser(payload) {
        try {
            // Check if the user exists


            const checkResponse = await fetch(db + `/users/email/${payload.email}`);
    
            if (!checkResponse.ok) {
                const message = `An error occurred searching for : ${checkResponse.statusText}`;
                console.error(message);
                return;
            }

            let checkData = await checkResponse.json();

            // If the user exists, log and return
            if (checkData.found) {
                console.log("User already exists:", checkData.user);
                return checkData.user;
            }
    
            // Add the user if they don't exist
            const addResponse = await fetch(db + "/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload), // Send the payload
            });
    
            if (!addResponse.ok) {
                throw new Error(`Error adding user: ${addResponse.statusText}`);
            }
    
            const newUser = await addResponse.json();
            console.log("User added successfully:", newUser);
    
            // Optionally update state if needed
            return newUser;
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }



    async function onSubmit() {
        console.log(graphs);
        const payload = {
            name: "Example Graph",
            description: "This is a new graph created via the 'I have no idea' button.",
            createdBy: user.email, // Use the authenticated user's email
        };
    
        try {
            const response = await fetch(db + "/graphs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload), // Send the payload
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const newGraph = await response.json();
            setGraphs((prevGraphs) => [...prevGraphs, newGraph]); // Update the state
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }


    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    // Log In button click handler
    const handleLogin = () => {
        console.log("Log In button clicked!");
    };


    const redirectUri = 
    process.env.NODE_ENV === "production"
      ? "https://maaiv.github.io/Desmos-Renderer"
      : "http://localhost:3000/Desmos-Renderer";

    return (
        <div className="account-container">
            {/* Button to toggle the dropdown */}
            <button className="account-button" onClick={toggleDropdown}>
                <FaRegUserCircle size={25} color="var(--text-colour)" />
            </button>

            {/* Dropdown Menu */}


            <div className={`dropdown-menu ${isOpen ? "open" : ""}`}>
                {!isAuthenticated && ( <button className="login-button" onClick={() => loginWithRedirect()}>
                    Log In
                </button>)}



                {isAuthenticated && ( <> 
                    <div className="user-info"> <img src={user.picture} alt={user.picture} /> {user.name} </div> 
                    <button className="login-button" onClick={() => logout({ logoutParams: { returnTo: redirectUri } })}>
                        Log Out
                    </button> 

                    <button className="login-button" onClick={onSubmit}>
                    I have no idea
                    </button>
                </>)}

            </div>
        </div>
    );
}

export default Account;
