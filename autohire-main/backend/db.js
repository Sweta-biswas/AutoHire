const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas', err));

const jobApplicantSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if signUpMethod is 'manual'
        return this.signUpMethod === 'manual';
      },
      minlength: 6,
      default: null, // Password is set to null for Google sign-up
    },
    googleId: {
      type: String,
      default: null, // Google ID is null for manual sign-up
    },
    signUpMethod: {
      type: String,
      required: true,
      enum: ['manual', 'google'], // Only allow 'manual' or 'google' as signUpMethod
    },
    profilePicture: {
      type: String,
      default: null, // Profile picture is null for manual sign-up
    },
    resume: {
      resumeTitle: String,
      personal: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        country: String,
        city: String,
        address: String,
        pincode: String,
        photo: String,
        nationality: String,
        skills: [String],
        jobTitle: String,
      },
      professionalSummary: String,
      education: [
        {
          school: String,
          degree: String,
          startDate: String,
          endDate: String,
          city: String,
          description: String,
        }
      ],
      experience: [
        {
          role: String,
          company: String,
          startDate: String,
          endDate: String,
          city: String,
          description: String,
        }
      ],
      skills: [
        {
          name: String,
          level: String,
        }
      ],
      websites: [
        {
          label: String,
          link: String,
        }
      ],
      projects: [
        {
          title: String,
          role: String,
          startDate: String,
          endDate: String,
          city: String,
          description: String,
          projectLink: String,
        }
      ],
    },
  });

  const EmployerSchema = new mongoose.Schema({
    jobId: { 
      type: String, 
      unique: true, 
      default: () => `JOB-${Math.floor(1000 + Math.random() * 9000)}` // Generates a random job ID
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if signUpMethod is 'manual'
        return this.signUpMethod === 'manual';
      },
      minlength: 6,
      default: null, // Password is set to null for Google sign-up
    },
    googleId: {
      type: String,
      default: null, // Google ID is null for manual sign-up
    },
    signUpMethod: {
      type: String,
      required: true,
      enum: ['manual', 'google'], // Only allow 'manual' or 'google' as signUpMethod
    },
    profilePicture: {
      type: String,
      default: null, // Profile picture is null for manual sign-up
    },
  });

  const jobPostSchema = new mongoose.Schema({
    jobId: { 
      type: String, 
      unique: true, 
      default: () => `JOB-${Math.floor(1000 + Math.random() * 9000)}` // Generates a random job ID
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true, // Assuming each job post must be associated with an employer
    },
    companyName: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },
    companyDescription: {
      type: String,
      required: true,
      minlength: 100,
    },
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      minlength: 2,
    },
    linkedInProfile: {
      type: String,
      required: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please enter a valid LinkedIn profile URL.'],
    },
    email: {
      type: String,
      required: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
      unique: false
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10,}$/, 'Phone number should only contain digits and have a minimum of 10 digits.'],
    },
    employeeNumber: {
      type: String,
      enum: ["1-49", "50-199", "200-499", "500+",""],
    },
    jobRole: {
      type: String,
      required: true,
      minlength: 5,
    },
    jobDescription: {
      type: String,
      required: true,
      minlength: 100,
    },
    experience: {
      type: String,
      required: true,
      enum: ["0-1 years", "2-4 years", "5-7 years", "8+ years"],
    },
    jobLocation: {
      type: String,
      required: true,
      enum: ["onsite", "remote"],
    },
    country: {
      type: String,
      required: function() {
        return this.jobLocation === "onsite";
      },
      validate: {
        validator: function(v) {
          // Only validate length if jobLocation is onsite or if a value is provided
          return this.jobLocation === "remote" || !v || v.length >= 5;
        },
        message: 'Country must be at least 5 characters for onsite jobs.',
      },
    },
    city: {
      type: String,
      required: function() {
        return this.jobLocation === "onsite";
      },
      validate: {
        validator: function(v) {
          // Only validate length if jobLocation is onsite or if a value is provided
          return this.jobLocation === "remote" || !v || v.length >= 3;
        },
        message: 'City must be at least 3 characters for onsite jobs.',
      },
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0 && arr.every(skill => skill.length >= 2),
        message: 'Please add at least one skill, and each skill must be at least 2 characters.',
      },
    },
    minSalary: {
      type: String,
      required: true,
      match: [/^\d+$/, 'Salary must contain only digits.'],
    },
    maxSalary: {
      type: String,
      required: true,
      match: [/^\d+$/, 'Salary must contain only digits.'],
    }
  });
  
  const jobApplicationSchema = new mongoose.Schema({
    jobPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true,
    },
    jobApplicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplicant',
        required: true,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null, // Default value set to null
    },
    applicationDate: {
        type: Date,
        default: Date.now,
    },
});







// Create the JobApplicant model
const JobApplicant = mongoose.model('JobApplicant', jobApplicantSchema);
const Employer = mongoose.model('Employer', EmployerSchema);
const JobPost = mongoose.model('JobPost', jobPostSchema);
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = {JobApplicant,Employer,JobPost, JobApplication};