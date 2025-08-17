const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')
const errorMiddleware = require('./middlewares/error')
const jobs  = require('./Routes/jobs')
const ErrorHandler = require('./utils/errorhandler')
const qs = require('qs');
const auth = require('./Routes/auth')
const cookieParser = require('cookie-parser')
const user = require('./Routes/user')
const fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
//const xssClean = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const bodyParser = require('body-parser')


// Setup Security Headers
app.use(helmet())

// Parse JSON body
app.use(express.json()); 

// set cookie parser
app.use(cookieParser())

// Upload File 
app.use(fileUpload())

// Mongo Sanitize
app.use(mongoSanitize())

//Prevent XSS Attacks
//app.use(xssClean())

// Prevent Parameter Pollution
app.use(hpp({
    whitelist:['position']
}))


//Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 min
    max:100
})
app.use(limiter)

//Setup CORS - Acessible by other domain
app.use(cors())

//Parses the query string (the part after ? in a URL).
app.set('query parser', str => qs.parse(str));


//setting up confing.env file variable
dotenv.config({ path: './config/config.env' })

// Handling Uncaught Exceptions
process.on('uncaughtException', err => {
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to uncaught exception.');
    process.exit(1)
    
    
});

//Connect database
connectDatabase()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use("/api/v1", jobs)
app.use('/api/v1', auth)
app.use('/api/v1' ,user)


// Handle unhandled routes
// app.all('/*', (req, res, next) => {
//     next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
// });


app.use((req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});


//Middleware Hnalde error
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
const server = app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
    
})

// Handling Unhandled Promise Rejection
process.on('UnhandledRejection', err => {
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to unhandles promise rejection');
    server.close(() => {
        process.exit(1)
    })
    
});

 
