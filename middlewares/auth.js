const jwt = require('jsonwebtoken')
const User = require('../Models/users')
const catchAsyncError = require('./catchAsyncError')
const ErrorHandler = require('../utils/errorhandler')


// Check if the user is authenticated or not

exports.isAuthUser = catchAsyncError( async (req,res,next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorHandler('Login first to access this record',401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    next()
})

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resource.`,403))
        }
        next()
    }
}