import React from 'react';
import { Form } from 'antd';
import EditableInput from './EditableInput';
import ImageUpload from './ImageUpload';
import PersonalDetailsForm from './PersonalDetailsForm';
import WorkExperienceForm from './WorkExperienceForm';
import EducationForm from './EducationForm';
import WebsiteForm from './WebsiteForm';
import SkillsForm from './SkillsForm';
import ProjectForm from './ProjectForm';
import IconHeader from './IconHeaders';

const ResumeEditor = ({
  text,
  setText,
  formData,
  handleInputChange,
  handleExperienceChange,
  handleProfessionalSummaryChange,
  handlePhotoChange,
  handleRemovePhoto,
  addNewExperience,
  removeExperience,
  previewOpen,
  previewImage,
  setPreviewOpen,
  setPreviewImage,
  fileList,
  setFileList,
  handleEducationChange,
  addNewEducation,
  removeEducation,
  handleWebsiteChange,
  addNewWebsite,
  removeWebsite,
  handleSkillChange,
  addNewSkill,
  removeSkill,
  handleProjectChange,
  addNewProject,
  removeProject,
}) => {
  
  return (
    <div className="w-1/2 p-6 bg-white overflow-y-auto max-h-screen font-serif">
      <div className="flex items-center space-x-4 -mt-5 ml-14">
       <IconHeader/>
      </div>

      {/* Title Input */}
      <div className="flex flex-col items-center justify-center mt-4">
        <EditableInput value={text} onChange={setText} placeholder="Untitled" />
      </div>

      {/* Personal Details Form */}
      <div className="space-y-4 mt-10">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-black">Profile</h2>
          </div>

          {/* Image Upload Component */}
          <div className="h-40">
            <ImageUpload
              photo={formData.personal.photo}
              onPhotoChange={handlePhotoChange}
              onPhotoRemove={handleRemovePhoto}
              previewOpen={previewOpen}
              previewImage={previewImage}
              setPreviewOpen={setPreviewOpen}
              setPreviewImage={setPreviewImage}
              fileList={fileList}
              setFileList={setFileList}
            />
          </div>

          {/* Personal Details Form */}
          <PersonalDetailsForm formData={formData} onInputChange={handleInputChange} />
        </div>
      </div>

      {/* Professional Summary Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Professional Summary</h2>
        </div>
      </div>

      {/* Professional Summary Instructions */}
      <div className="p-4 -mt-5">
        <p className="text-gray-500">
          Write 2-4 short, energetic sentences about how great you are. Mention the role 
          and what you did. What were the big achievements? Describe your motivation and 
          list your skills.
        </p>
        
        {/* Professional Summary Textarea */}
        <textarea
          className="text-black w-full h-32 mt-4 p-3 border border-gray-300 rounded-md 
                     resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent overflow-y-auto bg-white"
          value={formData.professionalSummary}
          onChange={(e) => handleProfessionalSummaryChange(e.target.value)}
          placeholder="Write your professional summary here..."
        />
      </div>

      {/* Work Experience Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Work Experience</h2>
        </div>

        {/* Work Experience Instructions */}
        <p className="text-gray-500 -mt-4">
          Add details about your past roles, companies, durations, and key accomplishments. 
          Highlight your contributions and skills used.
        </p>

        {/* Work Experience Forms */}
        <div className="space-y-4 mt-6">
          {formData.experience.map((experience, index) => (
            <WorkExperienceForm
              key={index}
              experience={experience}
              onInputChange={handleExperienceChange}
              index={index}
              onRemove={removeExperience}
            />
          ))}

          {/* Add New Experience Button */}
          <button
            className="mt-4 px-4 py-2 bg-[#515cb1] text-white rounded-md hover:bg-[#3a4496]"
            onClick={addNewExperience}
          >
            + Add Work Experience
          </button>
        </div>
      </div>

      {/* Education Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Education</h2>
        </div>

        {/* Education Instructions */}
        <p className="text-gray-500 -mt-4">
          Add details about your educational background, institutions, degrees, and key achievements.
        </p>

        {/* Education Forms */}
        <div className="space-y-4 mt-6">
          {formData.education.map((education, index) => (
            <EducationForm
              key={index}
              education={education}
              onInputChange={handleEducationChange}
              index={index}
              onRemove={removeEducation}
            />
          ))}

          {/* Add New Education Button */}
          <button
            className="mt-4 px-4 py-2 bg-[#515cb1] text-white rounded-md hover:bg-[#3a4496]"
            onClick={addNewEducation}
          >
            + Add Education
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Projects</h2>
        </div>

        {/* Projects Instructions */}
        <p className="text-gray-500 -mt-4">
          Add details about your projects, roles, durations, and key accomplishments.
        </p>

        {/* Projects Forms */}
        <div className="space-y-4 mt-6">
          {formData.projects.map((project, index) => (
            <ProjectForm
              key={index}
              project={project}
              onInputChange={handleProjectChange}
              index={index}
              onRemove={removeProject}
            />
          ))}

          {/* Add New Project Button */}
          <button
            className="mt-4 px-4 py-2 bg-[#515cb1] text-white rounded-md hover:bg-[#3a4496]"
            onClick={addNewProject}
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Websites and Social Links Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Websites and Social Links</h2>
        </div>

        {/* Websites Instructions */}
        <p className="text-gray-500 -mt-4">
          Add links to your personal websites or social media profiles.
        </p>

        {/* Websites Forms */}
        <div className="space-y-4 mt-6">
          {formData.websites.map((website, index) => (
            <WebsiteForm
              key={index}
              website={website}
              onInputChange={handleWebsiteChange}
              index={index}
              onRemove={removeWebsite}
            />
          ))}

          {/* Add New Website Button */}
          <button
            className="mt-4 px-4 py-2 bg-[#515cb1] text-white rounded-md hover:bg-[#3a4496]"
            onClick={addNewWebsite}
          >
            + Add Website/Social Link
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-4 space-y-4 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-black">Skills</h2>
        </div>

        {/* Skills Instructions */}
        <p className="text-gray-500 -mt-4">
          Add your technical and professional skills along with your proficiency level.
        </p>

        {/* Skills Forms */}
        <div className="space-y-4 mt-6">
          {formData.skills.map((skill, index) => (
            <SkillsForm
              key={index}
              skill={skill}
              onInputChange={handleSkillChange}
              index={index}
              onRemove={removeSkill}
            />
          ))}

          {/* Add New Skill Button */}
          <button
            className="mt-4 px-4 py-2 bg-[#515cb1] text-white rounded-md hover:bg-[#3a4496]"
            onClick={addNewSkill}
          >
            + Add Skill
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;