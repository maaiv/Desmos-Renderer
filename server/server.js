import express from "express";
import cors from "cors";
import graphsRouter from "./routes/graph.js";
import usersRouter from "./routes/graph.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Mount routers with different base paths
app.use("/graphs", graphsRouter); // Routes related to "graphs" collection
app.use("/users", usersRouter);   // Routes related to "users" collection

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});