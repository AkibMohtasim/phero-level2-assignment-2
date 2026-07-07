import type { Request, Response } from "express";
import { issueService } from "./issue.service";




const createIssue = async (req: Request, res: Response) => {

  const jwtToken = req.headers.authorization as string;

  if (!jwtToken) {
    res.status(401).json({
      success: false,
      message: "Couldn't verify token!",
    })
  };

  try {
    const result = await issueService.createIssueIntoDB(req.body, jwtToken);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: result?.rows[0]
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};


const getAllIssues = async (req: Request, res: Response) => {
  try {
    const query = { ...req.query };

    // console.log(query)


    const result = await issueService.getAllIssuesFromDB(query);

    res.status(201).json({
      success: true,
      message: 'Issues retrived successfully',
      data: result?.rows
    });


  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};


const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id as string);

    res.status(201).json({
      success: true,
      message: 'Issue retrived successfully',
      data: result?.rows[0]
    })


  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};



const updateIssue = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.headers.authorization as string;
  const body = req.body;
  try {
    const result = await issueService.updateIssueInDB(id, payload, body);


    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result?.rows[0]

    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};



const deleteIssue = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const jwtPayload = req.headers.authorization as string;

  if (!jwtPayload) {
    return res.status(401).json({
      success: false,
      message: "Token not verified!",
    });
  };

  try {
    const result = await issueService.deleteIssueFromDB(id, jwtPayload);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "You are not authorized!"
      });
    }
    else {
      res.status(200).json({
        success: true,
        message: "Issue deleted successfully",
        data: result?.rows[0]
      })
    }



  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}



export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
}