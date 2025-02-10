// seting up the express app
import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import bookRouter from "./book/bookRouter";
import userRouter from "./routes/userRoutes";
import crimeReportRouter from "./routes/crimeReportRouter";
import voteRouter from "./routes/voteRouter";
import commentRouter from "./routes/commentRouter";

const app = express();
// express.json() is a middleware for the json formatting
app.use(express.json());
//routes
//http methods are:
//GET, POST, PUT, DELETE
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

console.log("✅ app.ts: Registering user routes at /api/users");
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/report", crimeReportRouter);
app.use("/api/vote", voteRouter);
app.use("/api/comment", commentRouter);

// global error handler
// it should be the last middleware. otherwise, it will not catch errors
app.use(globalErrorHandler);

export default app;
