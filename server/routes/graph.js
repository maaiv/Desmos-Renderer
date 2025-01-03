import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /graphs.
const router = express.Router();

// This section will help you get a list of all the graphs.
router.get("/", async (req, res) => {
    let collection = await db.collection("graphs");
    let results = await collection.find({}).toArray();
    res.status(200).json(results);
});

// This section will help you get a single user by email
router.get("/userid/:userid", async (req, res) => {
    let collection = await db.collection("graphs");
    let query = { userid: req.params.userid };
    let results = await collection.find(query).toArray();
    res.status(200).json(results);
});

// This section will help you get a single graph by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("graphs");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new graph.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
        title: req.body.title,
        thumbnail: req.body.thumbnail,
        userid: req.body.userid,
        data: req.body.data,
    };
    let collection = await db.collection("graphs");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding graph");
  }
});

// This section will help you update a graph by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        title: req.body.title,
        thumbnail: req.body.thumbnail,
        userid: req.body.userid,
        data: req.body.data,
      },
    };

    let collection = await db.collection("graphs");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating graph");
  }
});

// This section will help you delete a graph
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("graphs");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting graph");
  }
});

export default router;