import express from "express";
import authenticateUser from "../middlewares/authenticate";
import { isVerifiedUser } from "../middlewares/isVerfiedUser";
import { isAdmin } from "../middlewares/isAdmin";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controller/commentController";

const commentRouter = express.Router();

// 📌 Add a comment with proof (Only verified users)
commentRouter.post(
  "/:crimeReportId",
  authenticateUser,
  isVerifiedUser,
  addComment
); // ✅

// 📌 Get all comments for a crime report (Public)
commentRouter.get("/:crimeReportId", getComments);

// 📌 Admin deletes a comment
commentRouter.delete("/:commentId", authenticateUser, isAdmin, deleteComment);

export default commentRouter;
