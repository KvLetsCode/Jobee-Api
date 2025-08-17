const express = require('express')
const router = express.Router()
const { getJobs, newJobs, getJobsInRadius, updateJob, deleteJob, getSingleJob, jobstats, applyJob } = require("../controllers/jobsController")
const { isAuthUser,authorizeRoles } = require('../middlewares/auth')

router.route('/jobs/:id/apply').put(isAuthUser,authorizeRoles("user"),applyJob)
router.route('/jobs').get(getJobs)
router.route('/job/:id/:slug').get(getSingleJob)

router.route('/stats/:topic').get(jobstats)


router.route('/jobs/new').post(isAuthUser,authorizeRoles("employeer","admin"),newJobs)
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius)

router.route('/jobs/:id').put(isAuthUser,authorizeRoles("employeer","admin"),updateJob)
router.route('/jobs/:id').delete(isAuthUser,authorizeRoles("employeer","admin"),deleteJob)

module.exports = router