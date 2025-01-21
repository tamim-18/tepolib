// seting up the express app
import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();
// express.json() is a middleware for the json formatting
app.use(express.json());
//routes
//http methods are:
//GET, POST, PUT, DELETE
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

//registering the user router

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// global error handler
// it should be the last middleware. otherwise, it will not catch errors
app.use(globalErrorHandler);

export default app;
