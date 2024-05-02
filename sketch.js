
let calc;
let options;

let bezierPrevCP = [];
let bezierCurCP = [];

let linearCP = [];

let lines = [];

let mouseMath;
let mouseState;

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
            this.c1 = args[0];
            this.c2 = args[1];
            this.c3 = args[2];
            this.c4 = args[3];
        }
        else if (type === "linear") {
            this.c1 = args[0];
            this.c2 = args[1];
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
    

    calc.setExpression({ id: 'bezierPrevCP', latex: '[]', color: "#5a6ef2" });
    calc.setExpression({ id: 'bezierCurCP', latex: '[]', color: "#5a6ef2" });
    calc.setExpression({ id: 'bezierLine', latex: '', color: "#5a6ef2" });

    calc.setExpression({ id: 'linearCP', latex: '[]', color: "#5a6ef2" });
    calc.setExpression({ id: 'linearLine', latex: '', color: "#5a6ef2" });

}

function draw() {
    background(310,30,20); 

    mouseMath = cOp((x) => round(x, 3), calc.pixelsToMath({x:mouseX, y:mouseY}));



    if (mouseState === "bezier") {

        bezierCurCP[2] = mouseMath;
        bezierCurCP[0] = cOp((x1, x2) => 2 * x1 - x2, bezierCurCP[1], mouseMath);
        
        let exp = bezierCurCP.map((val) => Dpoint(val))
        calc.setExpression({ id: `bezierCurCP`, latex: `[${exp.toString()} ]`, lines:true });

        exp = bezierPrevCP.map((val) => Dpoint(val))
        calc.setExpression({ id: `bezierPrevCP`, latex: `[${exp.toString()} ]`, lines:true });

        if ( bezierPrevCP.length ) {
        calc.setExpression({ id: `bezierLine`, latex: Dbezier(bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]) });
        }

    }

    else if (mouseState === "linear") {
        linearCP[1] = mouseMath;

        let exp = linearCP.map((val) => Dpoint(val));
        calc.setExpression({ id: `linearCP`, latex: `[${exp.toString()} ]`, lines:true });
    }


    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.type === "bezier") {
            calc.setExpression({ id: `bezier${i}`, latex: Dbezier(line.c1, line.c2, line.c3, line.c4), color: "#000000" });
        }
        else if (line.type === "linear") {
            calc.setExpression({ id: `linear${i}`, latex: Dline(line.c1, line.c2)});
        }
    }

    if (keyIsDown(32)) {
        if (tool === "bezier") {
            console.log("wah")
            if ( bezierCurCP.length && bezierPrevCP.length) {
                lines.push(new Line("bezier", bezierPrevCP[0], bezierPrevCP[1], bezierCurCP[0], bezierCurCP[1]));
            }

            bezierPrevCP = [];
            bezierCurCP = [];
            calc.setExpression({ id: 'bezierPrevCP', latex: '[]'});
            calc.setExpression({ id: 'bezierCurCP', latex: '[]'});
            mouseState = false;
            tool = "select";
        }
    }
    else if (keyIsDown(49)) {
        tool = "linear";
    }
    else if (keyIsDown(50)) {
        tool = "bezier";
    }
    
    // calc.updateSettings({expressions: false});
    // console.log(calc.graphpaperBounds.pixelCoordinates.right);
    // console.log(calc.mathToPixels({x:0,y:0}));
}

function mousePressed() {
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
    if (abs(atan2(c1.y - c2.y, c1.x - c2.x)) > 1.55 && abs(atan2(c1.y - c2.y, c1.x - c2.x)) < 1.6) {
        return `x = ${(c1.x-c2.x)/(c1.y-c2.y)}(y-${c1.y}) + ${c1.x} \\left\\{ ${min(c1.y,c2.y)} \\leq y \\leq ${max(c1.y,c2.y)} \\right\\}`;
    }
    else {
        return `y = ${(c1.y-c2.y)/(c1.x-c2.x)}(x-${c1.x}) + ${c1.y} \\left\\{ ${min(c1.x,c2.x)} \\leq x \\leq ${max(c1.x,c2.x)} \\right\\} `;
    }
}

function Dpoint(coords) {
    return `(${coords.x},${coords.y})`
}