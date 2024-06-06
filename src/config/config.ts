import { config as dotenv } from "dotenv";
import { env } from "process";
dotenv();

const _config = {
  port: process.env.PORT,
  dburl: process.env.MONGODB_URI,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
export const config = Object.freeze(_config);
//object.freeze() is used to make the object immutable. This means that the object cannot be modified in any way. This is useful when you want to ensure that the object is not changed by any other part of the code.
