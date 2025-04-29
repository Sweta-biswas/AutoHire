const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const { z } = require('zod'); // Import Zod
const { Employer, JobApplicant, JobPost, JobApplication } = require('../db');
require('dotenv').config();
const passport = require("passport");
const { authMiddleware } = require('../middleware');
const { matchResumesForJob } = require('../services/JobMatch');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const CLIENT_URL = process.env.CLIENT_URL
// Zod Schema for Employer Signup
const employerSignupSchema = z.object({
  fullName: z.string().min(3, 'Name should have at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters long').optional(), // Optional password
  signUpMethod: z.enum(['manual', 'google']),
  profilePicture: z.string().url('Invalid URL').optional(), // Ensure signupType can only be 'normal' or 'google'
}).refine(
  (data) => data.signUpMethod !== 'manual' || (data.password && data.password.length >= 6),
  {
    message: 'Password is required and should be at least 6 characters long',
    path: ['password'],
  }
);

// Zod Schema for Employer Signin
const employerSigninSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters long'),
});

const jobPostSchema = z.object({
  companyName: z.string().min(5, 'Company name must be at least 5 characters.'),
  companyDescription: z.string().min(100, 'Description must be at least 100 characters.'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  position: z.string().min(2, 'Position must be at least 2 characters.'),
  linkedInProfile: z.string().url().refine(
    (value) => /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(value),
    { message: 'Please enter a valid LinkedIn profile URL.' }
  ),
  email: z.string().email('Please enter a valid email address.'),
  phoneNumber: z.string().regex(/^\d{10,}$/, 'Phone number should only contain digits and have a minimum of 10 digits.'),
  employeeNumber: z.enum(["1-49", "50-199", "200-499", "500+",""]),
  jobRole: z.string().min(5, 'Job Role must be at least 5 characters.'),
  jobDescription: z.string().min(100, 'Job Description must be at least 100 characters.'),
  experience: z.enum(["0-1 years", "2-4 years", "5-7 years", "8+ years"]),
  jobLocation: z.enum(["onsite", "remote"]),
  country: z.string().optional(),
  city: z.string().optional(),
  skills: z.array(z.string().min(2, 'Each skill must be at least 2 characters.')).min(1, 'Please add at least one skill.'),
  minSalary: z.string().regex(/^\d+$/, 'Salary must contain only digits.'),
  maxSalary: z.string().regex(/^\d+$/, 'Salary must contain only digits.')
}).refine((data) => {
  if (data.jobLocation === "onsite") {
    if (!data.country || data.country.length < 5) {
      return false;
    }
    if (!data.city || data.city.length < 3) {
      return false;
    }
  }
  return true;
}, { 
  message: "Country must be at least 5 characters and City at least 3 characters for onsite jobs.",
  path: ["country", "city"]
});


// Signup route for Employer
router.post('/signup', async (req, res) => {
  try {
    
    // Validate request body with Zod
    const { fullName, email, password, signUpMethod } = employerSignupSchema.parse(req.body);
    let existingApplicant = await Employer.findOne({ email });

        // If the user doesn't exist in JobApplicant collection, check in Employer collection
        if (!existingApplicant) {
          existingApplicant = await JobApplicant.findOne({ email });
        }


    
    if (existingApplicant) {
      return res.status(400).json({ message: 'Email already exists' });
    }


    let hashedPassword = null;
    if (signUpMethod === 'manual' && password) { // Only hash if method is manual and password exists
        hashedPassword = await bcrypt.hash(password, 10);
    }
    const newApplicant = new Employer({
      fullName,
      email,
      password: hashedPassword, // Use hashedPassword if it's not null, otherwise it will be null
      signUpMethod, // Include signupType when creating a new applicant
      // profilePicture will be handled separately if needed or use default null
    });

    await newApplicant.save();
    res.status(201).json({ message: 'You registered successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.errors)
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    console.log(err.message)
    res.status(500).json({ message: 'Error registering applicant', error: err.message });
  }
});

// Signin route for Employer
router.post('/signin', async (req, res) => {
  
  try {
    // Validate request body with Zod
    
    const { email, password } = employerSigninSchema.parse(req.body);

    const applicant = await Employer.findOne({ email });
    
    if (!applicant) {
      
      return res.status(400).json({ message: 'User not found' });
    }

    if(applicant.signUpMethod!=="manual") {
      return res.status(400).json({message: "Please sign in with the method you used to sign up"})
    }

    const isMatch = await bcrypt.compare(password, applicant.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please check again' });
    }

    
    
    const payload = {
      id: applicant._id,
      email: applicant.email,
      fullName: applicant.fullName,
      role:"employer"
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    
    // Set the JWT token in an HTTP-only, secure cookie
    res.cookie('token', token, {
      httpOnly: true,   // Prevents client-side JavaScript from accessing the cookie
      secure: false,     // Ensures the cookie is sent only over HTTPS (set to false if testing locally over HTTP)
      sameSite: 'Strict'// CSRF protectio // 1 hour
    });
    res.json({ message: 'You signed in successfully'});
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

router.post('/jobpost', authMiddleware, async (req, res) => {
  try {
    // Validate and parse the request body using Zod schema
    const jobPostData = jobPostSchema.parse(req.body);

    // Create a new JobPost instance with parsed data
    const newJobPost = new JobPost({
      ...jobPostData,
      employer: req.user.id,
    });

    // Save the new job post to the database
    await newJobPost.save();

    // Respond immediately after saving the job post
    res.status(200).json({ message: 'Job post created successfully. Matching process started.', jobId: newJobPost._id }); // Use _id

    // --- Asynchronous ML processing starts here ---
    const jobData = {
      jobRole: newJobPost.jobRole,
      jobDescription: newJobPost.jobDescription,
      jobSkills: newJobPost.skills,
      requiredExperience: newJobPost.experience,
      jobLocation: newJobPost.jobLocation
      // Add city/country if needed by ML, e.g., if jobLocation is onsite
      // city: newJobPost.city,
      // country: newJobPost.country
    };

    // Batch query to fetch all resumes with only the needed fields
    // Consider adding filtering if the number of applicants is very large
    const resumes = await JobApplicant.find({}, {
      _id: 1, // Ensure we get the applicant ID
      'resume.professionalSummary': 1,
      'resume.skills.name': 1, // Get only the skill names
      'resume.experience.startDate': 1,
      'resume.experience.endDate': 1,
      'resume.personal.city': 1,
      'resume.personal.country': 1,
      'resume.education.description': 1
    }).lean(); // Use lean() for faster queries when full mongoose docs aren't needed

    // Re-map resume skills to be just an array of strings if needed by python script
    const processedResumes = resumes.map(r => ({
        ...r,
        resume: {
            ...r.resume,
            skills: r.resume.skills ? r.resume.skills.map(s => s.name) : []
        }
    }));


    const inputData = {
      jobId: newJobPost._id.toString(), // Pass the actual job post ID
      jobData,
      resumes: processedResumes // Use processed resumes
    };

    // Use a unique filename, e.g., based on job ID
    const inputFilePath = path.join(__dirname, `../temp/ml_input_${newJobPost._id}.json`);
    // Ensure temp directory exists
    fs.mkdirSync(path.dirname(inputFilePath), { recursive: true });
    fs.writeFileSync(inputFilePath, JSON.stringify(inputData));


    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python3'; // Allow configuring python path
    const scriptPath = path.join(__dirname, '../services/app.py');
    const pythonProcess = spawn(pythonExecutable, [scriptPath, inputFilePath]);


    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    let errorOutput = '';
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString(); // Capture stderr
      console.error(`Python stderr for Job ${newJobPost._id}: ${data}`); // Log stderr immediately with context
    });

    // Handle python process exit/error events
    pythonProcess.on('error', (spawnError) => {
        console.error(`Failed to start Python process for Job ${newJobPost._id}:`, spawnError);
         // Clean up the input file even on spawn error
         fs.unlink(inputFilePath, (err) => {
            if (err) console.error(`Error deleting temp input file ${inputFilePath}:`, err);
          });
    });


    pythonProcess.on('close', async (code) => { // Make the handler async
      console.log(`Python process for Job ${newJobPost._id} closed with code ${code}`); // Log the exit code

      if (errorOutput) { // Log accumulated stderr if any
        console.error(`Accumulated Python stderr for Job ${newJobPost._id}:`, errorOutput);
      }

      if (code === 0) {
        try {
          const result = JSON.parse(output);
          console.log(`ML matching result received for Job ${newJobPost._id}.`); // Log confirmation

          let highMatchCandidates = [];
          if (result && Array.isArray(result.matchResults)) {
            highMatchCandidates = result.matchResults
              .filter(candidate => candidate.cluster === 2) // Keep only cluster 2
              .map(candidate => ({ // Extract desired fields
                _id: candidate._id, // This is the JobApplicant _id
                matchScore: candidate.matchScore
              }));

            console.log(`Found ${highMatchCandidates.length} high-match candidates (cluster 2) for Job ${newJobPost._id}.`);

            // --- Save High Matches to JobApplication collection ---
            if (highMatchCandidates.length > 0) {
              console.log(`Saving ${highMatchCandidates.length} high-match applications to DB for Job ${newJobPost._id}...`);
              const applicationPromises = highMatchCandidates.map(candidate => {
                const newApplication = new JobApplication({
                  jobPost: newJobPost._id, // Reference to the JobPost document
                  jobApplicant: candidate._id, // Reference to the JobApplicant document
                  matchScore: candidate.matchScore // The calculated score
                });
                return newApplication.save()
                  .catch(saveError => {
                    // Log error for individual save failure but continue trying others
                    console.error(`Failed to save application for applicant ${candidate._id} to job ${newJobPost._id}:`, saveError);
                    return null; // Indicate failure for this specific application
                  });
              });

              // Wait for all save operations to complete
              const savedApplications = await Promise.all(applicationPromises);
              const successfulSaves = savedApplications.filter(app => app !== null).length;
              console.log(`Successfully saved ${successfulSaves} applications for Job ${newJobPost._id}.`);
              if (successfulSaves < highMatchCandidates.length) {
                  console.error(`Failed to save ${highMatchCandidates.length - successfulSaves} applications for Job ${newJobPost._id}.`);
              }
            }
            // -------------------------------------------------------

          } else {
            console.warn(`ML script output for Job ${newJobPost._id} did not contain a valid matchResults array.`);
          }

        } catch (parseError) {
          console.error(`Error parsing Python output JSON for Job ${newJobPost._id}:`, parseError);
          console.error('Raw Python output:', output);
        }
      } else {
        console.error(`Python process for Job ${newJobPost._id} exited with error code ${code}`);
        // Even if code is non-zero, try to parse output in case it's an error JSON
        try {
            const errorResult = JSON.parse(output);
            console.error('Python error output (parsed):', errorResult);
        } catch (e) {
            // If parsing fails, it wasn't the JSON error message we expected
            console.error('Raw Python output (on error):', output);
        }
      }
      // Clean up the input file (optional but good practice)
      fs.unlink(inputFilePath, (err) => {
          if (err) console.error(`Error deleting temp input file ${inputFilePath}:`, err);
          else console.log(`Deleted temp input file: ${inputFilePath}`);
      });
    });

    // Note: The main response was already sent. This ML part runs in the background.

  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.errors);
      return res.status(400).json({ message: err.errors.map((e) => e.message) });
    }
    console.error('Error in /jobpost route:', err); // Log detailed error
    res.status(500).json({ message: 'Error posting job', error: err.message });
  }
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user,
    });
  } else {
      res.status(401).json({ // Handle case where req.user might not be populated
          success: false,
          message: "User not authenticated or session expired.",
      });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});


router.get("/google-signup", passport.authenticate("google-signup-employer", { scope: ["profile", "email"] }));

router.get(
  "/google-signup/callback",
  (req, res, next) => {
    passport.authenticate("google-signup-employer", { session: false }, (err, user, info) => {
      if (err || !user) {
        // Log the error/info for debugging
        console.error('Google Signup Callback Error/Info:', err || info?.message);
        return res.redirect(`${CLIENT_URL}/signup-employer/?message=${encodeURIComponent(info?.message || 'Google signup failed')}`);
      }
       // Successful signup, redirect to login or a success page (maybe with login hint)
      res.redirect(`${CLIENT_URL}/signin-employer/?message=${encodeURIComponent(info.message || 'Signup successful! Please sign in.')}`);
    })(req, res, next);
  }
);


router.get("/google-signin", passport.authenticate("google-signin-employer", { scope: ["profile", "email"] }));

router.get(
  "/google-signin/callback",
  (req, res, next) => {
    passport.authenticate("google-signin-employer", { session: false }, (err, user, info) => {
       if (err || !user) {
         // Log the error/info for debugging
         console.error('Google Signin Callback Error/Info:', err || info?.message);
         return res.redirect(`${CLIENT_URL}/signin-employer/?message=${encodeURIComponent(info?.message || 'Google signin failed')}`);
       }
      // User authenticated successfully
      const payload = {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role:"employer" // Ensure role is correctly assigned
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Add token expiration

      // Set the JWT token in an HTTP-only, secure cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict',
        maxAge: 3600000 // 1 hour in milliseconds
      });
      // Redirect to a dashboard or home page upon successful signin
      res.redirect(`${CLIENT_URL}/?message=${encodeURIComponent(info?.message || 'Signed in successfully')}`);
    })(req, res, next);
  }
);




module.exports = router;