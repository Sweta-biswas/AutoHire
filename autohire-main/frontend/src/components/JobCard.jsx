import React from 'react';

const JobCard = ({ title, description, company, location, salary, selected, onSelect }) => {
  return (
    <div
      className={`p-4 border rounded-lg mb-4 cursor-pointer transition-all ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base md:text-lg">{title}</h2>
        <button className="text-blue-500">+</button>
      </div>
      <p className="text-gray-600 text-sm mt-2">
        {description.length > 50 ? `${description.substring(0, 50)}...` : description}
      </p>
      <div className="mt-3">
        <span className="text-gray-500 block text-sm">
          <strong>Company:</strong> {company}
        </span>
        <span className="text-gray-500 block text-sm">
          <strong>Location:</strong> {location}
        </span>
        <span className="text-gray-500 block text-sm">
          <strong>Salary:</strong> {salary}
        </span>
      </div>
    </div>
  );
};

export default JobCard;