import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "../user/user.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const saltRounds: number = Number(config.salt_rounds);



const signUpIntoDB = async (payload: IUser) => {

  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashedPassword, role]
  );

  if (result?.rows[0].length === 0) {
    throw new Error("An error occured!");
  };

  const { password: userPassword, ...userData } = result?.rows[0];

  return userData;
};


const loginToDB = async (payload: {
  email: string,
  password: string
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users
    WHERE email=$1
    `,
    [email]
  );

  if (userData?.rows?.length === 0) {
    throw new Error("Invalid Credentials!")
  };


  const user = userData?.rows[0];
  const matchedPassword = await bcrypt.compare(password, user?.password);

  if (!matchedPassword) {
    throw new Error("Invalid Credentials!");
  };

  const { password: userPassword, ...userDataExceptPassword } = user;


  const jwtPayload = {
    id: user?.id,
    name: user?.name,
    role: user?.role
  }

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, { expiresIn: "10d" });


  return { accessToken, userDataExceptPassword };

}


export const authService = {
  signUpIntoDB,
  loginToDB
}