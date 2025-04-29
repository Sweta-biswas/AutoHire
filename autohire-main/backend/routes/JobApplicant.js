const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JobApplicant,Employer } = require('../db');
require('dotenv').config();
const passport = require("passport");
const CLIENT_URL = process.env.CLIENT_URL
const { z } = require('zod'); // Import Zod
const { authMiddleware } = require('../middleware');
const { JobApplication } = require('../db');

// Zod Schema for Job Applicant Signup
const applicantSignupSchema = z.object({
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



// Zod Schema for Job Applicant Signin
const applicantSigninSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password should be at least 6 characters long'),
});

const resumeSchema = z.object({
  resumeTitle: z.string().optional(),
  personal: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    pincode: z.string().optional(),
    photo: z.string().url('Invalid URL').optional(),
    nationality: z.string().optional(),
    skills: z.array(z.string()).optional(),
    jobTitle: z.string().optional(),
  }).optional(),
  professionalSummary: z.string().optional(),
  education: z.array(
    z.object({
      school: z.string().optional(),
      degree: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      city: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      role: z.string().optional(),
      company: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      city: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  skills: z.array(
    z.object({
      name: z.string().optional(),
      level: z.string().optional(),
    })
  ).optional(),
  websites: z.array(
    z.object({
      label: z.string().optional(),
      link: z.string().url('Invalid URL').optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      title: z.string().optional(),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      city: z.string().optional(),
      description: z.string().optional(),
      projectLink: z.string().url('Invalid URL').optional(),
    })
  ).optional(),
});

// Signup route for Job Applicant
router.post('/signup', async (req, res) => {
  try {
    
    // Validate request body with Zod
    const { fullName, email, password, signUpMethod } = applicantSignupSchema.parse(req.body);
    let existingApplicant = await JobApplicant.findOne({ email });

        // If the user doesn't exist in JobApplicant collection, check in Employer collection
        if (!existingApplicant) {
          existingApplicant = await Employer.findOne({ email });
        }


    
    if (existingApplicant) {
      return res.status(400).json({ message: 'Email already exists' });
    }


    let hashedPassword = null;
    hashedPassword = await bcrypt.hash(password, 10);
    const newApplicant = new JobApplicant({
      fullName,
      email,
      password: hashedPassword, // Use hashedPassword if it's not null, otherwise it will be null
      signUpMethod, // Include signupType when creating a new applicant
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



// Signin route for Job Applicant
router.post('/signin', async (req, res) => {
  
  try {
    // Validate request body with Zod
    
    const { email, password } = applicantSigninSchema.parse(req.body);

    const applicant = await JobApplicant.findOne({ email });
    
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

// Endpoint to save resume data
router.post('/save-resume', authMiddleware, async (req, res) => {
  try {
    // Validate resume data with Zod
    const resumeData = resumeSchema.parse(req.body.resumeData);

    // Find the applicant by ID and update their resume data
    const applicant = await JobApplicant.findById(req.user.id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.resume = resumeData; // Assuming you have a 'resume' field in your JobApplicant model
    await applicant.save();

    res.status(200).json({ message: 'Resume saved successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message) });
    }
    console.error(err);
    res.status(500).json({ message: 'Error saving resume', error: err.message });
  }
});

// Endpoint to get resume data
router.get('/resume', authMiddleware, async (req, res) => {
  try {
    const applicant = await JobApplicant.findById(req.user.id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.status(200).json({ resume: applicant.resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving resume', error: err.message });
  }
});

router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      jobPost: jobId,
      jobApplicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create new application
    // For now, setting a default match score of 50
    // You might want to implement a proper matching algorithm
    const newApplication = new JobApplication({
      jobPost: jobId,
      jobApplicant: req.user.id
    });

    await newApplication.save();

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});


router.get("/google-signup", passport.authenticate("google-signup-jobapplicant", { scope: ["profile", "email"] }));

router.get(
  "/google-signup/callback",
  (req, res, next) => {
    passport.authenticate("google-signup-jobapplicant", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${CLIENT_URL}/signup-job-applicant/?message=${encodeURIComponent(info.message)}`);
      }
      res.redirect(`${CLIENT_URL}?message=${encodeURIComponent(info.message)}`);
    })(req, res, next);
  }
);

router.get("/google-signin", passport.authenticate("google-signin-jobapplicant", { scope: ["profile", "email"] }));

router.get(
  "/google-signin/callback",
  (req, res, next) => {
    passport.authenticate("google-signin-jobapplicant", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${CLIENT_URL}/signin-job-applicant/?message=${encodeURIComponent(info.message)}`);
      }
      const payload = {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);
      
      // Set the JWT token in an HTTP-only, secure cookie
      res.cookie('token', token, {
        httpOnly: true,   // Prevents client-side JavaScript from accessing the cookie
        secure: false,     // Ensures the cookie is sent only over HTTPS (set to false if testing locally over HTTP)
        sameSite: 'Strict'// CSRF protectio // 1 hour
      });
      res.redirect(`${CLIENT_URL}?message=${encodeURIComponent(info.message)}`);
    })(req, res, next);
  }
);


module.exports = router;