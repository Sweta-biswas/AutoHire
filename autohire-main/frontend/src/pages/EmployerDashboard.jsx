import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Star,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { Spin, Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deletingJob, setDeletingJob] = useState(false);
  
  const navigate = useNavigate();
  const { confirm } = Modal;

  const axiosInstance = axios.create({
    withCredentials: true,
  });

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:4000/api/v1/check-auth');
        
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setProfilePicture(response.data.user.profilePicture);
          
          // If user is not an employer, redirect to home
          if (response.data.user.role !== 'employer') {
            toast.error('Only employers can access this page');
            navigate('/');
          }
        } else {
          // If not authenticated, redirect to login
          toast.error('Please login as an employer to access this page');
          navigate('/signin-employer');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Authentication error');
        navigate('/signin-employer');
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch all jobs posted by the employer
  useEffect(() => {
    const fetchJobs = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('http://localhost:4000/api/v1/employer/jobs');
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch your job posts');
        setLoading(false);
        toast.error('Error loading your job posts');
      }
    };

    fetchJobs();
  }, [isAuthenticated]);

  // Format salary range for display
  const formatSalary = (min, max) => {
    return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  };

  // Toggle job expansion
  const toggleJobExpansion = (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
    } else {
      setExpandedJob(jobId);
      setExpandedApplicant(null);
    }
  };

  // Toggle applicant details
  const toggleApplicantDetails = (applicantId) => {
    if (expandedApplicant === applicantId) {
      setExpandedApplicant(null);
    } else {
      setExpandedApplicant(applicantId);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (job) => {
    setJobToDelete(job);
    setDeleteModalVisible(true);
  };
  
  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeletingJob(true);
      await axiosInstance.delete(`http://localhost:4000/api/v1/employer/jobs/${jobToDelete._id}`);
      
      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      toast.success('Job post deleted successfully');
      
      setDeleteModalVisible(false);
      setJobToDelete(null);
      setDeletingJob(false);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job post');
      setDeletingJob(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate match score color based on value
  const getMatchScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-serif">
      <Header isAuthenticated={isAuthenticated} profilePicture={profilePicture} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#515cb1] mb-4">Your Job Posts</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage all your job listings and view applications from potential candidates.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading your job posts..." />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-red-500 mb-4 text-xl">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#515cb1] text-white px-6 py-2 rounded-full hover:bg-[#3a4496] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <Briefcase size={64} className="mx-auto text-[#515cb1] opacity-30 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Job Posts Yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven't posted any jobs yet. Create your first job listing to start receiving applications.
            </p>
            <button 
              onClick={() => navigate('/post-your-job')}
              className="bg-gradient-to-r from-[#515cb1] to-[#3a4496] px-6 py-3 rounded-full text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Post a New Job
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div 
                key={job._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                {/* Job Header */}
                <div 
                  className="p-6 cursor-pointer" 
                  onClick={() => toggleJobExpansion(job._id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[#f0f3ff] rounded-lg">
                        <Briefcase className="text-[#515cb1] h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{job.jobRole}</h2>
                        <p className="text-gray-600">{job.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-4">
                      <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                        <Users className="text-[#515cb1] h-4 w-4 mr-1" />
                        <span className="text-[#515cb1] font-medium">{job.applicantCount} Applicants</span>
                      </div>
                      <div className="p-2 hover:bg-red-50 rounded-full cursor-pointer transition-colors group" onClick={(e) => { e.stopPropagation(); showDeleteConfirm(job); }}>
                        <Trash2 className="text-gray-400 group-hover:text-red-500 h-5 w-5" />
                      </div>
                      {expandedJob === job._id ? 
                        <ChevronUp className="text-[#515cb1] h-5 w-5" /> : 
                        <ChevronDown className="text-[#515cb1] h-5 w-5" />
                      }
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Experience: {job.experience}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {job.jobLocation === 'remote' 
                          ? 'Remote' 
                          : `${job.city}, ${job.country}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Job Details and Applicants (Expanded View) */}
                {expandedJob === job._id && (
                  <div className="border-t border-gray-100">
                    {/* Job Description */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Job Description</h3>
                      <p className="text-gray-600 whitespace-pre-line">{job.jobDescription}</p>
                      
                      {/* Skills */}
                      <div className="mt-4">
                        <h4 className="text-gray-700 font-medium mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-white px-3 py-1 rounded-full text-sm text-[#515cb1] border border-indigo-100 shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Applicants List */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="mr-2 h-5 w-5 text-[#515cb1]" />
                        Applicants ({job.applicantCount})
                      </h3>
                      
                      {job.applicants.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-gray-500">No applicants yet for this position</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {job.applicants.map((applicant) => (
                            <div 
                              key={applicant._id} 
                              className="border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                            >
                              {/* Applicant Header - Always Visible */}
                              <div 
                                className="p-4 flex flex-col md:flex-row justify-between cursor-pointer"
                                onClick={() => toggleApplicantDetails(applicant._id)}
                              >
                                <div className="flex items-center mb-2 md:mb-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white flex items-center justify-center font-bold mr-3">
                                    {applicant.fullName[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800">{applicant.fullName}</h4>
                                    <p className="text-gray-600 text-sm">{applicant.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm">
                                    <p className="text-gray-500">Applied: {formatDate(applicant.applicationDate)}</p>
                                  </div>
                                  <div className={`flex items-center ${getMatchScoreColor(applicant.matchScore)}`}>
                                    <Star className="h-4 w-4 mr-1" />
                                    <span className="font-medium">
                                      {applicant.matchScore ? `${Math.round(applicant.matchScore)}%` : 'N/A'}
                                    </span>
                                  </div>
                                  {expandedApplicant === applicant._id ? 
                                    <ChevronUp className="text-[#515cb1] h-5 w-5" /> : 
                                    <ChevronDown className="text-[#515cb1] h-5 w-5" />
                                  }
                                </div>
                              </div>
                              
                              {/* Applicant Details - Expanded View */}
                              {expandedApplicant === applicant._id && (
                                <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center text-gray-600">
                                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{applicant.phone}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{applicant.email}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="mt-4 flex space-x-2">
                                    <button 
                                      className="bg-white border border-[#515cb1] text-[#515cb1] px-4 py-2 rounded-full hover:bg-[#f0f3ff] transition-colors text-sm flex items-center"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Here you would implement a feature to view the applicant's resume
                                        toast.info('Resume view feature will be implemented soon');
                                      }}
                                    >
                                      <User className="h-4 w-4 mr-1" />
                                      View Resume
                                    </button>
                                    <button 
                                      className="bg-white border border-[#515cb1] text-[#515cb1] px-4 py-2 rounded-full hover:bg-[#f0f3ff] transition-colors text-sm flex items-center"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `mailto:${applicant.email}`;
                                      }}
                                    >
                                      <Mail className="h-4 w-4 mr-1" />
                                      Contact
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add New Job Button */}
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => navigate('/post-your-job')}
                className="bg-gradient-to-r from-[#515cb1] to-[#3a4496] px-6 py-3 rounded-full text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Post a New Job
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center text-red-500">
            <ExclamationCircleOutlined className="mr-2" />
            Confirm Deletion
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            loading={deletingJob}
            onClick={handleDeleteJob}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this job post?</p>
        {jobToDelete && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">{jobToDelete.jobRole}</p>
            <p className="text-gray-500">{jobToDelete.companyName}</p>
          </div>
        )}
        <p className="mt-4 text-red-500 text-sm">
          This action cannot be undone. All application data for this job will also be deleted.
        </p>
      </Modal>
    </div>
  );
};

export default EmployerDashboard; 