import React, { useState } from 'react';
import { Cloudy } from 'lucide-react';

const SaveButton = ({ onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      className="fixed top-2 bg-[#515cb1] hover:bg-[#3a4496] text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-2 z-10"
      disabled={isSaving}
    >
      <Cloudy size={20} />
      <span>{isSaving ? 'Saving...' : 'Save'}</span>
    </button>
  );
};

export default SaveButton;

