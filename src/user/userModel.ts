import mongoose from "mongoose";
import { User } from "./userTypes";

//creating user model

// generics in typescript
// generics are used to create reusable components. It allows us to write a function or a class that can work with any data type.

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true, //unique index. If we try to insert a duplicate email, it will throw an error
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, //this will add createdAt and updatedAt fields
  }
);

// way of creating schema in mongoose. give step by step explanation
// 1. import mongoose
// 2. create a schema using mongoose.Schema
// 3. define the schema with the fields and their types
// 4. export the schema

// users name schema

export default mongoose.model<User>("User", userSchema);
