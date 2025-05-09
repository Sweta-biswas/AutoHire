import React from 'react';
import { Building2, MapPin, DollarSign, ChevronRight } from 'lucide-react';

const JobCard = ({ id, title, description, company, location, salary, skills = [], experience, selected, onSelect }) => {
  return (
    <div
      className={`p-5 bg-white rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
        selected 
          ? 'border-2 border-[#515cb1] shadow-md transform scale-[1.01]' 
          : 'border border-gray-100 hover:border-[#dfe7ff]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800 text-lg line-clamp-1">{title}</h2>
          <p className="text-[#515cb1] text-sm font-medium">{company}</p>
        </div>
        <div className={`p-1.5 rounded-full ${selected ? 'bg-[#515cb1] text-white' : 'bg-[#f0f3ff] text-[#515cb1]'}`}>
          <ChevronRight size={16} />
        </div>
      </div>

      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
        {description.length > 120 ? `${description.substring(0, 120)}...` : description}
      </p>
      
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="px-2 py-0.5 bg-[#f0f3ff] text-[#515cb1] rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
        <div className="flex items-center text-gray-500 text-xs">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs justify-end">
          <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{salary}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;