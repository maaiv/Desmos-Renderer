import React, { createContext, useContext, useState } from "react";

// Create the Account Context
const AccountContext = createContext();

// Provider Component
export const AccountProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); // Store user information
    const [userGraphs, setUserGraphs] = useState([]);
    
    


    return (
        <AccountContext.Provider value={{ userId, setUserId, userGraphs, setUserGraphs}}>
        {children}
        </AccountContext.Provider>
    );
};

// Custom Hook for Convenience
export const useAccountContext = () => {
    return useContext(AccountContext);
};