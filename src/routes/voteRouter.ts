import express from "express";
import authenticateUser from "../middlewares/authenticate";
import { isVerifiedUser } from "../middlewares/isVerfiedUser";
import { castVote, getVotes, removeVote } from "../controller/voteController";

const voteRouter = express.Router();

// 📌 Cast a vote (Upvote/Downvote)
voteRouter.post("/", authenticateUser, isVerifiedUser, castVote); // ✅

// 📌 Get total upvotes/downvotes for a report
voteRouter.get("/:crimeReportId", getVotes);

// 📌 Remove a user's vote
voteRouter.delete(
  "/:crimeReportId",
  authenticateUser,
  isVerifiedUser,
  removeVote
); // ✅

export default voteRouter;
