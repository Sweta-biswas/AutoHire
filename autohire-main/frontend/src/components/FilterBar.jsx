import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FilterBar = ({ onSearch }) => {
  const [title, setTitle] = useState('');
  const [locationValue, setLocationValue] = useState('');

  // Function to handle search
  const handleSearch = () => {
    // Check if both title and location are empty
    if (!title && !locationValue) {
      // Trigger a toast if both fields are empty
      toast.error('Please enter at least a job title or location to search.');
      return;
    }

    onSearch({ title, location: locationValue });
  };

  // Function to handle reset
  const handleReset = () => {
    setTitle('');
    setLocationValue('');
    onSearch({});
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Job Title Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#515cb1] focus:border-[#515cb1] focus:bg-white transition-colors"
          />
          {title && (
            <button 
              onClick={() => setTitle('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Location Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="City, state, or 'Remote'"
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#515cb1] focus:border-[#515cb1] focus:bg-white transition-colors"
          />
          {locationValue && (
            <button 
              onClick={() => setLocationValue('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleSearch} 
            className="px-5 py-3 bg-gradient-to-r from-[#515cb1] to-[#3a4496] text-white rounded-lg hover:shadow-md transition-all duration-300 whitespace-nowrap flex-shrink-0 font-medium"
          >
            Search Jobs
          </button>
          <button 
            onClick={handleReset} 
            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Reset
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default FilterBar;
