

const User = require('../Models/users')
const catchAsyncError = require('../middlewares/catchAsyncError')
const crypto = require('crypto')

const ErrorHandler = require('../utils/errorhandler')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')

// Register a new user => /api/v1/user/register

exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password, role } = req.body
    
    const user =  await User.create({
        name,
        email,
        password,
        role
    })

    // create JWT Token
    sendToken(user,200 ,res)
})


// Login user 
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // checks if email or password is entered 
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password',400))
    }

    // finding user in database

    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password",401))
    }

    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password',401))
    }

    // create JSON Web Token
    sendToken(user, 200 ,res)
})


// Forgot Password => /api/v1/password/forgot

exports.forgotPasword = catchAsyncError(async (req,res,next) => {
    const user = await User.findOne({ email: req.body.email })
    
    // check user email in database
    if (!user) {
        return next(new ErrorHandler('No user found with this email',404))
    }

    // Get reset Token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // create reset password url 
    const reseturl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset link as follow:\n\n${reseturl}\n\n If you have not request this pleasw ignore this`

    try {
        await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        text :message
        })

        res.status(200).json({
            success: true,
            message:"Email sent successfully"
        })
        
    } catch (error) {

        console.log(error);
        
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })
        
        return next(new ErrorHandler('Email is not sent ',500))
    }
    
    
})

// Reset Password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // Hash url token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex')

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })
    
    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has expired',400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user,200,res)
})

exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message:'Logged out successfully'
    })
})

