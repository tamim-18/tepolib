// seting up the express app
import express from "express";

const app = express();
//routes
//http methods are:
//GET, POST, PUT, DELETE
app.get("/", (req, res, next) => {
  res.json({ message: "Hello World" });
});

export default app;
