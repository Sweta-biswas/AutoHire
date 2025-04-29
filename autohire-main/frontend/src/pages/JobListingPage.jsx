import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import JobDetailsSection from '../components/JobDetailsSection';
import { useLocation } from 'react-router-dom';

const JobListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchJobs = async (searchParams = {}) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      console.log(query);
      const response = await fetch(`http://localhost:4000/api/v1/joblist/alljobs?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();

      const transformedJobs = data.map((job) => ({
        id: job._id,
        title: job.jobRole,
        description: job.jobDescription,
        company: job.companyName,
        location: job.jobLocation === 'onsite' 
          ? `${job.city}, ${job.country}` 
          : 'Remote',
        salary: `₹${job.minSalary} - ₹${job.maxSalary} per annum`,
      }));

      setJobs(transformedJobs);
      setSelectedJobId(null); // Reset selected job when new search is done
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get search parameters from navigation state
    const searchParams = location.state || {};
    fetchJobs(searchParams);
  }, [location.state]); // Add location.state as dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  const NoJobsFound = () => (
    <div className="flex w-full flex-col items-center justify-center h-full text-center p-6">
      <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">No Jobs Found</h2>
      <p className="text-gray-500 max-w-md">
        We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div>
        <FilterBar onSearch={fetchJobs} />
      </div>

      <div className="mt-2 flex flex-col lg:flex-row flex-grow lg:space-x-8 p-6 bg-gradient-custom font-serif h-[calc(100vh-theme('spacing.16'))]">
        {jobs.length > 0 ? (
          <>
            {/* Left column with job cards */}
            <div className="lg:w-1/3 flex-shrink-0 overflow-y-auto h-full">
              <div className="mt-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    selected={selectedJobId === job.id}
                    onSelect={() => setSelectedJobId(job.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right column with job details */}
            <div className="lg:w-2/3 flex-shrink-0 overflow-y-auto h-full">
              {selectedJobId && (
                <JobDetailsSection key={selectedJobId} jobId={selectedJobId} />
              )}
            </div>
          </>
        ) : (
          <NoJobsFound />
        )}
      </div>
    </div>
  );
};

export default JobListingPage;