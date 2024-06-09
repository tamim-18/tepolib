// we have to make the user router
import express from "express";
import {
  createBook,
  deleteById,
  getBook,
  getBookById,
  updateBook,
} from "./bookController";
import multer from "multer";
import path from "node:path/posix";
import authentication from "../middlewares/authenticate";

const bookRouter = express.Router();
// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  // dest is the destination where the file will be uploaded
  // __dirname is the directory name of the current module
  limits: { fileSize: 3e7 },
});

// creating the routes

// book creation route
bookRouter.post(
  "/",
  authentication,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);
// book update route
bookRouter.patch(
  "/:bookId",
  authentication,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);
// get all the books

bookRouter.get("/", getBook);
//get single book
bookRouter.get("/:bookId", getBookById);
// book delete route
bookRouter.delete("/:bookId", authentication, deleteById);

export default bookRouter;
