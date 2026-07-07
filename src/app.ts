import express, { type Application } from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issue/issue.route";
import cors from "cors";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5000",
  }),
);




app.use('/api/auth', authRoute);
app.use('/api/issues', issuesRoute);

app.get('/', (req, res) => {
  res.send('server running!!');
});


export default app;


