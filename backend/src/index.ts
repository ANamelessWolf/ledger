import express, { Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";

const port = process.env.PORT || 3002;

dotenv.config();

const app = express();
app.use(router);

const init = async () => {
  try {
    // Start the server
    const server = app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});

    // Manage unhandled promise rejections
		process.on('unhandledRejection', (err: Error) => {
      console.log(`Exit with code 1 due to Unhadled Promise Rejection: ${err.message}`);
			server.close(() => process.exit(1));
		});

  } catch (err) {
    console.error('Something went wrong while starting the server', err);
    process.exit(1);
  }

};

init();


