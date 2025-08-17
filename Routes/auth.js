const express = require('express')
const router = express.Router()
const { registerUser, loginUser, forgotPasword, resetPassword, logout } = require('../controllers/authController')
const { isAuthUser} = require('../middlewares/auth')


router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/password/forgot').post(forgotPasword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/logout').get(isAuthUser , logout)

module.exports = router;