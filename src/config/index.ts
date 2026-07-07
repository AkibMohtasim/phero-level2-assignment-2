import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});


const config = {
  connection_string: process.env.CONNECTION_STRING as string,
  port: process.env.PORT as string,
  salt_rounds: process.env.SALT_ROUNDS as string,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string
};


export default config;