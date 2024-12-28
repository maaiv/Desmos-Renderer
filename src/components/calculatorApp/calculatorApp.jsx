
import "./calculatorApp.css";
import React from "react";
import Canvas from "../canvas/canvas";
import { HexAlphaColorPicker } from "react-colorful";

class CalculatorApp extends React.Component {
    constructor() {
        super();

        this.state = {
            colour: '#000000',
            tool: "bezier",
            keys: new Set()
        };

        this.canvasKeyUpdate = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.setCanvasKeyUpdate = this.setCanvasKeyUpdate.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
        window.onfocus = this.handleFocus;
        

    }
    render() {
        return (
            <div id="app">
                <Canvas 
                    appState={this.state}
                    updateAppState={(newState) => this.setState(newState)}
                    registerCallback = {this.setCanvasKeyUpdate}
                />
                <HexAlphaColorPicker
                    color={this.state.colour} 
                    onChange={(colour)=>this.setState({colour:colour})}
                />
            </div>
            
        )
    }

    setCanvasKeyUpdate(fun) {
        this.canvasKeyUpdate = fun;
    }

    handleKeyDown(event) {
        let newKeys = this.state.keys;
        newKeys.add(event.code);

        this.setState({keys: newKeys});
        this.canvasKeyUpdate();
        
    }
    
    handleKeyUp(event) {
        let newKeys = this.state.keys;
        newKeys.delete(event.code);
        this.setState({keys: newKeys});


        this.canvasKeyUpdate();
    }
    handleFocus(event) {
        let newKeys = this.state.keys;
        newKeys.delete("AltLeft");
        this.setState({keys: newKeys});
        this.canvasKeyUpdate();
    }

}


export default CalculatorApp
