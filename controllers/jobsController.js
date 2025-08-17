const Job = require("../Models/jobs");
const APIFilters = require("../utils/apiFilters");

const geoCoder = require("../utils/grocoder");

const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const path = require("path");
const fs = require("fs");

// Get all Jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
  const jobs = await apiFilters.query;
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

//create a new job => /api/v1/job/new
exports.newJobs = catchAsyncErrors(async (req, res, next) => {
  // Adding user to body
  req.body.user = req.user.id;
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job Created",
    data: job,
  });
});

// Search jobs with radius => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  //getting lat,lon from geocoder

  const loc = await geoCoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3936;

  const jobs = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

// Update a job => /api/v1/job/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // check if the user is owner
  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `User(${req.user.id}) is not allowed to update this job`,
        400
      )
    );
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "job is updated",
    data: job,
  });
});

// Delete a Job => /jobs/:id

exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select('+applicantsApplied');

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `User(${req.user.id}) is not allowed to update this job`,
        400
      )
    );
  }

  // Deleteing file associated with that job


    // Deleting all the files inside that Job - Resume
  for (let i = 0; i < job.applicantsApplied.length; i++) {
    let filepath = `${__dirname}/public/uploads/${job.applicantsApplied[i].resume}`.replace(
      "\\controllers",
      ""
    );

    fs.unlink(filepath, (err) => {
      if (err) return console.log(err);
    });
  }

  job = await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job is Deleted",
  });
});

// Get a Single Job with id and slug => /jobs/:id/:slug

exports.getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  }).populate({
    path: "user",
    select: "name",
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

// Get stats about a topic => /static/:topic

exports.jobstats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPositions: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(new ErrorHandler("No stats found", 200));
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// Apply to job using Resume =< /api/v1/job?:id/apply

exports.applyJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select("+applicantsApplied");

  if (!job) {
    return next(new ErrorHandler("Job not Found", 404));
  }

  if (job.lastDate < new Date(Date.now())) {
    return next(new ErrorHandler("You cannot apply to this job", 400));
  }

  if (!req.files) {
    return next(new ErrorHandler("Please upload file", 400));
  }

  const file = req.files.file;

  // check file type
  const supportedFiles = /(\.pdf|\.docx)$/i;

  if (!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler("File should be .pdf or .docx", 400));
  }

  // Check Doucument size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorHandler("Please upload file less than 2MB", 400));
  }

  // Check User has already applied for a job
  for (let i = 0; i < job.applicantsApplied.length; i++) {
    if (job.applicantsApplied[i].id === req.user.id) {
      return next(
        new ErrorHandler("You have already applied for this job", 400)
      );
    }
  }

  // Renaming resume
  file.name = `${req.user.name.replace(" ", "_")}_${job._id}${
    path.parse(file.name).ext
  }`;

  file.mv(
    `${process.env.UPLOAD_PATH}/${file.name}`,

    async (err) => {
      if (err) {
        console.log(err);
        return next(new ErrorHandler("Resmue upload failed", 500));
      }
      await Job.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            applicantsApplied: {
              id: req.user.id,
              resume: file.name,
            },
          },
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );
      res.status(200).json({
        success: true,
        message: "File uploaded succesfully",
        data: file.name,
      });
    }
  );
});
