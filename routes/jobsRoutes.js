import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import {
  createJobController,
  deleteJobsController,
  getAllJobsController,
  JobStatsController,
  updateAllJobsController,
} from "../controllers/jobsController.js";

//routes object
const router = express.Router();

//routes
//CREATE JOBS || POST
router.post("/create-job", userAuth, createJobController);

//GET JOBS || GET
router.get("/get-job", userAuth, getAllJobsController);

//UPDATE JOBS || PATCH
router.patch("/update-job/:id", userAuth, updateAllJobsController);

//UPDATE JOBS ||DELETE
router.delete("/delete-job/:id", userAuth, deleteJobsController);

//JOB STATE Filters ||GET
router.get("/job-stats", userAuth, JobStatsController);

//export
export default router;
