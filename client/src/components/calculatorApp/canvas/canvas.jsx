
import "./canvas.css";
import React from "react";

let calc;
let options;

let bezierPrevCP = [];
let bezierCurCP = [];
let linearCP = [];

let lines = [];
let lineIDStack = []; // This stack approach is so overkill lmao
    
let selected = false;
let selectedCP = false;
let oldSelectedCP = false;

let states = {history: [{bezierPrevCP: [], bezierCurCP: [], linearCP: [], lines: [], lineIDStack: [], tool: "bezier", selected: false, selectedCP: false, oldSelectedCP: false}], current: 0}; // same :skull:

let mouseMath;
let mouseState;
let mousePresPos;

class Canvas extends React.Component {
    constructor() {
        super();
        // Bind event functions
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.keyUpdate = this.keyUpdate.bind(this);
        this.resetTool = this.resetTool.bind(this);

    }
    render() {
        return (
            <div id="calculator">
            </div>
        )
    }



    componentDidMount() {
        var elt = document.getElementById('calculator');
        
        elt.onmousemove = this.handleMouseMove;
        elt.onmousedown = this.handleMouseDown;
        elt.onmouseup = this.handleMouseUp;
        
        // Initialize desmos renderer
        options = {
            expressions: false,
            settingsMenu: false,
            lockViewport: true,
        };
        
        calc = Desmos.GraphingCalculator(elt, options);

        setExp({ id: 'bezierPrevCP', latex: '[]', color: "#5a6ef2", lines:true  });
        setExp({ id: 'bezierCurCP', latex: '[]', color: "#5a6ef2", lines:true  });
        setExp({ id: 'bezierLine', latex: '0', color: "#5a6ef2" });
        
        setExp({ id: 'linearCP', latex: '[]', color: "#5a6ef2", lines:true });
        setExp({ id: 'linearLine', latex: '0', color: "#5a6ef2" });

        this.props.registerKeyCallback(this.keyUpdate);
        this.props.registerToolCallback(this.resetTool);

    }

    handleMouseMove(event) {


        let mouseX = event.clientX
        let mouseY = event.clientY - document.getElementsByClassName('component-header')[0].clientHeight;
        mouseMath = cOp((x) => Math.round(x*100)/100, calc.pixelsToMath({x:mouseX, y:mouseY}));


        // Mouse is held down 
        if (mouseState === "bezier") {

            bezierCurCP[2] = mouseMath;
            bezierCurCP[0] = cOp((x1, x2) => 2 * x1 - x2, bezierCurCP[1], mouseMath);
            displayCP();
            if ( bezierPrevCP.length ) {
            setExp({ id: `bezierLine`, latex: Dbezier(bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]) });
            }
        }
        else if (mouseState === "linear") {
            linearCP[1] = mouseMath;
            displayCP();
            if ( linearCP.length ) {
                setExp({  id: `linearLine`, latex: Dline(linearCP[0], linearCP[1]) })
            }
        }
        else if (mouseState === "selectCP") {
            lines[selected.id].cp[selectedCP] = mouseMath;
    
            if (selected.type === "bezier") {
                setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                setExp({ id: `bezierCurCP`, latex: `[${Dpoint(selected.cp[2])}, ${Dpoint(selected.cp[3])} ]` });
            }
            else if (selected.type === "linear") {
                setExp({ id: `linearCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
            }
    
            displayLines();
        }
        else if (mouseState === "selectLine") {
            for (let i = 0; i < selected.cp.length; i++) {
                lines[selected.id].cp[i] = cOp((x, y) => (x+y), oldSelectedCP[i], cOp( (m,n) => (m-n), mouseMath, mousePresPos ));
            }
            if (selected.type === "bezier") {
                setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                setExp({ id: `bezierCurCP`, latex: `[${Dpoint(selected.cp[2])}, ${Dpoint(selected.cp[3])} ]` });
            }
            else if (selected.type === "linear") {
                setExp({ id: `linearCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
            }
           displayLines();
        }

    }

    handleMouseDown(event) {
        const { colour, tool, keys } = this.props.appState;

        mousePresPos = mouseMath;
        if (calc.settings.lockViewport === false) {
            return;
        } 
        if (tool === "bezier") {
            let snapToPoint = snapTo(); // Returns false if no point to snap to, returns point to snap to otherwise
            if ( bezierCurCP.length ) {
                if ( bezierPrevCP.length ) { 
                }
                else {
                    bezierPrevCP.push( {x: bezierCurCP[1].x, y: bezierCurCP[1].y} );
                    bezierPrevCP.push( {x: bezierCurCP[2].x, y: bezierCurCP[2].y} );
    
                    if (snapToPoint !== false) {
                        bezierCurCP[1] = snapToPoint;
                    } 
                    else {
                        bezierCurCP[1] = mouseMath;
                    }
                }
            }
            else {
                if (snapToPoint !== false) {
                    bezierCurCP.push( snapToPoint );
                    bezierCurCP.push( snapToPoint );
                    bezierCurCP.push( snapToPoint );
                } 
                else {
                    bezierCurCP.push( mouseMath );
                    bezierCurCP.push( mouseMath );
                    bezierCurCP.push( mouseMath );
                }
            }
        
            mouseState = "bezier";
        }
        else if (tool === "linear") {
    
            let snapToPoint = snapTo();
            if (snapToPoint !== false) {
                linearCP.push( snapToPoint );
                linearCP.push( snapToPoint );
            }
            else {
                linearCP.push( mouseMath );
                linearCP.push( mouseMath );
            }
            mouseState = "linear";
        }
        else if (tool === "select") {
            let pmouseMath = calc.mathToPixels(mouseMath);
            // Checks precedence 
            if (selected.type === "bezier" || selected.type === "linear") {
                let cp = selected.cp;
                for (let i = 0; i < cp.length; i++) {
                    let pcpPos = calc.mathToPixels(cp[i]);
                    if (dist(pcpPos.x, pcpPos.y, pmouseMath.x, pmouseMath.y) < 10) {
                        resetCP();
                        mouseState = "selectCP";
                        selectedCP = i;
                        return;
                    }
                }
            }
            
            let minDist = Infinity;
            let closestLine;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i] !== null) {
                    let newDist = lineDist(lines[i],calc.mathToPixels(mouseMath), false);
                    // console.log(newDist);
                    
                    if (newDist < minDist) {
                        minDist = newDist;
                        closestLine = lines[i];
                    }
                }
            }
            if (minDist < 10) {
                if (selected.id === closestLine.id) {
                    mouseState = "selectLine";
                    oldSelectedCP = Array(...closestLine.cp);
                }
                else {
                    setExp({ id: `bezierPrevCP`, latex: `[]`});
                    setExp({ id: `bezierCurCP`, latex: `[]` });
                    setExp({ id: `linearCP`, latex: `[]`});
                    selected = closestLine;
                    // if (selected.type === "bezier") {
                    //     setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                    //     setExp({ id: `bezierCurCP`, latex: `[${Dpoint(selected.cp[2])}, ${Dpoint(selected.cp[3])} ]` });
                    // }
                    // else if (selected.type === "linear") {
                    //     setExp({ id: `linearCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                    // }
                }
    
            }
            // else {
            //     selected = "false";
            //     resetCP();
            //     mouseState = "select";
            // }
        }
        displayLines();
    
    }

    handleMouseUp(event) {
        const { colour, tool, keys } = this.props.appState;
        let pmouseMath = calc.mathToPixels(mouseMath);
        let pmousePresPos = calc.mathToPixels(mousePresPos);
        let dpos = {x: pmouseMath.x - pmousePresPos.x, y: pmouseMath.y - pmousePresPos.y};
    
    
        if (Math.sqrt(dpos.x**2 + dpos.y**2) < 5 && calc.settings.lockViewport === true && tool !== "select")  {
            resetCP();
            if (mouseState == "linear") {
                resetCPLines();
            }
            else if (mouseState == "bezier") {
                resetCPLines();
            }
    
            mouseState = false;
            displayLines();
            return;
        }
    
        if (tool === "bezier") {
            if ( bezierCurCP.length && bezierPrevCP.length) {
    
                newLine("bezier", colour, bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]);
    
                bezierPrevCP[0] = bezierCurCP[1];
                bezierPrevCP[1] = bezierCurCP[2];
                bezierCurCP = []
    
            }
            mouseState = false;
        }
        if (tool === "linear") {
            if ( linearCP.length) {
    
                let snapToPoint = snapTo();
                if (snapToPoint !== false) {
                    newLine("linear", colour, linearCP[0], snapToPoint);
                    linearCP[1] = snapToPoint;
                    setExp({  id: `linearLine`, latex: Dline(linearCP[0], linearCP[1]) })
                    displayCP();
                }
                else {
                    newLine("linear", colour, linearCP[0], linearCP[1]);
                }
            }
            
            linearCP = []
            mouseState = false;
        }
        
        
        if (tool === "select") {
            if (mouseState === "selectCP") {
                let snapToPoint = snapTo();
                
                if (snapToPoint !== false) {
                    if (selected.type === "linear") {
                        selected.cp[selectedCP] = snapToPoint;
                        setExp({ id: `linearCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                    }
                    else if (selected.type === "bezier" && (selectedCP === 0 || selectedCP === 3)) {
                        selected.cp[selectedCP] = snapToPoint;
                        setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                        setExp({ id: `bezierCurCP`, latex: `[${Dpoint(selected.cp[2])}, ${Dpoint(selected.cp[3])} ]` });
                    }
                }
            }
    
            mouseState = false;
        }
        displayLines();
    
        this.newState();
    }

    keyUpdate() {
        const { colour, tool, keys } = this.props.appState;
        // console.log( tool);


        if ( keys.has("AltLeft") ) {
            calc.updateSettings({lockViewport:false})   
        }
        else {
            calc.updateSettings({lockViewport:true}) 
        }
    
    
        if ( keys.has("KeyP") ) {
            calc.updateSettings({
                expressions: false,
                settingsMenu: false
            })   
        }
        else if ( keys.has("KeyQ") ) {
            calc.updateSettings({
                expressions: true,
                settingsMenu: true
            })   
        }

        if (keys.has("Digit3") ) {
            this.resetTool();
        }
        else if (keys.has("Digit1")) {
            this.resetTool();
            this.props.updateAppState({tool: "linear"});
        }
        else if (keys.has("Digit2")) {
            this.resetTool();
            this.props.updateAppState({tool: "bezier"});
        }
        else if (keys.has("Delete") && selected) {
            lineIDStack.push(selected.id);
            selected.delete();
            lines[selected.id] = null;
            resetCP();
            resetCPLines();
            selected = false;
            this.newState() 
        }
    
    
        if (keys.has("ControlLeft") && keys.has("KeyZ") && states.current > 0) {
            resetLines(); 
            resetCP();
            resetCPLines();
            states.current -= 1;
            bezierPrevCP = Array(...states.history[states.current].bezierPrevCP);
            bezierCurCP = Array(...states.history[states.current].bezierCurCP);
            linearCP = Array(...states.history[states.current].linearCP);
            lines = states.history[states.current].lines.map((val) => (val === null) ? val : val.copy());
            lineIDStack = Array(...states.history[states.current].lineIDStack);
            selected = (states.history[states.current].selected) ? states.history[states.current].selected.copy() : states.history[states.current].selected;
            selectedCP = states.history[states.current].selectedCP;
            oldSelectedCP = states.history[states.current].oldSelectedCP;
            displayLines();
            displayCP();


            let newKeys = keys.union(new Set()); // creates a deep copy because javascript is awesome like that
            newKeys.delete("KeyZ");
            this.props.updateAppState({tool: states.history[states.current].tool, keys:newKeys}); // remove "z" key from the list of keys pressed down
        }
    }




    newState() {
        const { colour, tool, keys } = this.props.appState;
        while (states.history.length > states.current+1) {
            states.history.pop();
        }
    
        states.history.push({bezierPrevCP: Array(...bezierPrevCP), bezierCurCP: Array(...bezierCurCP), linearCP: Array(...linearCP), lines: lines.map((val) => (val === null) ? null : val.copy()), lineIDStack: Array(...lineIDStack), tool: tool, selected: (selected) ? selected.copy() : selected, selectedCP: selectedCP, oldSelectedCP: oldSelectedCP});
        states.current += 1;
        
        if (JSON.stringify(states.history[states.history.length - 1]) == JSON.stringify(states.history[states.history.length - 2])) {
            states.history.pop();
            states.current -= 1;
        }
    }

    resetTool() {
        const { colour, tool, keys } = this.props.appState;

        if (tool === "bezier") {
    
            if ( bezierCurCP.length && bezierPrevCP.length) {
                newLine("bezier", colour, bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]);
            }
    
            bezierPrevCP = [];
            bezierCurCP = [];
            setExp({ id: 'bezierPrevCP', latex: '[]'});
            setExp({ id: 'bezierCurCP', latex: '[]'});
            setExp({ id: 'bezierLine', latex: '' });
        }
        else if (tool === "linear") {
            if ( linearCP.length) {
                linesnewLine("linear", colour, linearCP[0], linearCP[1]);
            }
            linearCP = []
            setExp({ id: 'linearLine', latex: ''});
            setExp({ id: 'linearCP', latex: '[]'});
        }
        else if (tool === "select") {
            resetCP();
            selected = false;
            selectedCP = false;
            setExp({ id: 'linearLine', latex: '' });
            setExp({ id: 'bezierLine', latex: '' });
            displayLines();
        }
        mouseState = false;
        this.props.updateAppState({tool: "select"});
    }

}

export default Canvas

class Line {
    constructor(type, id, colour, ...args) {
        this.type = type;
        this.colour = colour;
        this.id = id;
        if (type === "bezier") {
            this.cp = [args[0], args[1], args[2], args[3]];
        }
        else if (type === "linear") {
            this.cp = [args[0], args[1]];
        }

    }
    display() {
        if (this.type === "bezier") {
            if (selected.id === this.id) {
                // These desmos expression IDs should not contain the line type so IDs can be reused even when line type is different
                setExp({ id: `bezier${this.id}`, latex: Dbezier(...this.cp), color: "#5a6ef2"}); 
                setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(this.cp[0])}, ${Dpoint(this.cp[1])} ]`});
                setExp({ id: `bezierCurCP`, latex: `[${Dpoint(this.cp[2])}, ${Dpoint(this.cp[3])} ]` });
            }
            else {
                setExp({ id: `bezier${this.id}`, latex: Dbezier(...this.cp), color: `${this.colour}`, lineOpacity: `${this.opacity/255}` });
            }
        }
        else if (this.type === "linear") {
            if (selected.id === this.id) {
                setExp({ id: `linear${this.id}`, latex: Dline(...this.cp), color: "#5a6ef2"});
                setExp({ id: `linearCP`, latex: `[${Dpoint(this.cp[0])}, ${Dpoint(this.cp[1])} ]`});
            }
            else {
                setExp({ id: `linear${this.id}`, latex: Dline(...this.cp), color: `${this.colour}`, lineOpacity: `${this.opacity/255}`});
            }
        }
    }
    delete() {
        if (this.type === "bezier") {
            setExp({ id: `bezier${this.id}`, latex: "", color: "#000000"});
        }
        if (this.type === "linear") {
            setExp({ id: `linear${this.id}`, latex: "", color: "#000000"});
        }
    }
    copy() {
        return new Line(this.type, this.id, this.colour, ...this.cp);
    }
}



function newLine(type, ...args) {
    if (lineIDStack.length) {
        let tempID = lineIDStack.pop();
        lines[tempID] = new Line(type, tempID, ...args);
    }
    else {
        lines.push(new Line(type, lines.length, ...args));
    }

}

function displayLines() {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== null) {
            let line = lines[i];
            line.display(i);
        }
    }   
}

function resetLines() {
    for (let line of lines) {
        if (line !== null) {
            line.delete();
        }
    }
}



function snapTo() {

    let pmouseMath = calc.mathToPixels(mouseMath);
    let ppointMath;
    let minDist = Infinity;
    let minPoint;
    for (let line of lines) {
        if (line !== null) {
            if (line.type === "bezier") {
                ppointMath = calc.mathToPixels(line.cp[0]);
                if (dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y) < minDist && (typeof selectedCP !== 'number' || line.cp[0] !== selected.cp[selectedCP])) {
                    minPoint = line.cp[0];
                    minDist = dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y);
                }
                ppointMath = calc.mathToPixels(line.cp[3]);
                if (dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y) < minDist && (typeof selectedCP !== 'number' || line.cp[3] !== selected.cp[selectedCP])) {
                    minPoint = line.cp[3];
                    minDist = dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y);
                }
            }
            else if (line.type === "linear") {
                ppointMath = calc.mathToPixels(line.cp[0]);
                if (dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y) < minDist && (typeof selectedCP !== 'number' || line.cp[0] !== selected.cp[selectedCP])) {
                    minPoint = line.cp[0];
                    minDist = dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y);
                }
                ppointMath = calc.mathToPixels(line.cp[1]);
                if (dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y) < minDist && (typeof selectedCP !== 'number' || line.cp[1] !== selected.cp[selectedCP])) {
                    minPoint = line.cp[1];
                    minDist = dist(ppointMath.x, ppointMath.y, pmouseMath.x, pmouseMath.y);
                }
            }
        }
    }

    if (minDist < 10) {

        return minPoint;
    }
    else {
        return false;
    }
}

function displayCP() {
    let exp;
    if (bezierCurCP.length) {
        exp = bezierCurCP.map((val) => Dpoint(val))
        setExp({ id: `bezierCurCP`, latex: `[${exp.toString()} ]`});
    }
    if (bezierPrevCP.length) {
        exp = bezierPrevCP.map((val) => Dpoint(val))
        setExp({ id: `bezierPrevCP`, latex: `[${exp.toString()} ]`});
    }
    if (linearCP.length) {
        exp = linearCP.map((val) => Dpoint(val));
        setExp({ id: `linearCP`, latex: `[${exp.toString()} ]`});
    }
}
function resetCP() {
    bezierCurCP = [];
    bezierPrevCP = [];
    linearCP = [];
    setExp({ id: `bezierPrevCP`, latex: `[]`});
    setExp({ id: `bezierCurCP`, latex: `[]` });
    setExp({ id: `linearCP`, latex: `[]`});
}

function resetCPLines() {
    setExp({ id: 'bezierLine', latex: '0' });
    setExp({ id: 'linearLine', latex: '0' });
}

/**
//  * @param {Line} line - line object
//  * @param {Vector} pt 
 */
function lineDist(line, pt, mathMode=true) { // Returns a float
    if (line.type === "bezier") {
        let scans = 20;
        let evl;
        if (mathMode) {
            evl = (t) => (cOp((x1,x2,x3,x4) => (1-t)**3 * x1 + 3 * t * (1-t)**2 * x2 + 3 * t**2 * (1-t) * x3 + t**3 * x4, ...line.cp));
        }
        else {
            evl = (t) => (calc.mathToPixels(cOp((x1,x2,x3,x4) => (1-t)**3 * x1 + 3 * t * (1-t)**2 * x2 + 3 * t**2 * (1-t) * x3 + t**3 * x4, ...line.cp)));
        }
        let minDist = Infinity;
        let minT = 0;

        for (let i = 0; i <= 20; i++) {
            let cur = evl(i/scans);
            if (dist(cur.x, cur.y, pt.x, pt.y) < minDist) {
                minDist = dist(cur.x, cur.y, pt.x, pt.y);
                minT = i/scans;
            }
        }
      

        let ans = minSearch((t) => dist(evl(t).x, evl(t).y, pt.x, pt.y), Math.max(0, minT - 1/scans), Math.min(1, minT + 1/scans), Math.min(1- 1/scans, Math.max(1/scans, minT)));
        let pos = evl(ans);
        return dist(pos.x, pos.y, pt.x, pt.y);
    }
    else if (line.type === "linear") {
        let cSub = (x1, x2) => (cOp( (x1, x2) => x1-x2, x1, x2 ));
        let cMag = (c) => Math.sqrt(c.x**2 + c.y**2);
        let cDot = (x1, x2) => x1.x * x2.x + x1.y * x2.y;
        let cProd = (s, c) => ({x:s * c.x, y:s * c.y});
        
        
        let c0 = line.cp[0];
        let c1 = line.cp[1];
        if (! mathMode) {
            c0 = calc.mathToPixels(line.cp[0]);
            c1 = calc.mathToPixels(line.cp[1]);
        }

        let h = Math.min(1, Math.max(0, cDot( cSub(pt, c0), cSub(c1, c0)) / (cMag( cSub(c1, c0) )**2) ));
        return cMag( cSub(  cSub(pt, c0), cProd(h, cSub(c1, c0)) ));
    }
}


function setExp(exp) {
    calc.setExpression(exp);
}

// Returns an input t value
function minSearch(fun, smin, smax, smid) {
    let scans = 10;
    for (let i = 0; i <= scans; i++) {
        if (fun((smin + smid)/2) < fun((smax + smid)/2)) {
            smax = smid;
            smid = (smin + smax)/2;
        }
        else {
            smin = smid;
            smid = (smin + smax)/2;
        }
    }
    return smin;

}

function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function cOp(fun, ...coords) {
    let cx = coords.map((c) => c.x);
    let cy = coords.map((c) => c.y);
    return {x: fun( ...cx ), y: fun( ...cy ) }
}

// Compile to desmos code
function Dbezier(c1, c2, c3, c4) {
    return `(1-t)^3 \\cdot ${Dpoint(c1)} + 3t(1-t)^2 \\cdot ${Dpoint(c2)} + 3t^2(1-t) \\cdot ${Dpoint(c3)} + t^3 ${Dpoint(c4)} `
}

function Dline(c1, c2) {

    return `(${c1.x} (1-t) + ${c2.x} (t), ${c1.y} (1-t) + ${c2.y} (t))`;
}

function Dpoint(coords) {
    return `(${coords.x},${coords.y})`
}