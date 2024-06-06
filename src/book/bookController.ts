import fs from "node:fs";

import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary_config";
import createHttpError from "http-errors";
import bookModel from "./bookModel";

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
    console.log("uploadResult", uploadResult);
    console.log("BookuploadResult", bookUploadResult);
    // save the book to the database

    const newBook = await bookModel.create({
      title,
      genre,
      author: "665d89ea1fd373bc383b3eb6",
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

export { createBook };
