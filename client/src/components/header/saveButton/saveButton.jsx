import './saveButton.css'
import { useAuth0 } from "@auth0/auth0-react";
import { getCanvasState, setCanvasState } from '../../calculatorApp/canvas/canvas';
import { useAccountContext } from "../../../accountContext";



function SaveButton() {
    const { user, isAuthenticated } = useAuth0();

    const { userGraphs, setUserGraphs, userId } = useAccountContext();

    const db = 
    process.env.NODE_ENV === "production"
            ? "https://desmos-renderer.onrender.com"
            : "http://localhost:5050";

    async function addGraph(graphData) {
        const payload = {    
            title: graphData.title,
            thumbnail: graphData.thumbnail,
            userid: graphData.userid,
            data: graphData.data,
        }

        try {
            const response = await fetch(db + "/graphs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const newGraph = await response.json();
            console.log("graph added successfully:", newGraph);
            return newGraph.insertedId;
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }

    async function updateGraph(graphId, graphData) {

        const payload = {    
            title: graphData.title,
            thumbnail: graphData.thumbnail,
            userid: graphData.userid,
            data: graphData.data,
        }
        try {
            const response = await fetch(db + `/graphs/${graphId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const newGraph = await response.json();
            console.log("graph updated successfully:", newGraph);
            return graphId;
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }


    
    async function handleSave() {
        const currentGraph = getCanvasState();


        if (currentGraph.graphId === null) {
            const newGraphId = await addGraph({
                title: "Untitled Graph", 
                thumbnail: currentGraph.thumbnail,
                userid:userId,
                data:currentGraph.data,
            });
            console.log(currentGraph.data);
            setCanvasState(
                newGraphId,
                currentGraph.data,
            )

            // update currentUserGraphs
            let currentUserGraphs = userGraphs;
            currentUserGraphs.push({
                _id: newGraphId,
                title: "Untitled Graph", 
                thumbnail: currentGraph.thumbnail, 
                userid: userId,
                data: currentGraph.data, 
            });
            setUserGraphs(currentUserGraphs);
        }
        else {
            await updateGraph(currentGraph.graphId, 
                {title: "untitled", 
                thumbnail: currentGraph.thumbnail,
                userid:userId,
                data:currentGraph.data}
            );

            // update currentUserGraphs
            let currentUserGraphs = userGraphs;
            for (let i = 0; i < currentUserGraphs.length; i++) {
                if (currentUserGraphs[i]._id === currentGraph.graphId) {
                    currentUserGraphs[i] = {
                        _id: currentGraph.graphId,
                        title: currentGraph.title, 
                        thumbnail: currentGraph.thumbnail, 
                        userid: userId,
                        data: currentGraph.data, 
                    }
                }
            }
            setUserGraphs(currentUserGraphs);

        }
    }

    return (
        <>

        { isAuthenticated && (<button className="save-button" onClick={handleSave}>
            Save Graph
        </button>)}
        
        </>
  )
}

export default SaveButton;