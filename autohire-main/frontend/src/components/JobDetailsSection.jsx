import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobDetails from './JobDetails';
import { Briefcase, AlertCircle } from 'lucide-react';

const JobDetailsSection = ({ jobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        const response = await axios.get(
          `http://localhost:4000/api/v1/joblist/${jobId}`,
          {
            withCredentials: true,
          }
        );
        
        // Debug information
        console.log("Response status:", response.status);
        console.log("Full response:", response);
        
        // Check the status code
        setAlreadyApplied(response.status === 202);

        const data = response.data;
        
        setJobDetails({
          id: data._id,
          title: data.position,
          description: data.jobDescription,
          company: data.companyName,
          aboutCompany: data.companyDescription,
          noOfEmployees: data.employeeNumber || 'Information not available',
          location: data.jobLocation?.toLowerCase() === 'remote'
            ? 'Remote'
            : `${data.city || ''}, ${data.country || ''}`.trim() || data.jobLocation,
          salary: `₹${data.minSalary} - ₹${data.maxSalary} per annum`,
          experience: data.experience,
          role: data.jobRole,
          skills: data.skills || [],
          employer: {
            name: data.fullName,
            position: 'Not specified',
            linkedin: data.linkedInProfile,
            email: data.email,
            phone: data.phoneNumber,
          },
        });
        
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(
          error.response?.status === 401
            ? 'Please sign in to view job details'
            : 'Failed to load job details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="bg-[#f0f3ff] p-6 rounded-full mb-4">
          <Briefcase size={48} className="text-[#515cb1] opacity-70" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Job</h3>
        <p className="text-gray-500 max-w-md">
          Choose a job from the list to view its details
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#dfe7ff] rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-[#515cb1] rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-[#515cb1] font-medium">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 max-w-md mb-6">
          {error}
        </p>
        <button 
          onClick={() => window.location.href = '/signin-job-applicant'}
          className="px-6 py-2 bg-[#515cb1] text-white rounded-full hover:bg-[#3a4496] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <JobDetails 
      job={jobDetails}
      jobId={jobId}
      alreadyApplied={alreadyApplied}
    />
  );
};

export default React.memo(JobDetailsSection);