const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const geoCoder = require('../utils/grocoder')

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter Job title'],
        trim: true,
        maxlength:[100,'Job title cannot exceed 100 charcters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter Job Desc'],
        maxlength:[1000,'Job descust be 1000 characters']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please add a valid email address']
  },
  location: {
    type: {
      type: String,
      enum:['Point']
    },
    coordinates: {
      type: [Number],
      index:'2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country:String
  },
    address: {
    type: String,
        required:[true , 'Please addd an address']
    },
    company: {
        type: String,
        required: [true , 'Add company name']
    },
    industry: {
        type: [String],
        required: [true,'Please enter industry for this job'],
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message:'Please select correct options for Industry'
        }
    },
    jobType: {
        type: String,
        required: [true,'Please enter job type'],
        enum: {
            values: [
                'Permanent',
                'Internship',
                'Temporary'
            ],
            message: 'Please select correct options for job type'
        }
    },
    minEducation: {
        type: String,
        required: [true,'Please enter education for this Job'],
        enum: {
            values: [
                'Bachelors',
                'Master',
                'Phd'
            ],
            message:'Please select options for Educaiton'
        }
    },
    positions: {
        type: Number,
        default:1
    },
    experience: {
        type: String,
        required: [true,'Please enter experience required for this job'],
        enum: {
            values: [
                'No Experience',
                '1 Year - 2 Year',
                '2 Year - 5 Year',
                '5 years+',
            ],
            message:'Please selct correct options for expreience'
        }
    },
    salary: {
        type: Number,
        required:[true,'Please enter expected salary for this job']
    },
    postingDate: {
        type: Date,
        default:Date.now
    },
    postingDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object],
        select:false,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    }
})

// Creating Job Slug befoere saving
jobSchema.pre('save', function(next) {
  // creating slug brfore saving for db
  this.slug = slugify(this.title, { lower: true })
  
  next()
})

//Setting up location 
jobSchema.pre('save',async function (next) {
  const loc = await geoCoder.geocode(this.address)

  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country : loc[0].countryCode
  }
  next()
})



module.exports = mongoose.model('Jobs',jobSchema)