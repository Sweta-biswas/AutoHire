import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupEmp from './pages/SignupEmployeer';
import Signin from './pages/SigninEmployeer';
import SignupHire from './pages/SignupJobApplicant';
import LoginHire from './pages/SigninJobApplicant';
import EmployerSignupForm from './pages/PostJobPage';
import JobDetailsForm from './pages/JobDetailsPage';
import JobListingPage from './pages/JobListingPage';
import ResumeBuilder from './pages/ResumeBuilder';


function App() {
  return (
    <Router>
      <div className="app">
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup-employer" element={<SignupEmp />} />
          <Route path="/signup-job-applicant" element={<SignupHire />} />
          <Route path="/signin-employer" element={<Signin />} />
          <Route path="/signin-job-applicant" element={<LoginHire />} />
          <Route path="/post-your-job" element={<EmployerSignupForm />} />
          <Route path="/job-details" element={<JobDetailsForm />} />
          <Route path="/job-listings" element={<JobListingPage />} /> {/* New Route */}
          <Route path="/resume-builder" element={<ResumeBuilder />} /> {/* New Route */}
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;