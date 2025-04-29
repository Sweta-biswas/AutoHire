import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconHeader from '../components/IconHeaders';

const SignupEmployer = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/v1/employer/signup', {
        ...formData,
        signUpMethod: 'manual',
      });

      // Redirect to the root URL after successful signup
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
    window.open("http://localhost:4000/api/v1/employer/google-signup", "_self");
  };

  return (
    <div className="min-h-screen bg-gradient-custom font-serif py-0">
      <IconHeader />
    <div className="flex items-center justify-center min-h-screen bg-gradient-custom">
          
      <div className="w-full max-w-md p-8 space-y-8 bg-transparent rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-700">Sign Up</h2>
        </div>

        {/* Google Sign Up Button */}
        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FcGoogle className="text-2xl mr-3" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <span className="absolute px-2 bg-white text-gray-500 text-sm">Or Signup with your email</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Email Sign-up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            onInvalid={(e) => e.target.setCustomValidity('Full Name must be at least 3 characters long.')}
            onInput={(e) => {
              if (e.target.value.length < 3) {
                e.target.setCustomValidity('Full Name must be at least 3 characters long.');
              } else {
                e.target.setCustomValidity('');
              }
            }}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            minLength={3}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onInvalid={(e) => e.target.setCustomValidity('Please enter a valid email address (e.g., name@example.com).')}
            onInput={(e) => e.target.setCustomValidity('')}
            className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              required
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
            {loading ? 'Signing up...' : 'Submit'}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
    </div>
  );
};

export default SignupEmployer;