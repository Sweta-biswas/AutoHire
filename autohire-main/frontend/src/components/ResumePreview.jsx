import React from 'react';
import { LucideImage, Briefcase, GraduationCap } from 'lucide-react';
import { UserOutlined, ProjectOutlined } from '@ant-design/icons';
import SaveButton from './SaveButton';
import axios from 'axios';
import { ToastContainer,toast } from 'react-toastify';

const ResumePreview = ({ 
  formData, 
  handlePreviewScroll, 
  currentPage, 
  totalPages,
  formatText,
  onSave
}) => {

  // Helper function to get the width percentage based on skill level
  const getSkillLevelWidth = (level) => {
    const levelMap = {
      'novice': 20,
      'beginner': 40,
      'skillful': 60,
      'experienced': 80,
      'expert': 100
    };
    return levelMap[level.toLowerCase()] || 20;
  };
 
  // Function to handle saving the resume
  const isEmpty = (data) => {
    // Check for null or undefined
    if (data == null) return true;
  
    // Check for empty strings
    if (typeof data === 'string' && data.trim() === '') return true;
  
    // Check for arrays with no elements
    if (Array.isArray(data) && data.length === 0) return true;
  
    // Check for objects with no non-empty values, excluding "ResumeTitle"
    if (typeof data === 'object') {
      return Object.entries(data).every(([key, value]) => {
        // Exclude the ResumeTitle field from being checked
        if (key === 'resumeTitle') return true; // Ignore ResumeTitle
        return isEmpty(value); // Check if other values are empty
      });
    }
  
    // If it's not empty, return false
    return false;
  };
  
  const handleSave = async () => {
    try {
      // Validate formData using the isEmpty utility function
      const hasValues = !isEmpty(formData);
  
      if (!hasValues) {
        toast.error('Resume data is empty. Please fill out the required fields.');
        return; // Exit the function if validation fails
      }
  
      // Proceed with the API call if formData has at least one value
      const response = await axios.post(
        'http://localhost:4000/api/v1/jobapplicant/save-resume',
        { resumeData: formData }, // Wrap formData with the key 'resumeData'
        { withCredentials: true }
      );
  
      // Show success message
      toast.success(response.data.message || 'Resume saved successfully!');
      if (onSave) onSave(); // Trigger additional actions if needed
    } catch (error) {
      // Handle and display errors from the API
      toast.error(
        error.response?.data?.message || 'An error occurred while saving the resume.'
      );
      console.error('Error saving resume:', error.response?.data?.message || error.message);
    }
  };
  
  

  return (
    <div className="relative w-1/2 p-6 bg-[#656e83] sticky top-0 h-screen overflow-y-auto flex justify-center items-center">
        <SaveButton onSave={handleSave} />
        <div 
          className="bg-white w-[calc(100vh-220px)] rounded-lg shadow-sm p-8 h-[calc(100vh-84px)] overflow-auto mt-7"
          onScroll={handlePreviewScroll}
        >
        <div className="flex flex-col">
          {/* Header Section with Name and Photo */}
          <div className="flex">
            {/* Photo Section */}
            <div className="flex-shrink-0">
              {formData.personal.photo ? (
                <img
                  src={formData.personal.photo}
                  alt="Profile"
                  className="w-16 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                  <LucideImage className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Name and Job Title Section */}
            <div className="ml-6 flex-grow">
              <div className="h-28 flex flex-col">
                <h1 className="text-2xl font-bold text-black mt-2">
                  {formData.personal.firstName || ' '} {formData.personal.lastName || ' '}
                </h1>
                <h2 className="text-sm text-black">
                  {formData.personal.jobTitle || ' '}
                </h2>
              </div>
            </div>
          </div>

          {/* Main Content Area with Two Columns */}
          <div className="flex gap-6 -mt-3">
            {/* Left Column - Main Content */}
            <div className="flex-1">
              {/* Professional Summary Section */}
              {formData.professionalSummary && (
                <div className="w-full mb-6">
                  <strong className="text-sm text-black font-bold">
                    <UserOutlined /> Profile
                  </strong>
                  <p className="text-black mt-2 whitespace-pre-line text-sm pl-4">
                    {formatText(formData.professionalSummary)}
                  </p>
                </div>
              )}

              {/* Work Experience Preview */}
              {formData.experience.length > 0 && (
                <div className="mb-6">
                  <strong className="text-sm text-black font-bold flex items-center">
                    <Briefcase className="mr-1 text-sm" size={16} /> Work Experience
                  </strong>
                  <div className="space-y-4 mt-2">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="pb-4 pl-4 ml-1">
                        <h3 className="text-black text-sm">
                          {exp.role}
                          {exp.company && (
                            <span>
                              {' '}at {exp.company}
                              {exp.city && `, ${exp.city}`}
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {exp.startDate}
                          {exp.endDate && ` - ${exp.endDate}`}
                        </p>
                        <p className="mt-2 text-black text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Preview */}
              {formData.education.length > 0 && (
                <div className="mb-6">
                  <strong className="text-sm text-black font-bold flex items-center">
                    <GraduationCap className="mr-1 text-sm" size={16} /> Education
                  </strong>
                  <div className="space-y-4 mt-2">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="pb-4 pl-4 ml-1">
                        <h3 className="text-black text-sm">
                          {edu.degree}
                          {edu.school && (
                            <span>
                              {' '}at {edu.school}
                              {edu.city && `, ${edu.city}`}
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {edu.startDate}
                          {edu.endDate && ` - ${edu.endDate}`}
                        </p>
                        <p className="mt-2 text-black text-sm">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

             
                {/* Projects Preview */}
                {formData.projects.length > 0 && (
                <div className="mb-6">
                    <strong className="text-sm text-black font-bold flex items-center">
                    <ProjectOutlined className="mr-1 text-sm" size={16} /> Projects
                    </strong>
                    <div className="space-y-4 mt-2">
                    {formData.projects.map((project, index) => (
                        <div key={index} className="pb-4 pl-4 ml-1">
                        <h3 className="text-black text-sm">
                            {project.title}
                            {project.role && (
                            <span>
                                {' '}as {project.role}
                                {project.city && `, ${project.city}`}
                            </span>
                            )}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {project.startDate}
                            {project.endDate && ` - ${project.endDate}`}
                        </p>
                        <p className="mt-2 text-black text-sm">{project.description}</p>
                        {project.projectLink && (
                            <a
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 no-underline text-sm mt-1 block"
                            >
                            Link
                            </a>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                )}


            </div>

            {/* Right Column - Details */}
            <div className="w-48 flex-shrink-0 overflow-auto">
              {(formData.personal.email ||
                formData.personal.phone ||
                formData.personal.country ||
                formData.personal.city ||
                formData.personal.address ||
                formData.personal.pincode) && (
                <strong className="text-sm text-black font-bold mb-2 block">Details</strong>
              )}

              {formData.personal.email && (
                <a href={`mailto:${formData.personal.email}`} className="text-blue-600 no-underline text-sm block break-words">
                  {formData.personal.email}
                </a>
              )}

              {formData.personal.phone && (
                <p className="text-black mt-1 text-sm break-words">{formData.personal.phone}</p>
              )}

              {formData.personal.address && (
                <p className="text-black mt-1 text-sm break-words">{formData.personal.address}</p>
              )}

              {(formData.personal.city || formData.personal.pincode) && (
                <p className="text-black mt-1 text-sm break-words">
                  {formData.personal.city && formData.personal.city}
                  {formData.personal.pincode && `, ${formData.personal.pincode}`}
                </p>
              )}

              {formData.personal.country && (
                <p className="text-black mt-1 text-sm break-words">{formData.personal.country}</p>
              )}

              {formData.personal.nationality && (
                <div className="text-gray-400 mt-2 text-sm break-words">
                  <strong>Nationality </strong>
                  <div className="text-black text-sm">{formData.personal.nationality}</div>
                </div>
              )}

              {/* Links Section */}
              {formData.websites.length > 0 && (
                <div className="mt-4">
                  <strong className="text-sm text-black font-bold mb-2 block">Links</strong>
                  {formData.websites.map((website, index) => (
                    <a
                      key={index}
                      href={website.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 no-underline text-sm block break-words"
                    >
                      {website.label || website.link}
                    </a>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              {formData.skills.length > 0 && (
                <div className="mt-4">
                  <strong className="text-sm text-black font-bold mb-2 block">Skills</strong>
                  <div className="space-y-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="text-sm">
                        <div className="text-black">{skill.name}</div>
                        <div className="h-1 bg-gray-200 rounded-full mt-1 w-[60%]">
                          <div
                            className="h-1 bg-blue-500 rounded-full"
                            style={{
                              width: `${getSkillLevelWidth(skill.level)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pagination indicator */}
      {totalPages > 1 && (
        <div className="absolute bottom-8 right-8 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
          {currentPage}/{totalPages}
        </div>
      )}
       <ToastContainer />
    </div>
  );
};

export default ResumePreview;