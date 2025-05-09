import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  BanknoteIcon, 
  Mail, 
  Phone, 
  Linkedin,
  Clock,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobDetails = ({ job, jobId, alreadyApplied }) => {
  const [isApplied, setIsApplied] = useState(alreadyApplied);
  const [isApplying, setIsApplying] = useState(false);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Select a job to view details</p>
      </div>
    );
  }

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await axios.post(
        'http://localhost:4000/api/v1/jobapplicant/apply',
        { jobId },
        { withCredentials: true }
      );
      toast.success('Application submitted successfully!');
      setIsApplied(true); // Update state to reflect application status
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please sign in to apply for this job');
      } else {
        toast.error(error.response?.data?.message || 'Error submitting application');
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white rounded-md w-10 h-10 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{job.role}</h1>
            </div>
            <p className="text-[#515cb1] font-medium">{job.company}</p>
          </div>
          <button
            onClick={isApplied ? null : handleApply}
            disabled={isApplied || isApplying}
            className={`px-6 py-2.5 rounded-lg transition-all ${
              isApplied
                ? 'bg-green-100 text-green-700 flex items-center gap-2'
                : isApplying
                ? 'bg-indigo-100 text-[#515cb1] cursor-wait'
                : 'bg-gradient-to-r from-[#515cb1] to-[#3a4496] hover:shadow-md text-white transform hover:-translate-y-0.5'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-1" />
                Applied Successfully
              </>
            ) : isApplying ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-[#515cb1] border-t-transparent rounded-full mr-2"></span>
                Applying...
              </>
            ) : (
              'Apply Now'
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-indigo-50 text-[#515cb1]">
            <Building2 className="w-3.5 h-3.5" /> {job.company}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-700">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </span>
          {job.noOfEmployees && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-purple-50 text-purple-700">
              <Users className="w-3.5 h-3.5" /> {job.noOfEmployees}
            </span>
          )}
          {job.experience && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700">
              <Clock className="w-3.5 h-3.5" /> {job.experience}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Description Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-[#515cb1]" />
            Job Description
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </section>

        {/* Company Section - Only show if we have company description */}
        {job.aboutCompany && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-[#515cb1]" />
              About the Company
            </h3>
            <p className="text-gray-600 leading-relaxed">{job.aboutCompany}</p>
          </section>
        )}

        {/* Requirements Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-[#515cb1]" />
            Job Requirements
          </h3>
          
          <div className="bg-gray-50/70 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-800">{job.experience || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-md text-green-600">
                  <BanknoteIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium text-gray-800">{job.salary}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3 font-medium">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 rounded-full text-sm bg-[#f0f3ff] text-[#515cb1] border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No specific skills listed</span>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-[#515cb1]" />
            Contact Information
          </h3>
          <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium text-gray-800">{job.employer.name}</p>
                </div>
                {job.employer.position && (
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-gray-800">{job.employer.position}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <a
                  href={`mailto:${job.employer.email}`}
                  className="flex items-center gap-2 text-[#515cb1] hover:text-[#3a4496] transition-colors group"
                >
                  <div className="p-1.5 bg-white rounded-full border border-[#dfe7ff] group-hover:border-[#515cb1] transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{job.employer.email}</span>
                </a>
                {job.employer.phone && (
                  <a
                    href={`tel:${job.employer.phone}`}
                    className="flex items-center gap-2 text-[#515cb1] hover:text-[#3a4496] transition-colors group"
                  >
                    <div className="p-1.5 bg-white rounded-full border border-[#dfe7ff] group-hover:border-[#515cb1] transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{job.employer.phone}</span>
                  </a>
                )}
                {job.employer.linkedin && (
                  <a
                    href={job.employer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#515cb1] hover:text-[#3a4496] transition-colors group"
                  >
                    <div className="p-1.5 bg-white rounded-full border border-[#dfe7ff] group-hover:border-[#515cb1] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <span className="font-medium">LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Apply button at the bottom for easy access */}
      {!isApplied && (
        <div className="sticky bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 flex justify-center shadow-md">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className={`w-full max-w-md py-3 rounded-lg transition-all ${
              isApplying
                ? 'bg-indigo-100 text-[#515cb1] cursor-wait'
                : 'bg-gradient-to-r from-[#515cb1] to-[#3a4496] hover:shadow-md text-white'
            } font-medium flex items-center justify-center`}
          >
            {isApplying ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-[#515cb1] border-t-transparent rounded-full mr-2"></span>
                Applying...
              </>
            ) : (
              'Apply for this Position'
            )}
          </button>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default JobDetails;
