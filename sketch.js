
let calc;
let options;

let bezierPrevCP = [];
let bezierCurCP = [];

let linearCP = [];

let lines = [];

let mouseMath;
let mouseState;
let selected = false;

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
    constructor(type, ...args) {
        this.type = type;
        if (type === "bezier") {
            this.cp = [args[0], args[1], args[2], args[3]];
        }
        else if (type === "linear") {
            this.cp = [args[0], args[1]];
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
        expressions: false,
        settingsMenu: false,
        lockViewport: true,
    };

    let elt = document.getElementById('calculator');
    calc = Desmos.GraphingCalculator(elt, options );
    

    setExp({ id: 'bezierPrevCP', latex: '[]', color: "#5a6ef2", lines:true  });
    setExp({ id: 'bezierCurCP', latex: '[]', color: "#5a6ef2", lines:true  });
    setExp({ id: 'bezierLine', latex: '0', color: "#5a6ef2" });

    setExp({ id: 'linearCP', latex: '[]', color: "#5a6ef2" });
    setExp({ id: 'linearLine', latex: '', color: "#5a6ef2" });

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

    if (mouseState === "bezier") {

        bezierCurCP[2] = mouseMath;
        bezierCurCP[0] = cOp((x1, x2) => 2 * x1 - x2, bezierCurCP[1], mouseMath);
        
        let exp = bezierCurCP.map((val) => Dpoint(val))
        setExp({ id: `bezierCurCP`, latex: `[${exp.toString()} ]`});

        exp = bezierPrevCP.map((val) => Dpoint(val))
        setExp({ id: `bezierPrevCP`, latex: `[${exp.toString()} ]`});

        if ( bezierPrevCP.length ) {
        setExp({ id: `bezierLine`, latex: Dbezier(bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]) });
        }
    }
    else if (mouseState === "linear") {
        linearCP[1] = mouseMath;

        let exp = linearCP.map((val) => Dpoint(val));
        setExp({ id: `linearCP`, latex: `[${exp.toString()} ]`, lines:true });
    }
    else if (mouseState === "selectBCP") {
        let minI;
        let minDist = Infinity;
        for (let i = 0; i < 4; i++) {
            newDist = dist(selected.cp[i].x, selected.cp[i].y, mouseMath.x, mouseMath.y);
            if (newDist < minDist) {
                minI = i;
                minDist = newDist;
            }
        }
        selected.cp[minI] = mouseMath;
    }


    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.type === "bezier") {
            if (selected === line) {
                setExp({ id: `bezierPrevCP`, latex: `[${Dpoint(line.cp[0])}, ${Dpoint(line.cp[1])} ]`});
                setExp({ id: `bezierCurCP`, latex: `[${Dpoint(line.cp[2])}, ${Dpoint(line.cp[3])} ]` });
                setExp({ id: `bezier${i}`, latex: Dbezier(...line.cp), color: "#5a6ef2"});
            }
            else {
                setExp({ id: `bezier${i}`, latex: Dbezier(...line.cp), color: "#000000" });
            }
        }
        else if (line.type === "linear") {
            setExp({ id: `linear${i}`, latex: Dline(...line.cp), color: "#000000"});
        }
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

function mousePressed() {
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
            bezierPrevCP.push( {x: bezierCurCP[2].x, y: bezierCurCP[2].y}  );
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
        
        if (selected.type === "bezier") {
            for (let p of selected.cp) {
                if (dist(p.x, p.y, mouseMath.x, mouseMath.y) < 0.4) {
                    mouseState = "selectBCP";
                    return;
                }
            }
        }

        let minDist = Infinity;

        for (let i = 0; i < lines.length; i++) {
            newDist = lineDist(lines[i],mouseMath)
            if (newDist < minDist) {
                minDist = newDist;
                closestLine = lines[i];
            }
        }
        if (minDist < 0.5) {
            selected = closestLine;
        }
        else {
            mouseState = "select";
        }
    }
}

function mouseReleased() {
    if (tool === "bezier") {
        if ( bezierCurCP.length && bezierPrevCP.length) {

            lines.push(new Line("bezier", bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]));

            bezierPrevCP[0] = bezierCurCP[1];
            bezierPrevCP[1] = bezierCurCP[2];
            bezierCurCP = []

        }
        mouseState = false;
    }
    if (tool === "linear") {
        lines.push(new Line("linear", linearCP[0], linearCP[1]));

        linearCP = []
        mouseState = false;
    }
    if (tool === "select") {
        mouseState = false;
    }
}


function resetTool() {
    
    if (tool === "bezier") {

        if ( bezierCurCP.length && bezierPrevCP.length) {
            lines.push(new Line("bezier", bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]));
        }

        bezierPrevCP = [];
        bezierCurCP = [];
        setExp({ id: 'bezierPrevCP', latex: '[]'});
        setExp({ id: 'bezierCurCP', latex: '[]'});
        setExp({ id: 'bezierLine', latex: '' });
    }
    else if (tool === "linear") {
        if ( linearCP.length) {
            lines.push(new Line("linear", linearCP[0], linearCP[1]));
        }
        linearCP = []
        setExp({ id: 'linearCP', latex: '[]', color: "#5a6ef2" });
    }
    else if (tool === "select") {
        bezierCurCP = [];
        bezierPrevCP = [];
        selected = false;
        setExp({ id: 'bezierPrevCP', latex: '[]'});
        setExp({ id: 'bezierCurCP', latex: '[]'});
        setExp({ id: 'bezierLine', latex: '' });
    }
    mouseState = false;
    tool = "select";
}

/**
 * @param {Line} line - line object
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

