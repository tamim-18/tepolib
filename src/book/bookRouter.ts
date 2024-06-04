// we have to make the user router
import express from "express";
import { createBook } from "./bookController";

const bookRouter = express.Router();

// creating the routes

bookRouter.post("/", createBook);

// why are we using createrUser instead of createrUser()?
// because we are passing the reference of the function to the post method.

export default bookRouter;
