import config from "../../config";
import { pool } from "../../db";
import type { IIssue, IIssuesQuery } from "./issue.interface";
import jwt from "jsonwebtoken";





const createIssueIntoDB = async (payload: IIssue, jwtToken: string) => {
  const { title, description, type } = payload;

  const verifiedPayload = jwt.verify(jwtToken, config.jwt_access_secret);

  const { id: reporterId, role } = verifiedPayload as {
    id: string,
    role: string
  };

  if (!reporterId) {
    throw new Error("You are not authorized!")
  }


  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, reporterId]
  );

  return result;
};


const getAllIssuesFromDB = async (query: IIssuesQuery) => {
  const { sort, type, status } = query;

  const values = [];

  let sql = `
    SELECT id, issues.title, issues.description, issues.type, issues.status, issues.created_at, issues.updated_at, 
    (
      SELECT json_build_object(
          'id', users.id,
          'name', users.name,
          'role', users.role
      ) FROM users
       WHERE issues.reporter_id = users.id
    ) AS reporter

    FROM issues WHERE 1=1
  `;

  if (type) {
    values.push(type);
    sql += ` AND type = $${values.length}`;
  }

  if (status) {
    values.push(status);
    sql += ` AND status = $${values.length}`;
  };

  sql += ` ORDER BY id ${sort === "oldest" ? "ASC" : "DESC"}`;

  const result = await pool.query(sql, values);

  const allIssues = result?.rows;

  // const reporterIdArray = [];
  // for (let i = 0; i < allIssues?.length; i++) {
  //   reporterIdArray.push(allIssues[i]?.reporter_id);
  // }

  // const reportedData = `

  // `

  // console.log(result?.rows);
  // console.log({ reporterIdArray });



  return result;

};



const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `

        SELECT id, issues.title, issues.description, issues.type, issues.status, issues.created_at, issues.updated_at, 
    (
      SELECT json_build_object(
          'id', users.id,
          'name', users.name,
          'role', users.role
      ) FROM users
       WHERE issues.reporter_id = users.id
    ) AS reporter

    FROM issues
    WHERE id=$1
    `,
    [id]
  );

  return result;
};



const updateIssueInDB = async (
  id: string,
  jwtToken: string,
  payload: {
    title?: string,
    description?: string,
    type?: string
  }) => {

  if (!jwtToken) {
    throw new Error('Token not provied!');
  }


  const { title, description, type } = payload;
  const verifiedPayload = jwt.verify(jwtToken, config.jwt_access_secret);



  const { id: reporterId, role } = verifiedPayload as {
    id: string,
    role: string
  };

  if (!reporterId) {
    return null;
  }


  if (role === 'contributor') {
    const result = await pool.query(
      `
      UPDATE issues
      SET title=$1, description=$2, type=$3
      WHERE status='open' AND id=$4 AND reporter_id=$5
      RETURNING *
      `,
      [title, description, type, id, reporterId]
    );

    return result;
  }
  const result = await pool.query(
    `
      UPDATE issues
      SET title=$1, description=$2, type=$3
      WHERE id=$4
      RETURNING *
      `,
    [title, description, type, id]
  );

  return result;
}



const deleteIssueFromDB = async (
  id: string,
  jwtToken: string,
) => {

  const verifiedPayload = jwt.verify(jwtToken, config.jwt_access_secret);

  const { id: reporterId, role } = verifiedPayload as {
    id: string,
    role: string
  };

  if (role !== 'maintainer') {
    return null;
  }

  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id=$1
      RETURNING *
      `,
    [id]
  );

  return result;
}



export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB
}