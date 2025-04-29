import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import IconHeader from '../components/IconHeaders';
import postJobImage from '../assets/postjob.jpeg';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployerSignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    fullName: '',
    position: '',
    linkedInProfile: '',
    email: '',
    phoneNumber: '',
    employeeNumber: '',
    countryCode: '+91',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validation for each field
    switch (name) {
      case 'companyName':
        setErrors({ ...errors, companyName: value.length >= 5 ? '' : 'Company name must be at least 5 characters.' });
        break;
      case 'companyDescription':
        setErrors({ ...errors, companyDescription: value.length >= 100 ? '' : 'Description must be at least 100 characters.' });
        break;
      case 'fullName':
        setErrors({ ...errors, fullName: value.length >= 3 ? '' : 'Full name must be at least 3 characters.' });
        break;
      case 'position':
        setErrors({ ...errors, position: value.length >= 2 ? '' : 'Position must be at least 2 characters.' });
        break;
      case 'linkedInProfile':
        setErrors({ ...errors, linkedInProfile: /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(value) ? '' : 'Please enter a valid LinkedIn profile URL.' });
        break;
      case 'email':
        setErrors({ ...errors, email: /^\S+@\S+\.\S+$/.test(value) ? '' : 'Please enter a valid email address.' });
        break;
      case 'phoneNumber':
        setErrors({ ...errors, phoneNumber: /^[0-9]+$/.test(value) ? '' : 'Phone number should contain only digits.' });
        break;
      default:
        break;
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const { companyName, companyDescription, fullName, position, linkedInProfile, email, phoneNumber } = formData;

    if (Object.values(errors).some(error => error) || !companyName || !companyDescription || !fullName || !position || !linkedInProfile || !email || !phoneNumber) {
      toast.error("Please fill out all required fields correctly.");
    } else {
      navigate('/job-details', { state: { companyData: formData } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-custom font-serif py-8">
        <div className="-mt-7">
      <IconHeader />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#515cb1]">Complete Your Company Profile</h1>
              <p className="text-lg text-gray-700">Complete your company profile to create an account and improve your visibility to candidates.</p>
            </div>
            <div className="w-64">
              <img src={postJobImage} alt="Illustration of people working" className="w-full h-auto" />
            </div>
          </div>

          {/* Form Section */}
          <form className="space-y-6">
            {/* Company Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Your company's name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter company name"
              />
              {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
            </div>

            {/* Company Description */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Your company's description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter company description"
                rows="4"
              />
              {errors.companyDescription && <p className="text-red-500 text-sm">{errors.companyDescription}</p>}
            </div>

            {/* Number of Employees */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Your company's number of employees
              </label>
              <div className="relative">
                <select
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an option</option>
                  <option value="1-49">1-49</option>
                  <option value="50-199">50-199</option>
                  <option value="200-499">200-499</option>
                  <option value="500+">500+</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Your full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            {/* Your Position */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Your position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your position"
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            {/* LinkedIn Profile */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn Profile <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="linkedInProfile"
                value={formData.linkedInProfile}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter LinkedIn profile URL"
              />
              {errors.linkedInProfile && <p className="text-red-500 text-sm">{errors.linkedInProfile}</p>}
            </div>

            {/* Gmail */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Company's Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Company's email"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="px-2 py-3 border rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  {/* Add other country codes */}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                onClick={handleContinue}
                className="px-6 py-2 bg-[#515cb1] hover:bg-[#3a4496] text-white font-medium rounded-lg transition-colors"
              >
                Continue →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}