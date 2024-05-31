import { config as dotenv } from "dotenv";
dotenv();

const _config = {
  port: process.env.PORT,
};
export const config = Object.freeze(_config);
//object.freeze() is used to make the object immutable. This means that the object cannot be modified in any way. This is useful when you want to ensure that the object is not changed by any other part of the code.
