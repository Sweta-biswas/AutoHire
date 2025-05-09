import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const Header = ({ isAuthenticated, profilePicture }) => {
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'Job Applicant');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);

  const axiosInstance = axios.create({
    withCredentials: true,
  });

  useEffect(() => {
    const checkUserRole = async () => {
      if (isAuthenticated) {
        try {
          const response = await axiosInstance.get('http://localhost:4000/api/v1/check-auth');
          setIsEmployer(response.data.user.role === 'employer');
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      }
    };
    
    checkUserRole();
  }, [isAuthenticated]);

  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/');
  };

  const handleSignup = () => {
    navigate(userType === 'Employer' ? '/signup-employer' : '/signup-job-applicant');
  };

  const handleLogin = () => {
    navigate(userType === 'Employer' ? '/signin-employer' : '/signin-job-applicant');
  };

  const handlePostJob = () => {
    navigate('/post-your-job');
  };

  const handleViewAllJobs = () => {
    navigate('/employer-dashboard');
  };

  const handleLookForJob = () => {
    navigate('/job-listings');
  };

  const handleResume = () => {
    navigate('/resume-builder');
  };

  const toggleUserType = () => {
    const newUserType = userType === 'Job Applicant' ? 'Employer' : 'Job Applicant';
    setUserType(newUserType);
    localStorage.setItem('userType', newUserType);
  };

  const items = [
    {
      key: '1',
      danger: true,
      label: 'Logout',
      onClick: async () => {
        try {
          const response = await axiosInstance.post('http://localhost:4000/api/v1/logout');
          if (response.status === 200) {
            localStorage.setItem('userType', 'Job Applicant');
            window.location.reload();
          } else {
            console.error('Logout request was unsuccessful');
          }
        } catch (error) {
          console.error('Logout failed', error);
        }
      },
    },
  ];

  return (
    <header className="w-full backdrop-blur-sm bg-gradient-to-r from-indigo-100/90 via-purple-50/90 to-blue-100/90 p-4 shadow-sm relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Dropdown for User Type */}
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold text-[#515cb1] relative group cursor-pointer"
            onClick={navigateToHome}
          >
            AutoHire
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#515cb1] group-hover:w-full transition-all duration-300"></span>
          </h1>
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex justify-between items-center px-4 py-2 bg-white/80 hover:bg-white rounded-full text-[#515cb1] hover:text-[#3a4496] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span>{userType}</span>
                  <ChevronDown size={20} className="ml-2" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm text-gray-700 hover:bg-[#dfe7ff] hover:text-[#3a4496] transition-all duration-300 ease-in-out rounded-xl font-medium"
                      onClick={() => {
                        toggleUserType();
                        setDropdownOpen(false);
                      }}
                    >
                      {userType === 'Job Applicant' ? 'Employer' : 'Job Applicant'}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-[#515cb1] hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Buttons Based on User Type and Authentication */}
        <div className="hidden md:flex items-center space-x-4">
          {userType === 'Employer' && (
            <>
              <button
                className="bg-white/80 hover:bg-white text-[#515cb1] px-4 py-2 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handlePostJob}
              >
                Post Your Job
              </button>
              {isAuthenticated && isEmployer && (
                <button
                  className="bg-white/80 hover:bg-white text-[#515cb1] px-4 py-2 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                  onClick={handleViewAllJobs}
                >
                  View All Jobs
                </button>
              )}
            </>
          )}
          {userType === 'Job Applicant' && (
            <>
              <button
                className="bg-white/80 hover:bg-white text-[#515cb1] px-4 py-2 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleResume}
              >
                Resume
              </button>
              <button
                className="bg-white/80 hover:bg-white text-[#515cb1] px-4 py-2 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleLookForJob}
              >
                Look for Job
              </button>
            </>
          )}
          {isAuthenticated ? (
            <Dropdown menu={{ items }} placement="bottomRight">
              <Avatar
                size="large"
                src={profilePicture}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
                className="border-2 border-white shadow-md"
              />
            </Dropdown>
          ) : (
            <>
              <button
                className="bg-white/80 hover:bg-white px-5 py-2 rounded-full text-[#515cb1] hover:text-[#3a4496] shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleLogin}
              >
                Signin
              </button>
              <button
                className="bg-gradient-to-r from-[#515cb1] to-[#3a4496] px-5 py-2 rounded-full text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleSignup}
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-sm z-50 p-6">
          <div className="flex justify-between items-center mb-10">
            <h1 
              className="text-2xl font-bold text-[#515cb1] cursor-pointer"
              onClick={() => {
                navigateToHome();
                setMobileMenuOpen(false);
              }}
            >
              AutoHire
            </h1>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-[#515cb1]"
            >
              <X size={24} />
            </button>
          </div>
          
          {!isAuthenticated && (
            <div className="mb-8">
              <div className="inline-flex rounded-full overflow-hidden shadow-md">
                <button
                  onClick={() => setUserType('Job Applicant')}
                  className={`px-4 py-2 ${userType === 'Job Applicant' ? 'bg-[#515cb1] text-white' : 'bg-gray-100 text-gray-600'} transition-colors`}
                >
                  Job Applicant
                </button>
                <button
                  onClick={() => setUserType('Employer')}
                  className={`px-4 py-2 ${userType === 'Employer' ? 'bg-[#515cb1] text-white' : 'bg-gray-100 text-gray-600'} transition-colors`}
                >
                  Employer
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-4">
            {userType === 'Employer' && (
              <>
                <button
                  className="bg-white text-[#515cb1] px-4 py-3 rounded-full hover:bg-[#f0f3ff] border border-gray-200 shadow-sm transition-colors w-full"
                  onClick={handlePostJob}
                >
                  Post Your Job
                </button>
                {isAuthenticated && isEmployer && (
                  <button
                    className="bg-white text-[#515cb1] px-4 py-3 rounded-full hover:bg-[#f0f3ff] border border-gray-200 shadow-sm transition-colors w-full"
                    onClick={handleViewAllJobs}
                  >
                    View All Jobs
                  </button>
                )}
              </>
            )}
            {userType === 'Job Applicant' && (
              <>
                <button
                  className="bg-white text-[#515cb1] px-4 py-3 rounded-full hover:bg-[#f0f3ff] border border-gray-200 shadow-sm transition-colors w-full"
                  onClick={handleResume}
                >
                  Resume
                </button>
                <button
                  className="bg-white text-[#515cb1] px-4 py-3 rounded-full hover:bg-[#f0f3ff] border border-gray-200 shadow-sm transition-colors w-full"
                  onClick={handleLookForJob}
                >
                  Look for Job
                </button>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 p-4">
                <Avatar
                  size="large"
                  src={profilePicture}
                  icon={<UserOutlined />}
                  className="border-2 border-[#515cb1]"
                />
                <button
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
                  onClick={items[0].onClick}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  className="bg-white text-[#515cb1] px-4 py-3 rounded-full border border-gray-200 shadow-sm hover:bg-[#f0f3ff] transition-colors w-full"
                  onClick={handleLogin}
                >
                  Signin
                </button>
                <button
                  className="bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white px-4 py-3 rounded-full shadow-sm hover:shadow-md transition-all w-full"
                  onClick={handleSignup}
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;