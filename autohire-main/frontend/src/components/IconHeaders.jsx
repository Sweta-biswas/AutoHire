import React from 'react';
import { useNavigate } from 'react-router-dom';

const IconHeader = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <header className="w-full bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-[#515cb1] cursor-pointer"
          onClick={handleClick}
        >
          AutoHire
        </h1>
      </div>
    </header>
  );
};

export default IconHeader;