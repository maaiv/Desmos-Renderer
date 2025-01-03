
import Header from './components/header/header.jsx'
import CalculatorApp from './components/calculatorApp/calculatorApp.jsx'
import { AccountProvider } from './accountContext.jsx'
import React from "react";


function App() {


    return (
        <>
            <AccountProvider>
                <Header />
            </AccountProvider>
            <CalculatorApp/>
        </>
    )
}

export default App
