
import "./calculatorApp.css";
import React from "react";
import Canvas from "./canvas/canvas";
import { HexAlphaColorPicker } from "react-colorful";
import Tools from "./tools/tools";

class CalculatorApp extends React.Component {
    constructor() {
        super();

        this.state = {
            colour: '#000000',
            tool: "bezier",
            keys: new Set()
        };

        this.canvasKeyUpdate = null;
        this.canvasToolUpdate = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.setCanvasKeyUpdate = this.setCanvasKeyUpdate.bind(this);
        this.setCanvasToolUpdate = this.setCanvasToolUpdate.bind(this);
        this.handleFocus = this.handleFocus.bind(this);

        document.onkeydown = this.handleKeyDown;
        document.onkeyup = this.handleKeyUp;
        window.onfocus = this.handleFocus;
    }
    render() {
        return (
            <div id="calc">
                <Canvas 
                    appState={this.state}
                    updateAppState={(newState) => this.setState(newState)}
                    registerKeyCallback = {this.setCanvasKeyUpdate}
                    registerToolCallback = {this.setCanvasToolUpdate}
                />
                <div id="side-bar">
                    <HexAlphaColorPicker
                        color={this.state.colour} 
                        onChange={(colour)=>this.setState({colour:colour})}
                    />
                    <Tools active={this.state.tool}/>
                </div>

                
                
            </div>
            
        )
    }

    componentDidMount(){
        let tools = document.getElementsByClassName("tool-container");

        for (let tool of tools) {
            if (tool.childNodes[1].id === "linear-tool") {
                
                tool.addEventListener("mouseup", (event) => {this.canvasToolUpdate(); this.setState({tool: "linear"}) }); 
            }
            else if (tool.childNodes[1].id === "bezier-tool") {
                tool.addEventListener("mouseup", (event) => {this.canvasToolUpdate(); this.setState({tool: "bezier"})}); 
            }
            else if (tool.childNodes[1].id === "select-tool") {
                tool.addEventListener("mouseup", (event) => {this.canvasToolUpdate(); this.setState({tool: "select"})}); 
            }
        }
    }

    setCanvasKeyUpdate(fun) {
        this.canvasKeyUpdate = fun;
    }

    setCanvasToolUpdate(fun) {
        this.canvasToolUpdate = fun;
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
