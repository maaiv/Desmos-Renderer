import './saveButton.css'
import { useAuth0 } from "@auth0/auth0-react";
import { getCanvasState, setCanvasState } from '../../calculatorApp/canvas/canvas';
import { useAccountContext } from "../../../accountContext";
import { useState, useEffect } from 'react';


function SaveButton() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [graphName, setGraphName] = useState("");
    const { userGraphs, setUserGraphs, userId } = useAccountContext();
    const { user, isAuthenticated } = useAuth0();

    const db = 
    process.env.NODE_ENV === "production"
            ? "https://desmos-renderer.onrender.com"
            : "http://localhost:5050";



    useEffect(() => {
        setGraphName(getCanvasTitle());
    }, [isPopupOpen])

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
        const currentGraphTitle = getCanvasTitle();
        if (currentGraph.graphId === null) {
            const newGraphId = await addGraph({
                title: graphName || currentGraphTitle, 
                thumbnail: currentGraph.thumbnail,
                userid:userId,
                data:currentGraph.data,
            });
            setCanvasState(
                newGraphId,
                currentGraph.data,
            )

            // update currentUserGraphs
            setUserGraphs((prevGraphs) => [
                ...prevGraphs,
                {
                    _id: newGraphId,
                    title: graphName || currentGraphTitle, 
                    thumbnail: currentGraph.thumbnail, 
                    userid: userId,
                    data: currentGraph.data,
                },
            ]);
    
        }
        else {
            await updateGraph(currentGraph.graphId, 
                {title: graphName || currentGraphTitle,
                thumbnail: currentGraph.thumbnail,
                userid: userId,
                data: currentGraph.data}
            );

            // update currentUserGraphs
            let currentUserGraphs = userGraphs;
            for (let i = 0; i < currentUserGraphs.length; i++) {
                if (currentUserGraphs[i]._id === currentGraph.graphId) {
                    currentUserGraphs[i] = {
                        _id: currentGraph.graphId,
                        title: graphName || currentGraphTitle,
                        thumbnail: currentGraph.thumbnail, 
                        userid: userId,
                        data: currentGraph.data, 
                    }
                }
            }
            setUserGraphs(currentUserGraphs);

        }
        setIsPopupOpen(false);
    }

    function getCanvasTitle() {
        const currentGraph = getCanvasState();

        if ( currentGraph.graphId === null ) {
            return "Untitled Graph";
        }
        else {
            return userGraphs.filter((graph)=>graph._id === currentGraph.graphId)[0].title;
        }
    }

    return (
        <>
            { isAuthenticated && (<>
                
                <button className="save-button" onClick={()=>{setIsPopupOpen(true)}}>
                    Save Graph
                </button>

                <div className={`save-graph-overlay ${isPopupOpen ? "open" : ""}`}>
                    <div className="save-graph-content">

                        <button className="close-button" onClick={() => {setGraphName("") ; setIsPopupOpen(false)}}>
                            &times;
                        </button>

                        <h2>Save Graph</h2>
                        <label htmlFor="graphName">Graph Name:</label>
                        <input
                            type="text"
                            id="graphName"
                            value={graphName}
                            onChange={(e) => setGraphName(e.target.value)}
                            placeholder= {getCanvasTitle()}
                            onKeyDown={(e) => {e.key === "Enter" ? handleSave() : null}}
                        />
                        <button className='save-graph-button' onClick={handleSave}>Save</button>

                    </div>
                </div>

            
            </>)}

    
        </>
  )
}

export default SaveButton;