import './myGraphs.css'

import React from "react";
import { getCanvasState, setCanvasState } from '../../../calculatorApp/canvas/canvas';
import { useAccountContext } from "../../../../accountContext";



function MyGraphs({popoutOpen, onClose, onDelete, onRename, onLoad}) {
    const { userGraphs, userId } = useAccountContext();

    const db = 
    process.env.NODE_ENV === "production"
            ? "https://desmos-renderer.onrender.com"
            : "http://localhost:5050";

    return (
        <div className={`my-graphs-overlay ${popoutOpen ? "open" : ""}`}>

            <div className="my-graphs-popout">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>

                <div className="columns-container">
                    {[0,1,2].map((colIndex) => (
                        <div 
                            key={colIndex}
                            className="column"
                        >
                        {userGraphs
                            .filter((_, index) => index % 3 === colIndex) // Distribute graphs into 3 columns
                            .map((graph, index) => (
                            <div key={index} className="thumbnail-container">
                                <img
                                src={graph.thumbnail}
                                alt="temptext"
                                className="thumbnail"
                                />
                                <div className="thumbnail-actions">
                                <button onClick={() => onLoad(graph.graphId)}>Load</button>
                                <button onClick={() => onRename(graph.graphId)}>Rename</button>
                                <button onClick={() => onDelete(graph.graphId)}>Delete</button>
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