import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { TypewriterEffectDemo } from '../components/Lines';
import JobSearch from '../components/JobSearch';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const JobPortalLandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMessage = params.get('message');
    const stateMessage = location.state?.message;

    if (urlMessage) {
      console.log(urlMessage)
      toast.success(urlMessage);
      params.delete('message');
      navigate({ search: params.toString() }, { replace: true });
    } else if (stateMessage) {
      toast.success(stateMessage);
      navigate({ state: {} }, { replace: true });
    }

    setIsVisible(true);
    checkAuthStatus();
  }, [location.search, location.state, navigate]);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/check-auth', {
        withCredentials: true,
      });
      console.log(response.data)
      setIsAuthenticated(response.data.authenticated);
      setProfilePicture(response.data.user.profilePicture);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-custom font-serif text-[#515cb1]">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Header isAuthenticated={isAuthenticated} profilePicture={profilePicture} />


      <main className="container flex-grow mx-auto mt-20 lg:mt-40 px-4">
        <section className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            <TypewriterEffectDemo/>
             
            </div>
            <p className="text-xl md:text-2xl text-black mt-6">
              Find Your Perfect Job or Hire the Best Talent - All in One Place
            </p>
          </div>
        </section>
      </main>
      <div className="mt-20">
        <JobSearch />
      </div>
      <div className="mt-20">
     
      </div>
    </div>
  );
};

export default JobPortalLandingPage;