import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Comment from "../models/commentModel";
import CrimeReport from "../models/crimeReportModel";
import User from "../models/userModel";
import { AuthRequest } from "../types/AuthRequest";

/**
 * @desc Add a comment with proof (Images or Video)
 * @route POST /api/comments/:crimeReportId
 * @access Verified Users Only
 */
export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { crimeReportId } = req.params;
    const { content, proofImages, proofVideo } = req.body;

    if (
      !content ||
      ((!proofImages || proofImages.length === 0) && !proofVideo)
    ) {
      return next(
        createHttpError(400, "Comment must contain proof (image or video)")
      );
    }

    // Ensure crime report exists
    const crimeReport = await CrimeReport.findById(crimeReportId);
    if (!crimeReport) {
      return next(createHttpError(404, "Crime report not found"));
    }

    const newComment = new Comment({
      user: req.userId,
      crimeReport: crimeReportId,
      content,
      proofImages: proofImages || [],
      proofVideo: proofVideo || null,
    });

    await newComment.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Get all comments for a crime report
 * @route GET /api/comments/:crimeReportId
 * @access Public
 */
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { crimeReportId } = req.params;

    // Fetch all comments for the given crime report
    const comments = await Comment.find({ crimeReport: crimeReportId })
      .populate("user", "email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Delete a comment (Admin Only)
 * @route DELETE /api/comments/:commentId
 * @access Admin Only
 */
export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(createHttpError(404, "Comment not found"));
    }

    // ✅ Fetch the user to check their role
    const user = await User.findById(req.userId);
    if (!user) {
      return next(createHttpError(401, "User not found"));
    }

    // ✅ Ensure only an admin can delete comments
    if (user.role !== "admin") {
      return next(createHttpError(403, "Only admins can delete comments"));
    }

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};
