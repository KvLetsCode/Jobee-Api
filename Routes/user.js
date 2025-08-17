const express = require('express')
const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserAdmin } = require('../controllers/userController')
const router = express.Router()
const { isAuthUser, authorizeRoles } = require('../middlewares/auth')


router.use(isAuthUser)

router.route('/me').get(getUserProfile)
router.route('/jobs/applied').get( authorizeRoles('user'), getAppliedJobs)
router.route('/jobs/published').get(authorizeRoles('employeer','admin') ,getPublishedJobs)
router.route('/password/update').put( updatePassword)
router.route('/me/update').put( updateUser)
router.route('/me/delete').delete(deleteUser)

// Admin Routes
router.route('/users').get( authorizeRoles('admin'), getUsers)

router.route('/users/:id').delete(authorizeRoles('admin'),deleteUserAdmin)

module.exports = router;