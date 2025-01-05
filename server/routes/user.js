import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /users.
const router = express.Router();

// This section will help you get a list of all the users.
router.get("/", async (req, res) => {
    let collection = await db.collection("users");
    let results = await collection.find({}).toArray();
    res.status(200).json(results);
});

// This section will help you get a single user by email
router.get("/email/:email", async (req, res) => {
    console.log("what")
    let collection = await db.collection("users");
    let query = { email: req.params.email };
    let result = await collection.findOne(query);

    if (!result) res.status(200).json({found: false, message: "User not found"});
    else res.status(200).json({found: true, user: result});
});

// This section will help you get a single user by id
router.get("/:id", async (req, res) => {
    let collection = await db.collection("users");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.status(200).json({found: false, message: "User not found"});
    else res.status(200).json({found: true, user: result});
});

// This section will help you create a new user.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
        userid: req.body.userid,
        email: req.body.email,
    };
    let collection = await db.collection("users");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

// This section will help you update a user by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        userid: req.body.userid,
        email: req.body.email,
      },
    };

    let collection = await db.collection("users");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// This section will help you delete a user
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("users");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

export default router;