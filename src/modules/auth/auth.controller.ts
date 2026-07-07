import type { Request, Response } from "express"
import { authService } from "./auth.service"

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpIntoDB(req.body);

    // console.log(result)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });

  } catch (error) {
    console.log(error);
    throw Error("An error occured");
  }
};


const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginToDB(req.body);

    const { accessToken, ...userDataExceptPassword } = result;

    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        user: userDataExceptPassword
      }
    });


  } catch (error) {
    console.log(error)
  }
}


export const authController = {
  signUp,
  login
}