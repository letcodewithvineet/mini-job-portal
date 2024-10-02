import jobsModel from "../models/jobsModel.js";
import mongoose from "mongoose";
import moment from "moment";

//==== CREATE JOBS ====

export const createJobController = async (req, res, next) => {
  const { company, position } = req.body;
  if (!company || !position) {
    next("Please provide required fields");
  }
  req.body.createdBy = req.user.userId;
  const job = await jobsModel.create(req.body);
  res.status(201).json({ job });
};

//===== GET JOBS =====
export const getAllJobsController = async (req, res, next) => {
  const { status, workType, search, sort } = req.query;
  //condition for searching filter
  const queryObject = {
    createdBy: req.user.userId,
  };
  //logic filter
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (workType && workType !== "all") {
    queryObject.workType = workType;
  }
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  let queryResult = jobsModel.find(queryObject);

  //sorting
  if (sort === "latest") {
    queryResult.sort("-createdAt");
  }
  if (sort === "oldest") {
    queryResult.sort("createdAt");
  }
  if (sort === "a-z") {
    queryResult.sort("position");
  }
  if (sort === "z-a") {
    queryResult.sort("-position");
  }

  //pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  queryResult = queryResult.skip(skip).limit(limit);
  //job count
  const jobCount = await jobsModel.countDocuments(queryResult);
  const numOfPage = Math.ceil(jobCount / limit);

  const jobs = await queryResult;
  res.status(200).json({
    jobCount,
    jobs,
    numOfPage,
  });
};

//===== UPDATE JOBS =====
export const updateAllJobsController = async (req, res, next) => {
  const { id } = req.params;
  const { company, position } = req.body;
  //validation
  if (!company || !position) {
    next("Please provide required fields");
  }
  //find jobs
  const job = await jobsModel.findOne({ _id: id });
  //validation
  if (!job) {
    next(`Job not found with this id ${id}`);
  }
  if (!req.user.userid === job.createdBy.toString()) {
    next("You are not authorized to update  this job");
    return;
  }

  //update jobs
  const updatedJob = await jobsModel.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  //res
  res.status(200).json({ updatedJob });
};

//=== DELETE JOBS ===
export const deleteJobsController = async (req, res, next) => {
  const { id } = req.params;
  const job = await jobsModel.findOne({ _id: id });
  if (!job) {
    next(`Job not found with this id ${id}`);
  }
  if (!req.user.userId === job.createdBy.toString()) {
    next("You are not authorized to delete this job");
    return;
  }
  //delete jobs
  await jobsModel.deleteOne({ _id: id });
  res.status(200).json({ message: "Job deleted successfully" });
};

//=== STATE JOBS && FILTER ===
export const JobStatsController = async (req, res, next) => {
  const stats = await jobsModel.aggregate([
    //search by user jobs
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  //default stats
  const defaultStats = {
    pending: stats.pending || 0,
    reject: stats.reject || 0,
    approved: stats.approved || 0,
    interview: stats.interview || 0,
  };
  //monthly yearly stats
  let monthlyApplication = await jobsModel.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  monthlyApplication = monthlyApplication
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res
    .status(200)
    .json({ totalJobs: stats.length, defaultStats, monthlyApplication });
};
