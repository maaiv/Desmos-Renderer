import "./account.css";
import React, { useEffect, useState, useRef } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useAccountContext } from "../../../accountContext";

import MyGraphs from "./myGraphs/myGraphs";


function Account() {
    // State to control the dropdown visibility

    const { setUserId, userGraphs, setUserGraphs } = useAccountContext();

    const [isOpen, setIsOpen] = useState(false);

    const [isPopoutOpen, setIsPopoutOpen] = useState(false);

    const { loginWithRedirect } = useAuth0();
    const dropdownRef = useRef(null); // Ref for the dropdown container
    
    const { logout } = useAuth0();

    const { user, isAuthenticated } = useAuth0();


    // Returns the currentUserId
    async function addUser(userData) {
        try {
            // Check if the user exists
            const checkResponse = await fetch(db + `/users/email/${userData.email}`);
    
            if (!checkResponse.ok) {
                const message = `An error occurred searching for : ${checkResponse.statusText}`;
                console.error(message);
                return;
            }

            let checkData = await checkResponse.json();

            // If the user exists, log and return
            if (checkData.found) {
                console.log("User already exists:", checkData.user);
                return checkData.user._id;
            }
    
            // Add the user if they don't exist
            const addResponse = await fetch(db + "/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData), // Send the payload
            });
    
            if (!addResponse.ok) {
                throw new Error(`Error adding user: ${addResponse.statusText}`);
            }
    
            const newUser = await addResponse.json();
            console.log("User added successfully:", newUser);
    
            // Optionally update state if needed
            return newUser.insertedId;
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }

    // Returns an array containing all the current user's graphs
    async function getGraphs(userId) {
        const response = await fetch(db + `/graphs/userid/${userId}`);
        
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            return;
        }
        const graphs = await response.json();
        return graphs;
    }



    // Minimize dropdown when clicked outside
    useEffect(() => {
        // Close the dropdown when clicking outside
        function handleOutsideClick(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
    
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    // Add user to database
    useEffect(() => {

        async function handleLogin() {
            const currentUserId = await addUser({userid: 0, email: user.email});
            console.log(currentUserId);
            
            const currentUserGraphs = await getGraphs(currentUserId)
            setUserId(currentUserId);
            setUserGraphs(currentUserGraphs);
            console.log(currentUserGraphs);
        }
        if (isAuthenticated) {
            handleLogin()
        }
        return;
        }, [isAuthenticated]
    )


    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };


    const redirectUri = 
    process.env.NODE_ENV === "production"
        ? "https://maaiv.github.io/Desmos-Renderer"
        : "http://localhost:3000/Desmos-Renderer";

    const db = 
    process.env.NODE_ENV === "production"
            ? "https://desmos-renderer.onrender.com"
            : "http://localhost:5050";

    return (
        <div className="account-container" ref={dropdownRef}>
            {/* Button to toggle the dropdown */}
            <button className="account-button" onClick={toggleDropdown}>
                <FaRegUserCircle size={25} color="rgb(var(--text-colour))" />
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
                    <button className="login-button" onClick={() => {setIsPopoutOpen(!isPopoutOpen)}}>
                        My Graphs
                    </button> 
                </>)}
            </div>

            <MyGraphs 
                popoutOpen={isPopoutOpen}
                onClose={()=>setIsPopoutOpen(false)}

            />

            

        </div>
    );
}

export default Account;
