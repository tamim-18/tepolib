import { isVerifiedUser } from "./../middlewares/isVerfiedUser";
import express from "express";
import authenticateUser from "../middlewares/authenticate";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
} from "../controller/crimeReportController";
const crimeReportRouter = express.Router();

// 📌 Create a crime report (Only verified users)
crimeReportRouter.post("/", authenticateUser, isVerifiedUser, createReport); // ✅

// 📌 Get all crime reports (Paginated, Filterable, Searchable)
crimeReportRouter.get("/", getAllReports); // ✅

// 📌 Get a single crime report by ID
crimeReportRouter.get("/:id", getReportById); // ✅

// 📌 Delete crime report (Only the author or admin)
crimeReportRouter.delete(
  "/:id",
  authenticateUser,
  isVerifiedUser,
  deleteReport
); // ✅

export default crimeReportRouter;
