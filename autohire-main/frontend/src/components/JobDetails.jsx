import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  BanknoteIcon, 
  Mail, 
  Phone, 
  Linkedin 
} from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobDetails = ({ job, jobId, alreadyApplied }) => {
  const [isApplied, setIsApplied] = useState(alreadyApplied);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Select a job to view details</p>
      </div>
    );
  }

  const handleApply = async () => {
    try {
      await axios.post(
        'http://localhost:4000/api/v1/jobapplicant/apply',
        { jobId },
        { withCredentials: true }
      );
      toast.success('Application submitted successfully!');
      setIsApplied(true); // Update state to reflect application status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="p-6 space-y-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#515cb1] text-white rounded-full w-10 h-10 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{job.role}</h1>
          </div>
          <button
            onClick={isApplied ? null : handleApply}
            disabled={isApplied} // Disable the button if applied
            className={`px-6 py-2 rounded-lg transition-colors ${
              isApplied
                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                : 'bg-[#515cb1] hover:bg-[#3a4496] text-white'
            }`}
          >
            {isApplied ? 'Already Applied' : 'Apply Now'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            <Building2 className="w-4 h-4" /> {job.company}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            <MapPin className="w-4 h-4" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            <Users className="w-4 h-4" /> {job.noOfEmployees} employees
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Description Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
          <p className="text-gray-600 leading-relaxed">{job.description}</p>
        </section>

        {/* Company Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">About the Company</h3>
          <p className="text-gray-600 leading-relaxed">{job.aboutCompany}</p>
        </section>

        {/* Requirements Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Job Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{job.experience}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BanknoteIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="font-medium">{job.salary}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full text-sm border border-gray-200 text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium">{job.employer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{job.title}</p>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href={`mailto:${job.employer.email}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Mail className="w-4 h-4" />
                {job.employer.email}
              </a>
              {job.employer.phone && (
                <a
                  href={`tel:${job.employer.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4" />
                  {job.employer.phone}
                </a>
              )}
              <a
                href={job.employer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default JobDetails;
