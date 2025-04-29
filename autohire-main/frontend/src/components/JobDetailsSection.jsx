import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobDetails from './JobDetails';

const JobDetailsSection = ({ jobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false); // New state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await axios.get(
          `http://localhost:4000/api/v1/joblist/${jobId}`,
          {
            withCredentials: true,
          }
        );

        if (response.status === 202) {
          setAlreadyApplied(true);
        } else {
          setAlreadyApplied(false);
        }

        const data = response.data;
        console.log(data);

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
          skills: data.skills,
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
        setError('Failed to load job details. Please sign in to see the job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="flex items-center justify-center h-full text-black w-full">
        Select a job to view details
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <JobDetails 
      job={jobDetails} 
      jobId={jobId} 
      alreadyApplied={alreadyApplied} // Pass the new prop
    />
  );
};

export default React.memo(JobDetailsSection);
