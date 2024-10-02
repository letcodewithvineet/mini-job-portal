//API Documentation
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
//package import
import express from "express";
import dotenv from "dotenv";
import chalk from "chalk"; // Import Chalk for colorful console output
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";
//security packages
import helmet from "helmet";
import xss from "xss-purge";
import ExpressMongoSanitize from "express-mongo-sanitize";

//files imports
import connectDB from "./config/db.js";
//routes import
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import erroMiddleware from "./middlewares/errorMiddleware.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import userRoutes from "./routes/userRouters.js";

//Dot ENV config
dotenv.config();

//mongodb connection
connectDB();

// Swagger api config
// swagger api options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal Application",
      description: "Node Expressjs Job Portal Application",
    },
    servers: [
      {
        //         url: "http://localhost:8080",
        url: "https://nodejs-job-portal-app.onrender.com",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const spec = swaggerJSDoc(options);

const app = express();

//middleware
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(xss());
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/job", jobsRoutes);

//home route
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(spec));

//validation middleware

app.use(erroMiddleware);

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  /** console.log(
    chalk.bgCyan.white(
      `Node Server Running In ${process.env.DEV_MODE} Mode on Port number ${PORT}.`
    )
  ); // Log server startup message with background color and port number */
});
