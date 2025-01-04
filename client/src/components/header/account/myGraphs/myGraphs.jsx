import './myGraphs.css'

import React, { useEffect, useState } from "react";
import { getCanvasState, setCanvasState } from '../../../calculatorApp/canvas/canvas';
import { useAccountContext } from "../../../../accountContext";



function MyGraphs({popoutOpen, onClose, onRename, onLoad}) {
    const { userGraphs, setUserGraphs, userId, setActiveTitle } = useAccountContext();

    const [numColumns, setNumColumns] = useState(3);



    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;

            let newNumColumns;
    
            if (width < 750) {
                newNumColumns = 1;
            } else if (width < 1100) {
                newNumColumns = 2;
            } else {
                newNumColumns = 3;
            }
    
            // Only update if there's a change
            if (newNumColumns !== numColumns) {
                setNumColumns(newNumColumns);

            }
        }
    
        // Run the resize handler once to set the initial value
        handleResize();
    
        // Attach the event listener to the window object
        window.addEventListener('resize', handleResize);
    
        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [numColumns]);


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

    async function deleteGraph(graphId) {
        console.log(db + `/graphs/${graphId}`);
        try {
            const response = await fetch(db + `/graphs/${graphId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const newGraph = await response.json();
            console.log("graph deleted successfully:", newGraph);
            return graphId;
        } catch (error) {
            console.error("A problem occurred with your fetch operation:", error);
        }
    }


    function handleLoad(graphId) {
        setCanvasState(graphId, userGraphs.filter((graph) => graph._id === graphId)[0].data)
        setActiveTitle(userGraphs.filter((graph) => graph._id === graphId)[0].title);
        onClose();
    }
    

    async function handleCopy(graphId) {
        const templateGraph = userGraphs.filter((graph) => graph._id === graphId)[0];
        const newGraphId = await addGraph({
            title: templateGraph.title,
            thumbnail: templateGraph.thumbnail,
            userid: templateGraph.userid,
            data: templateGraph.data,
        });

        setUserGraphs((prevGraphs) => [
            ...prevGraphs,
            {
                _id: newGraphId,
                title: templateGraph.title, 
                thumbnail: templateGraph.thumbnail, 
                userid: templateGraph.userid,
                data: templateGraph.data,
            },
        ]);


    }



    async function handleDelete(graphId) {

        deleteGraph(graphId);

        let updatedUserGraphs = userGraphs.filter((graph) => graph._id !== graphId);
        setUserGraphs(updatedUserGraphs);

        const currentCanvas = getCanvasState();
        
        if (graphId === currentCanvas.graphId) {

            setCanvasState(null, currentCanvas.data);
        }
    }



            
    return (
        <div className={`my-graphs-overlay ${popoutOpen ? "open" : ""}`}>
            <div className="my-graphs-popout">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>

                <div className="columns-container">
                    {Array.from(Array(numColumns).keys()).map((_, colIndex) => (
                        <div 
                            key={colIndex}
                            className="column"
                        >
                        {userGraphs
                            .filter((_, index) => index % numColumns === colIndex) // Distribute graphs into 3 columns
                            .map((graph, index) => (
                            <div key={index} className="thumbnail-container">
                                <img
                                src={graph.thumbnail}
                                alt={graph.title}
                                className="thumbnail"
                                />
                                <div className="thumbnail-title">
                                    {graph.title}
                                </div>
                                <div className="thumbnail-actions">
                                    <button onClick={() => handleLoad(graph._id)}>Load</button>
                                    <button onClick={() => handleCopy(graph._id)}>Copy</button>
                                    <button onClick={() => handleDelete(graph._id)}>Delete</button>
                                </div>
                            </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyGraphs;