import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Ensure this import is present
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const Header = ({ isAuthenticated, profilePicture }) => {
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'Job Applicant');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const axiosInstance = axios.create({
    withCredentials: true,
  });

  const navigate = useNavigate(); // useNavigate hook to navigate between routes

  const handleSignup = () => {
    navigate(userType === 'Employer' ? '/signup-employer' : '/signup-job-applicant');
  };

  const handleLogin = () => {
    navigate(userType === 'Employer' ? '/signin-employer' : '/signin-job-applicant');
  };

  const handlePostJob = () => {
    navigate('/post-your-job');
  };

  const handleLookForJob = () => {
    navigate('/job-listings'); // Navigate to job listings page
  };

  const handleResume = () => {
    navigate('/resume-builder'); // Navigate to resume builder page
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
    <header className="w-full bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Dropdown for User Type */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-[#515cb1]">AutoHire</h1>
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex justify-between items-center px-4 py-2 bg-white rounded-md text-[#515cb1] hover:text-blue-950 transition-colors"
                >
                  <span>{userType}</span>
                  <ChevronDown size={20} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
                    <a
                      href="#"
                      className="block px-6 py-3 text-sm text-gray-700 hover:bg-[#dfe7ff] hover:text-gray-900 transition-all duration-300 ease-in-out rounded-xl"
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
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Buttons Based on User Type and Authentication */}
        <div className="hidden md:flex items-center space-x-4">
          {userType === 'Employer' && (
            <button
              className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors"
              onClick={handlePostJob}
            >
              Post Your Job
            </button>
          )}
          {userType === 'Job Applicant' && (
            <>
              <button
                className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors"
                onClick={handleResume} // Trigger resume builder navigation
              >
                Resume
              </button>
              <button
                className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors"
                onClick={handleLookForJob}
              >
                Look for Job
              </button>
            </>
          )}
          {isAuthenticated ? (
            <Dropdown menu={{ items }}>
              <Avatar
                size="large"
                src={profilePicture}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          ) : (
            <>
              <button
                className="bg-white px-4 py-2 rounded-xl text-[#515cb1] hover:bg-[#3a4496] hover:text-white transition-colors"
                onClick={handleLogin}
              >
                Signin
              </button>
              <button
                className="bg-[#515cb1] px-4 py-2 rounded-xl text-white hover:bg-white hover:text-[#3a4496] transition-colors"
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
        <div className="md:hidden fixed inset-0 bg-white z-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#515cb1]">AutoHire</h1>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            {userType === 'Employer' && (
              <button
                className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors w-full"
                onClick={handlePostJob}
              >
                Post Your Job
              </button>
            )}
            {userType === 'Job Applicant' && (
              <>
                <button
                  className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors w-full"
                  onClick={handleResume} // Trigger resume builder navigation
                >
                  Resume
                </button>
                <button
                  className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors w-full"
                  onClick={handleLookForJob}
                >
                  Look for Job
                </button>
              </>
            )}
            {isAuthenticated ? (
              <Avatar
                size="large"
                src={profilePicture}
                icon={<UserOutlined />}
                className="bg-[#515cb1]"
              />
            ) : (
              <>
                <button
                  className="bg-white text-[#515cb1] px-4 py-2 rounded-md hover:text-[#3a4496] transition-colors w-full"
                  onClick={handleLogin}
                >
                  Signin
                </button>
                <button
                  className="bg-[#515cb1] text-white px-4 py-2 rounded-md hover:bg-white hover:text-[#3a4496] transition-colors w-full"
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
