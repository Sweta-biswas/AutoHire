import React, { useState } from 'react';
import IconHeaders from './IconHeaders';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';

const FilterBar = ({ onSearch }) => {
  const location = useLocation();
  const [title, setTitle] = useState(location.state?.title || '');
  const [locationValue, setLocationValue] = useState(location.state?.location || '');

  const handleSearch = () => {
    if (!title && !locationValue) {
      toast.error('Please enter a job title or location.');
      return;
    }
  
    // Proceed with search using the provided fields
    onSearch({ title, location: locationValue });
  };

  const handleReset = () => {
    setTitle('');
    setLocationValue('');
    onSearch({ title: '', location: '' });  // Reset the search results
  };

  return (
    <div className="flex items-center p-3 bg-white font-serif">
      {/* IconHeaders aligned to the left */}
      <div className="ml-[68px] -mt-2">
        <IconHeaders />
      </div>
      {/* Input fields and button in the same line */}
      <div className="flex flex-grow justify-center items-center space-x-4 ml-4">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full lg:w-1/4"
        />
        <input
          type="text"
          placeholder="Location"
          value={locationValue}
          onChange={(e) => setLocationValue(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full lg:w-1/6"
        />
        <button onClick={handleSearch} className="bg-[#515cb1] hover:bg-[#3a4496] text-white px-4 py-2 rounded-lg">
          Search
        </button>
        {/* Reset Button */}
        <button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
          Reset
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FilterBar;
