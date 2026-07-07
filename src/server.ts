import app from "./app.js";
import config from "./config";
import { initDB } from "./db";



const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`assignment 2 running on port ${config.port}`);
  });
};


main();