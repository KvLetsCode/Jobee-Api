
const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack:err.stack
        })
    }

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        
        error.message = err.message

        // Wrong Mongoose ObjectID Error

        if (err.name === 'CastError') {
            const message = `Resources not found . Invalid: ${err.path}`
            error = new ErrorHandler(message , 404)
        }

        // Handling Validation Error

        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message)
             error = new ErrorHandler(message , 400)
        }

        // Handle mongosse duplicate error
        if (err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message , 400)
        }

        if (err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is Invalid'
            error = new ErrorHandler(message , 500)
        }

        // Handling Expired jwt

        if (err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token is expired. Try Again!'
            error = new ErrorHandler(message , 500)
        }

        
        res.status(error.statusCode).json({
            success: false,
            message:error.message || 'Internal Server Error'
        })
    }

    
}