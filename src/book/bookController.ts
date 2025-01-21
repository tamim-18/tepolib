import fs from "node:fs";

import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary_config";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

// create a book
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion
  console.log(files);
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
// update the book by id

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  console.log(req.body);
  const bookId = req.params.bookId;
  // console.log(bookId);
  const book = await bookModel.findOne({ _id: bookId }); // This is to check if the book exists
  // console.log(book);
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
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion
  // console.log(files);
  let completeCoverImage = "";
  if (files.coverImage) {
    // delete the old cover image
    const filename = files.coverImage[0].filename;
    const coverImageMimeType = files.coverImage[0].mimetype.split("/")[-1];
    const filePath = files.coverImage[0].path;
    completeCoverImage = filename;

    // upload the new cover image
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename, // This is the name of the file on Cloudinary
      folder: "book-covers", // This is the folder where the file will be stored on Cloudinary
      format: coverImageMimeType, // This is the format of the file
    });

    // delete the old cover image
    completeCoverImage = uploadResult.secure_url; // This is the URL of the new cover image
    console.log(completeCoverImage);
    // delete the temporary file
    await fs.promises.unlink(filePath);
  }

  let completeBook = "";
  if (files.file) {
    const bookFileName = files.file[0].filename;
    const bookFilePath = files.file[0].path;
    completeBook = `${bookFileName}.pdf`;
    const bookUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw", // This is the type of the file.
      filename_override: bookFileName,
      folder: "books-pdf",
      format: "pdf", // This is the format of the file
    });
    completeBook = bookUploadResult.secure_url;
    // console.log("completeBook", completeBook);
    await fs.promises.unlink(bookFilePath);
  }

  // update the book

  const updateBoook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title,
      genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage, // This is the URL of the new cover image. If the cover image is not updated, the old cover image will be used
      file: completeBook ? completeBook : book.file, // This is the URL of the new book. If the book is not updated, the old book will be used
    },
    {
      new: true, // This is to return the updated document
    }
  );

  res.json(updateBoook);
};

// get all the books
const getBook = async (req: Request, res: Response, next: NextFunction) => {
  // we should not authenticate the books
  //adding pagination

  try {
    // find all the books
    const books = await bookModel.find();
    res.json(books);
  } catch (err) {
    return next(createHttpError(500, "While getting all the books"));
  }
};
// get single book
const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  // validate
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }
    res.json(book);
  } catch (err) {
    return next(createHttpError(500, "Error while getting a book"));
  }
};

// delete the book by id

const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "You are not authorized to delete this book")
    );
  }
  await bookModel.deleteOne({ _id: bookId });
  res.json({ message: "Book deleted successfully" });
};
export { createBook, updateBook, getBook, getBookById, deleteById };
