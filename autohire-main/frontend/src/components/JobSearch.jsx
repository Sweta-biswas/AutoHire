import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobSearch = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    // Check if both title and location are empty
    if (!title && !location) {
      // Trigger a toast if both fields are empty
      toast.error('Please enter at least a job title or location to search.');
      return;
    }

    // Navigate to job listings page with search parameters if at least one field is filled
    navigate('/job-listings', { 
      state: { title, location }
    });
  };

  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto bg-white rounded-full shadow-lg">
      <div className="flex items-center flex-1 px-4 py-4">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Job title or keyword"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full outline-none text-gray-700"
        />
      </div>
      <div className="w-px h-8 bg-gray-200" />
      <div className="flex items-center flex-1 px-4 py-2">
        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="City, state or zip"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full outline-none text-gray-700"
        />
      </div>
      <button 
        onClick={handleSearch}
        className="px-4 py-3 text-white font-semibold rounded-full bg-[#515cb1] hover:bg-[#3a4496] transition-colors duration-300"
      >
        Find Jobs
      </button>
    </div>
  );
};

export default JobSearch;
