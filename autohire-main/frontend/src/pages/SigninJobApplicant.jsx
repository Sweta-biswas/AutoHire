import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import IconHeader from '../components/IconHeaders';

const SigninEmployer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
  
    if (message) {
      toast.error(message);
      params.delete('message');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:4000/api/v1/jobapplicant/signin',
        { email, password },
        { withCredentials: true }  // Add this to include cookies
      );
      navigate('/', { state: { message: response.data.message } });
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  const loginWithGoogle = () => {
    window.open("http://localhost:4000/api/v1/jobapplicant/google-signin", "_self");
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

 

  return (
    <div className="min-h-screen bg-gradient-custom font-serif py-0">
      <IconHeader />
    <div className="flex items-center justify-center min-h-screen bg-gradient-custom">
      
      <div className="w-full max-w-md p-8 space-y-8 bg-transparent rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-700">Sign In</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FcGoogle className="text-2xl mr-3" />
            Continue with Google
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <span className="absolute px-2 bg-white text-gray-500 text-sm">Or Login with your email</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
            onInvalid={(e) => e.target.setCustomValidity('Please enter a valid email address (e.g., name@example.com).')}
            onInput={(e) => e.target.setCustomValidity('')}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              required
              minLength="6"
              onInvalid={(e) => e.target.setCustomValidity('Password must be at least 6 characters long.')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full px-2 py-2 text-white bg-[#515cb1] rounded-md hover:bg-[#3a4496]"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
    </div>
  );
};

export default SigninEmployer;