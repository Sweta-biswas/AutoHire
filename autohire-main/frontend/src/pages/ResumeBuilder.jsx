import React, { useState, useEffect } from 'react';
// import { LucideImage, Briefcase } from 'lucide-react';
// import { UserOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import ResumeEditor from '../components/ResumeEditor';
import ResumePreview from '../components/ResumePreview';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialFormData = {
  resumeTitle: 'Untitled',  // Added resumeTitle here
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    pincode: '',
    photo: null,
    nationality: '',
    skills: [],
    jobTitle: '',
  },
  professionalSummary: '',
  education: [],
  experience: [],
  skills: [],
  websites: [],
  projects: [],
};

const ResumeBuilder = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [resumeScore, setResumeScore] = useState(65);
  const [text, setText] = useState(localStorage.getItem('resumeTitle') || 'Untitled');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    localStorage.setItem('resumeTitle', formData.resumeTitle); // Save resumeTitle to localStorage
  }, [formData.resumeTitle]);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/jobapplicant/resume', { withCredentials: true });
        if (response.data.resume) {
          setFormData(response.data.resume);
        }
      } catch (error) {
        toast.error('Failed to load resume data');
        console.error('Error fetching resume data:', error);
      }
    };

    fetchResumeData();
  }, []);

  // useEffect(() => {
  //   console.log('Updated formData:', formData);
  // }, [formData]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleResumeTitleChange = (title) => {
    setFormData((prev) => ({
      ...prev,
      resumeTitle: title,
    }));
  };

  const handleExperienceChange = (section, index, updatedExperience) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? updatedExperience : exp
      ),
    }));
  };

  const handleProfessionalSummaryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      professionalSummary: value,
    }));
  };

  const handlePhotoChange = (photoUrl) => {
    handleInputChange('personal', 'photo', photoUrl);
  };

  const handleRemovePhoto = () => {
    handleInputChange('personal', 'photo', null);
    setFileList([]);
  };

  const addNewExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          role: '',
          company: '',
          startDate: '',
          endDate: '',
          city: '',
          description: '',
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (section, index, updatedEducation) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? updatedEducation : edu
      ),
    }));
  };

  const addNewEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          startDate: '',
          endDate: '',
          city: '',
          description: '',
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleWebsiteChange = (index, updatedWebsite) => {
    setFormData((prev) => ({
      ...prev,
      websites: prev.websites.map((website, i) =>
        i === index ? updatedWebsite : website
      ),
    }));
  };

  const addNewWebsite = () => {
    setFormData((prev) => ({
      ...prev,
      websites: [
        ...prev.websites,
        {
          label: '',
          link: '',
        },
      ],
    }));
  };

  const removeWebsite = (index) => {
    setFormData((prev) => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index),
    }));
  };

  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePreviewScroll = (e) => {
    const container = e.target;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight > clientHeight) {
      const calculatedPages = Math.ceil(scrollHeight / clientHeight);
      setTotalPages(calculatedPages);

      const currentScrollPosition = container.scrollTop + clientHeight;
      const currentPageNumber = Math.ceil(currentScrollPosition / clientHeight);
      setCurrentPage(currentPageNumber);
    } else {
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  const handleSkillChange = (index, updatedSkill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? updatedSkill : skill
      ),
    }));
  };

  const addNewSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: '',
          level: '',
        },
      ],
    }));
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleProjectChange = (index, updatedProject) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === index ? updatedProject : project
      ),
    }));
  };

  const addNewProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: '',
          role: '',
          startDate: '',
          endDate: '',
          city: '',
          description: '',
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };
  
  if(formData.resumeTitle===undefined)
    formData.resumeTitle = 'Untitled'
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Column - Editor */}
      <ResumeEditor
        text={formData.resumeTitle}  // Use resumeTitle from formData
        setText={(text) => handleResumeTitleChange(text)}  // Handle title change
        formData={formData}
        handleInputChange={handleInputChange}
        handleExperienceChange={handleExperienceChange}
        handleProfessionalSummaryChange={handleProfessionalSummaryChange}
        handlePhotoChange={handlePhotoChange}
        handleRemovePhoto={handleRemovePhoto}
        addNewExperience={addNewExperience}
        removeExperience={removeExperience}
        previewOpen={previewOpen}
        previewImage={previewImage}
        setPreviewOpen={setPreviewOpen}
        setPreviewImage={setPreviewImage}
        fileList={fileList}
        setFileList={setFileList}
        handleEducationChange={handleEducationChange}
        addNewEducation={addNewEducation}
        removeEducation={removeEducation}
        handleWebsiteChange={handleWebsiteChange}
        addNewWebsite={addNewWebsite}
        removeWebsite={removeWebsite}
        handleSkillChange={handleSkillChange}
        addNewSkill={addNewSkill}
        removeSkill={removeSkill}
        handleProjectChange={handleProjectChange}
        addNewProject={addNewProject}
        removeProject={removeProject}
      />

      {/* Right Column - Preview */}
      <ResumePreview 
        formData={formData}
        handlePreviewScroll={handlePreviewScroll}
        currentPage={currentPage}
        totalPages={totalPages}
        formatText={formatText}
      />
    </div>
  );
};

export default ResumeBuilder;
