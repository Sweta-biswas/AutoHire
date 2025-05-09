import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import JobDetailsSection from '../components/JobDetailsSection';
import { useLocation } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import Header from '../components/Header';

const JobListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();

  // Check authentication status for the header component
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/check-auth', {
          credentials: 'include',
        });
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setProfilePicture(data.user.profilePicture);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchJobs = async (searchParams = {}) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      console.log(query);
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/joblist/alljobs?${query}`, {
        credentials: 'include'
      });
      
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
        skills: job.skills || [],
        experience: job.experience || 'Not specified',
      }));

      setJobs(transformedJobs);
      // Select first job by default if any jobs are returned
      if (transformedJobs.length > 0 && !selectedJobId) {
        setSelectedJobId(transformedJobs[0].id);
      } else {
        setSelectedJobId(null);
      }
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

  // Loading state with animation
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#dfe7ff] rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-[#515cb1] rounded-full animate-spin"></div>
      </div>
      <p className="mt-5 text-[#515cb1] font-medium text-lg">Finding perfect jobs for you...</p>
    </div>
  );

  // Error state with retry button
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-4">
        <svg className="w-14 h-14 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
      <p className="text-gray-500 mb-6">We're having trouble loading jobs right now.</p>
      <button 
        onClick={() => fetchJobs(location.state || {})}
        className="px-5 py-2.5 bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white rounded-full hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
      >
        Try Again
      </button>
    </div>
  );

  // No jobs found state
  const NoJobsFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center">
      <div className="bg-[#f0f3ff] p-6 rounded-full mb-4">
        <Briefcase size={56} className="text-[#515cb1] opacity-60" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Jobs Found</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities.
      </p>
      <button 
        onClick={() => fetchJobs({})}
        className="px-5 py-2.5 bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white rounded-full hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 font-serif">
      {/* Header */}
      <Header isAuthenticated={isAuthenticated} profilePicture={profilePicture} />
      
      {/* Page Content */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#515cb1] mb-2">Find Your Perfect Job</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover opportunities that match your skills and career goals
          </p>
        </div>
        
        {/* Filter Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <FilterBar onSearch={fetchJobs} />
        </div>

        {/* Main Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : jobs.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Job List */}
            <div className="lg:w-1/3 space-y-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pb-4 pr-1 lg:pr-2">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white py-3 px-4 rounded-lg shadow-md mb-4">
                <h2 className="font-bold flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  <span>{jobs.length} Jobs Found</span>
                </h2>
              </div>
              
              <div className="space-y-4">
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

            {/* Job Details */}
            <div className="lg:w-2/3 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
              {selectedJobId ? (
                <JobDetailsSection key={selectedJobId} jobId={selectedJobId} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Please select a job to view details
                </div>
              )}
            </div>
          </div>
        ) : (
          <NoJobsFound />
        )}
      </div>
    </div>
  );
};

export default JobListingPage;