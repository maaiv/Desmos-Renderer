
let calc;
let options;

let bezierPrevCP = [];
let bezierCurCP = [];

let linearCP = [];

let lines = [];

let mouseMath;
let mouseState;
let selected = false;
let selectedCP = false;
let mousePresPos;

let expressions = new Map();


// Tools:
// "linear" : 1
// "bezier" : 2
// "circle" : 3
// "rect" : 4
// "select" : 5
// "erase" : 6
let tool = "bezier";

class Line {
    constructor(type, id, ...args) {
        this.type = type;
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
            if (selected === this) {
                setExp({ id: `bezier${this.id}`, latex: Dbezier(...this.cp), color: "#5a6ef2"});
            }
            else {
                setExp({ id: `bezier${this.id}`, latex: Dbezier(...this.cp), color: "#000000" });
            }
        }
        else if (this.type === "linear") {
            if (selected === this) {
                setExp({ id: `linear${this.id}`, latex: Dline(...this.cp), color: "#5a6ef2"});
            }
            else {
                setExp({ id: `linear${this.id}`, latex: Dline(...this.cp), color: "#000000"});
            }
        }
    }
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSL);
    noFill();

    let calculatorDiv = createDiv();
    calculatorDiv.id("calculator");
    calculatorDiv.style(`width: ${width*0.7}px; height: ${height*0.995}px;`);
    calculatorDiv.position(0, 0);

    options = {
        // expressions: false,
        // settingsMenu: false,
        lockViewport: true,
    };

    let elt = document.getElementById('calculator');
    calc = Desmos.GraphingCalculator(elt, options );
    

    setExp({ id: 'bezierPrevCP', latex: '[]', color: "#5a6ef2", lines:true  });
    setExp({ id: 'bezierCurCP', latex: '[]', color: "#5a6ef2", lines:true  });
    setExp({ id: 'bezierLine', latex: '0', color: "#5a6ef2" });
    
    setExp({ id: 'linearCP', latex: '[]', color: "#5a6ef2",lines:true });
    setExp({ id: 'linearLine', latex: '0', color: "#5a6ef2" });


}

function draw() {
    background(310,30,20); 

    push();
    strokeWeight(2);
    textSize(50);
    stroke(255);
    text(`tool: ${tool}`, width*0.8, height/2);
    pop();



    mouseMath = cOp((x) => round(x, 3), calc.pixelsToMath({x:mouseX, y:mouseY}));

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
        selected.cp[selectedCP] = mouseMath;

        if (selected.type === "bezier") {
            bezierPrevCP = [selected.cp[0], selected.cp[1]];
            bezierCurCP = [selected.cp[2], selected.cp[3]];
        }
        else if (selected.type === "linear") {
            linearCP = [selected.cp[0], selected.cp[1]];
        }

        displayCP();
        displayLines();
    }





    if ( keyIsDown(18) ) {
        calc.updateSettings({lockViewport:false})   
    }
    else {
        calc.updateSettings({lockViewport:true}) 
    }


    if (keyIsDown(32)) {
        resetTool();
    }
    else if (keyIsDown(49)) {
        resetTool();
        tool = "linear";
    }
    else if (keyIsDown(50)) {
        resetTool();
        tool = "bezier";
    }
    
    // calc.updateSettings({expressions: false});
    // console.log(calc.graphpaperBounds.pixelCoordinates.right);
    // console.log(calc.mathToPixels({x:0,y:0}));
}

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line.display(i);
}

function mousePressed() {

    mousePresPos = mouseMath;
    if (calc.settings.lockViewport === false) {
        return;
    } 
    if (tool === "bezier") {

        if ( bezierCurCP.length ) {
            if ( bezierPrevCP.length ) { 
            // console.log(bezierCurCP);
            }
            else {
            bezierPrevCP.push( {x: bezierCurCP[1].x, y: bezierCurCP[1].y} );
            bezierPrevCP.push( {x: bezierCurCP[2].x, y: bezierCurCP[2].y} );
            bezierCurCP[1] = mouseMath;
            }
        }
        else {
            bezierCurCP.push( mouseMath );
            bezierCurCP.push( mouseMath );
            bezierCurCP.push( mouseMath );
        }
    
        mouseState = "bezier";
    }
    else if (tool === "linear") {
        linearCP.push( mouseMath );
        linearCP.push( mouseMath );
        mouseState = "linear";
    }
    else if (tool === "select") {
        
        // Checks precedence 
        if (selected.type === "bezier" || selected.type === "linear") {
            let cp = selected.cp;
            for (let i = 0; i < cp.length; i++) {
                if (dist(cp[i].x, cp[i].y, mouseMath.x, mouseMath.y) < 0.4) {
                    resetCP();
                    mouseState = "selectCP";
                    selectedCP = i;
                    return;
                }
            }
        }

        let minDist = Infinity;

        for (let i = 0; i < lines.length; i++) {
            newDist = lineDist(lines[i],mouseMath)
            console.log(newDist);
            if (newDist < minDist) {
                minDist = newDist;
                closestLine = lines[i];
            }
        }
        if (minDist < 0.5) {
            setExp({ id: `bezierPrevCP`, latex: `[]`});
            setExp({ id: `bezierCurCP`, latex: `[]` });
            setExp({ id: `linearCP`, latex: `[]`});
            selected = closestLine;
            if (selected.type === "bezier") {
                setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
                setExp({ id: `bezierCurCP`, latex: `[${Dpoint(selected.cp[2])}, ${Dpoint(selected.cp[3])} ]` });
            }
            else if (selected.type === "linear") {
                setExp({ id: `linearCP`, latex: `[${Dpoint(selected.cp[0])}, ${Dpoint(selected.cp[1])} ]`});
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

function mouseReleased() {
    
    let pmouseMath = calc.mathToPixels(mouseMath);
    let pmousePresPos = calc.mathToPixels(mousePresPos);

    let dpos = {x: pmouseMath.x - pmousePresPos.x, y: pmouseMath.y - pmousePresPos.y};


    if (sqrt(dpos.x**2 + dpos.y**2) < 5 && calc.settings.lockViewport === true && tool !== "select")  {
        resetCP();
        if (mouseState == "linear") {
            resetLines();
        }
        else if (mouseState == "bezier") {
            resetLines();
        }

        mouseState = false;
        displayLines();
        return;
    }

    if (tool === "bezier") {
        if ( bezierCurCP.length && bezierPrevCP.length) {

            lines.push(new Line("bezier", lines.length, bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]));

            bezierPrevCP[0] = bezierCurCP[1];
            bezierPrevCP[1] = bezierCurCP[2];
            bezierCurCP = []

        }
        mouseState = false;
    }
    if (tool === "linear") {
        if ( linearCP.length) {
            lines.push(new Line("linear", lines.length, linearCP[0], linearCP[1]));
        }

        linearCP = []
        mouseState = false;
    }
    if (tool === "select") {
        mouseState = false;
    }
    displayLines();
}

function displayLines() {
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line.display(i);
    }   
}



function resetTool() {
    
    if (tool === "bezier") {

        if ( bezierCurCP.length && bezierPrevCP.length) {
            lines.push(new Line("bezier", lines.length, bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]));
        }

        bezierPrevCP = [];
        bezierCurCP = [];
        setExp({ id: 'bezierPrevCP', latex: '[]'});
        setExp({ id: 'bezierCurCP', latex: '[]'});
        setExp({ id: 'bezierLine', latex: '' });
    }
    else if (tool === "linear") {
        if ( linearCP.length) {
            lines.push(new Line("linear", lines.length, linearCP[0], linearCP[1]));
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
    tool = "select";
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

function resetLines() {
    setExp({ id: 'bezierLine', latex: '0' });
    setExp({ id: 'linearLine', latex: '0' });
}

/**
//  * @param {Line} line - line object
//  * @param {Vector} pt 
 */
function lineDist(line, pt) { // Returns a coordinate struct
    if (line.type === "bezier") {
        let scans = 20;
        let eval = (t) => (cOp((x1,x2,x3,x4) => (1-t)**3 * x1 + 3 * t * (1-t)**2 * x2 + 3 * t**2 * (1-t) * x3 + t**3 * x4, ...line.cp));
        let minDist = Infinity;
        let minT = 0;

        for (let i = 0; i <= 20; i++) {
            cur = eval(i/scans);
            if (dist(cur.x, cur.y, pt.x, pt.y) < minDist) {
                minDist = dist(cur.x, cur.y, pt.x, pt.y);
                minT = i/scans;
            }
        }
      

        let ans = minSearch((t) => dist(eval(t).x, eval(t).y, pt.x, pt.y), max(0, minT - 1/scans), min(1, minT + 1/scans), min(1- 1/scans, max(1/scans, minT)));
        let pos = eval(ans);
        console.log(minT, ans);
        console.log(minDist, dist(pos.x, pos.y, pt.x, pt.y));
        return dist(pos.x, pos.y, pt.x, pt.y);
    }
    else if (line.type === "linear") {
        let cSub = (x1, x2) => (cOp( (x1, x2) => x1-x2, x1, x2 ));
        let cMag = (c) => sqrt(c.x**2 + c.y**2);
        let cDot = (x1, x2) => x1.x * x2.x + x1.y * x2.y;
        let cProd = (s, c) => ({x:s * c.x, y:s * c.y});

        let h = min(1, max(0, cDot( cSub(pt, line.cp[0]), cSub(line.cp[1], line.cp[0])) / (cMag( cSub(line.cp[1], line.cp[0]) )**2) ));

        return cMag( cSub(  cSub(pt, line.cp[0]), cProd(h, cSub(line.cp[1], line.cp[0])) ));
    }
}


function setExp(exp) {
    calc.setExpression(exp);
    expressions.set(exp.id, exp);
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
    if (abs(atan2(c1.y - c2.y, c1.x - c2.x)) > 1.55 && abs(atan2(c1.y - c2.y, c1.x - c2.x))  < 1.6) {
        return `x = ${(c1.x-c2.x)/(c1.y-c2.y)}(y-${c1.y}) + ${c1.x} \\left\\{ ${min(c1.y,c2.y)} \\leq y \\leq ${max(c1.y,c2.y)} \\right\\}`;
    }
    else {
        return `y = ${(c1.y-c2.y)/(c1.x-c2.x)}(x-${c1.x}) + ${c1.y} \\left\\{ ${min(c1.x,c2.x)} \\leq x \\leq ${max(c1.x,c2.x)} \\right\\} `;
    }
}

function Dpoint(coords) {
    return `(${coords.x},${coords.y})`
}

