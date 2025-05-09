import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { TypewriterEffectDemo } from '../components/Lines';
import JobSearch from '../components/JobSearch';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Briefcase, Users, FileText, CheckCircle} from 'lucide-react';

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

  // Features array for the features section
  const features = [
    {
      icon: <Briefcase size={48} className="text-[#515cb1]" />,
      title: 'Diverse Job Listings',
      description: 'Access a wide range of job opportunities across various industries and roles, tailored to your skills.',
    },
    {
      icon: <FileText size={48} className="text-[#515cb1]" />,
      title: 'Easy Resume Builder',
      description: 'Create a professional resume in minutes with our intuitive and easy-to-use resume builder.',
    },
    {
      icon: <Users size={48} className="text-[#515cb1]" />,
      title: 'Connect with Employers',
      description: 'Directly connect with top employers and get noticed for your unique talents and experience.',
    },
    {
      icon: <CheckCircle size={48} className="text-[#515cb1]" />,
      title: 'Efficient Hiring',
      description: 'For employers, find the perfect candidates quickly with our advanced search and filtering tools.',
    },
  ];

  // Steps for the how it works section
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and build your professional profile to showcase your skills and experience.',
      userType: 'Job Seekers',
    },
    {
      number: '02',
      title: 'Build Your Resume',
      description: 'Use our intuitive resume builder to create a standout resume that gets noticed.',
      userType: 'Job Seekers',
    },
    {
      number: '03',
      title: 'Apply for Jobs',
      description: 'Browse through our extensive job listings and apply with just a few clicks.',
      userType: 'Job Seekers',
    },
    {
      number: '01',
      title: 'Create Company Profile',
      description: 'Sign up as an employer and create your company profile to attract top talent.',
      userType: 'Employers',
    },
    {
      number: '02',
      title: 'Post Job Openings',
      description: 'Post detailed job listings with all the requirements and benefits.',
      userType: 'Employers',
    },
    {
      number: '03',
      title: 'Find Perfect Candidates',
      description: 'Review applications and find the perfect candidates for your positions.',
      userType: 'Employers',
    },
  ];

  // Testimonials array
  const testimonials = [
    {
      quote: "AutoHire helped me find my dream job in just two weeks! The platform is intuitive and the job matching is spot on.",
      name: "Sarah Johnson",
      position: "Software Engineer",
      company: "Tech Innovations Inc.",
    },
    {
      quote: "As a hiring manager, I've found exceptional talent through AutoHire. The quality of candidates and the platform's ease of use has streamlined our hiring process.",
      name: "Michael Chen",
      position: "HR Director",
      company: "Global Solutions",
    },
    {
      quote: "The resume builder tool is exceptional! It helped me create a professional resume that stood out to employers.",
      name: "Emily Rodriguez",
      position: "Marketing Specialist",
      company: "Creative Media",
    },
  ];

  // Statistics array
  const stats = [
    { value: '5M+', label: 'Job Seekers' },
    { value: '100K+', label: 'Employers' },
    { value: '500K+', label: 'Jobs Posted' },
    { value: '2M+', label: 'Successful Hires' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-serif text-[#515cb1]">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Header isAuthenticated={isAuthenticated} profilePicture={profilePicture} />

      {/* Hero Section with Background Shape */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-indigo-500 filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-blue-500 filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500 filter blur-3xl opacity-10"></div>
        </div>
        <main className="container relative z-10 flex-grow mx-auto pt-24 pb-32 lg:pt-40 px-4">
          <section className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center mb-12">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <TypewriterEffectDemo/>
              </div>
              <p className="text-xl md:text-2xl text-gray-700 mt-6 font-light tracking-wide">
                Find Your Perfect Job or Hire the Best Talent - All in One Place
              </p>
            </div>
          </section>
          
          {/* Job Search - Repositioned inside hero section */}
          <div className="mt-40 transform hover:scale-105 transition-transform duration-300 max-w-4xl mx-auto">
            <JobSearch />
          </div>
        </main>
      </div>

      {/* Features Section - Updated */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#515cb1] relative inline-block">
              Why Choose AutoHire?
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#515cb1] rounded-full"></div>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mt-8 max-w-2xl mx-auto">
              We provide a seamless and efficient platform for both job seekers and employers to achieve their goals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out flex flex-col items-center text-center transform hover:-translate-y-2 group"
              >
                <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-[#dfe7ff] to-[#c4cbf2] group-hover:from-[#c4cbf2] group-hover:to-[#515cb1] transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - Updated */}
      <section className="relative py-20 bg-gradient-to-r from-[#3a4496] via-[#515cb1] to-[#6870c0] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 backdrop-blur-sm bg-white/10 rounded-xl transform transition-transform hover:scale-105">
                <div className="text-4xl md:text-6xl font-bold mb-3">{stat.value}</div>
                <div className="text-sm md:text-base opacity-90 font-light tracking-wider uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Updated */}
      <section className="py-24 bg-gradient-to-br from-white to-slate-50 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#dfe7ff] opacity-20 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[#dfe7ff] opacity-20 rounded-tr-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#515cb1] relative inline-block">
              How It Works
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#515cb1] rounded-full"></div>
            </h2>
            <p className="text-lg text-gray-600 mt-8 max-w-2xl mx-auto">
              Our platform is designed to make the job search and hiring process simple and efficient
            </p>
          </div>

          <div className="mb-20">
            <div className="flex items-center justify-center mb-12">
              <h3 className="text-2xl font-semibold text-center px-8 py-3 text-white bg-[#515cb1] rounded-full shadow-lg">For Job Seekers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.filter(step => step.userType === 'Job Seekers').map((step, index) => (
                <div key={index} className="relative p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-[#515cb1] transform hover:-translate-y-2">
                  <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-[#515cb1] to-[#3a4496] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <h4 className="text-xl font-semibold mb-3 pt-6 text-gray-800">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center mb-12">
              <h3 className="text-2xl font-semibold text-center px-8 py-3 text-white bg-[#515cb1] rounded-full shadow-lg">For Employers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.filter(step => step.userType === 'Employers').map((step, index) => (
                <div key={index} className="relative p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-[#515cb1] transform hover:-translate-y-2">
                  <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-[#515cb1] to-[#3a4496] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <h4 className="text-xl font-semibold mb-3 pt-6 text-gray-800">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Updated */}
      <section className="py-24 bg-gradient-to-br from-[#f8faff] to-[#eef2ff] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/light-paper-fibers.png')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#515cb1] relative inline-block">
              What Our Users Say
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#515cb1] rounded-full"></div>
            </h2>
            <p className="text-lg text-gray-600 mt-8 max-w-2xl mx-auto">
              Don't just take our word for it - hear from the people who have found success with AutoHire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-[#515cb1]">
                <div className="mb-6 text-[#515cb1]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 mb-8 italic text-lg leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#515cb1] to-[#3a4496] text-white flex items-center justify-center text-xl font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section - Updated */}
      <section className="py-20 bg-gradient-to-r from-[#3a4496] via-[#515cb1] to-[#6870c0] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white opacity-5 rounded-tr-full"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90 font-light">
            Whether you're looking for your dream job or searching for the perfect candidate, AutoHire is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/signup-job-applicant')}
              className="px-8 py-4 bg-white text-[#515cb1] font-semibold rounded-full hover:bg-slate-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Join as Job Seeker
            </button>
            <button 
              onClick={() => navigate('/signup-employer')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Join as Employer
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section - Updated */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-thread-light.png')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-[#515cb1] mb-6">AutoHire</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Connecting talent with opportunity, seamlessly. Our platform helps job seekers find their dream careers and employers discover perfect candidates.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-[#515cb1] hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-[#515cb1] hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-[#515cb1] hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">For Job Seekers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Browse Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Resume Builder</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Career Advice</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Saved Jobs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">For Employers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Post a Job</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Browse Candidates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Hiring Solutions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} AutoHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPortalLandingPage;