import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import IconHeader from '../components/IconHeaders';
import postJobImage from '../assets/postjob.jpeg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SkillBox from '../components/skillbox';
import axios from 'axios';

export default function JobDetailsForm() {
  const [jobLocation, setJobLocation] = useState('onsite');
  const [formData, setFormData] = useState({
    jobRole: '',
    jobDescription: '',
    experience: '',
    country: '',
    city: '',
    skills: [],
    minSalary: '',
    maxSalary: ''
  });
  const [errors, setErrors] = useState({});

  const location = useLocation();
  const companyData = location.state?.companyData || {};

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'jobRole':
        if (value.length < 5) error = 'Job Role must be at least 5 characters.';
        break;
      case 'jobDescription':
        if (value.length < 100) error = 'Job Description must be at least 100 characters.';
        break;
      case 'experience':
        if (!value) error = 'Please select the years of experience.';
        break;
      case 'country':
        if (jobLocation === 'onsite' && value.length < 5) error = 'Country must be at least 5 characters.';
        break;
      case 'city':
        if (jobLocation === 'onsite' && value.length < 3) error = 'City must be at least 3 characters.';
        break;
      case 'minSalary':
      case 'maxSalary':
        if (!/^\d+$/.test(value)) error = 'Salary must contain only digits.';
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSkillsChange = (value) => {
    setFormData({ ...formData, skills: value });
  };

  const validateForm = () => {
    const validationErrors = {};

    if (formData.jobRole.length < 5) validationErrors.jobRole = 'Job Role must be at least 5 characters.';
    if (formData.jobDescription.length < 100) validationErrors.jobDescription = 'Job Description must be at least 100 characters.';
    if (!formData.experience) validationErrors.experience = 'Please select the years of experience.';
    if (jobLocation === 'onsite' && formData.country.length < 5) validationErrors.country = 'Country must be at least 5 characters.';
    if (!/^\d+$/.test(formData.minSalary)) validationErrors.minSalary = 'Salary must contain only digits.';
    if (!/^\d+$/.test(formData.maxSalary)) validationErrors.maxSalary = 'Salary must contain only digits.';

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        const combinedData = {
          ...companyData,
          ...formData,
          jobLocation,
          experience: formData.experience ? `${formData.experience} years` : ""
        };
  
        console.log(combinedData);
  
        const response = await axios.post(
          'http://localhost:4000/api/v1/employer/jobpost',
          combinedData,
          { withCredentials: true }
        );
        console.log(response.status)
        if (response.status === 200) {
          toast.success('Job posted successfully!');
          setFormData({
            jobRole: '',
            jobDescription: '',
            experience: '',
            country: '',
            city: '',
            skills: [],
            minSalary: '',
            maxSalary: ''
          });
          setErrors({});
        } else {
          toast.error('Failed to post the job. Please try again.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while posting the job.');
      }
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-custom font-serif py-8">
      <IconHeader />
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#515cb1]">Complete Job Details</h1>
              <p className="text-lg text-gray-700">Provide job-specific information to continue.</p>
            </div>
            <div className="w-64">
              <img src={postJobImage} alt="Illustration of people working" className="w-full h-auto" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Job Role <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter job role"
              />
              {errors.jobRole && <p className="text-red-500 text-sm">{errors.jobRole}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Job Description <span className="text-red-500">*</span></label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter job description"
                rows="4"
              />
              {errors.jobDescription && <p className="text-red-500 text-sm">{errors.jobDescription}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Years of Experience <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an option</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-4">2-4 years</option>
                  <option value="5-7">5-7 years</option>
                  <option value="8+">8+ years</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Job Location <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="onsite"
                    checked={jobLocation === 'onsite'}
                    onChange={() => setJobLocation('onsite')}
                    className="form-radio"
                  />
                  <span className="ml-2">Onsite</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="remote"
                    checked={jobLocation === 'remote'}
                    onChange={() => setJobLocation('remote')}
                    className="form-radio"
                  />
                  <span className="ml-2">Remote</span>
                </label>
              </div>

              {jobLocation === 'onsite' && (
                <div className="space-y-1 mt-4">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Country"
                  />
                  {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter City"
                  />
                  {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Skills Required</label>
              <SkillBox 
                onSkillsChange={handleSkillsChange} 
                value={formData.skills} 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Min Salary <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="minSalary"
                  value={formData.minSalary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter min salary"
                />
                {errors.minSalary && <p className="text-red-500 text-sm">{errors.minSalary}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Max Salary <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="maxSalary"
                  value={formData.maxSalary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter max salary"
                />
                {errors.maxSalary && <p className="text-red-500 text-sm">{errors.maxSalary}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#515cb1] text-white font-semibold rounded-lg hover:bg-[#3744c7] transition duration-200"
            >
              Submit
            </button>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}