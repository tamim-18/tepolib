import fs from "node:fs";

import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary_config";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion
  const coverImageMimeType = files.coverImage[0].mimetype.split("/")[-1];
  const filePath = files.coverImage[0].path;
  const filename = files.coverImage[0].filename;

  const bookFileName = files.file[0].filename;
  const bookFilePath = files.file[0].path;

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename, // This is the name of the file on Cloudinary
      folder: "book-covers", // This is the folder where the file will be stored on Cloudinary
      format: coverImageMimeType, // This is the format of the file
    });

    const bookUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw", // This is the type of the file.
      filename_override: bookFileName,
      folder: "books-pdf",
      format: "pdf",
    });
    // console.log("uploadResult", uploadResult);
    // console.log("BookuploadResult", bookUploadResult);
    // // save the book to the database
    // //@ts-ignore
    // console.log("userId: ", req.userId);
    const _req = req as AuthRequest; // Type assertion. This is to access the userId in the request object
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId, // This is the userId of the author
      coverImage: uploadResult.secure_url,
      file: bookUploadResult.secure_url,
    });
    // deleting the temporary files
    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while uploading file"));
  }

  // console.log("uploadResult", uploadResult);
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  // checl if the user is the author of the book
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "You are not authorized to update this book")
    );
  }

  res.send("update book");
};
export { createBook, updateBook };
