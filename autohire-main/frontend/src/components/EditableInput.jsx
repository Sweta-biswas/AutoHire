import React, { useState, useRef, useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const EditableInput = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "Untitled",
  tooltipTitle = "Rename"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState('auto');
  const [localValue, setLocalValue] = useState(value);
  
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth + 20 + 'px');
    }
  }, [localValue]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue.trim() === '') {
      setLocalValue(placeholder);
      onChange(placeholder);
    } else {
      onChange(localValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      
    }, 0);
  };

  return (
    <div className="relative flex items-center">
      <span
        ref={measureRef}
        className="invisible absolute text-2xl font-medium"
        style={{ whiteSpace: 'pre', fontFamily: 'inherit' }}
      >
        {localValue}
      </span>

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleEditClick}
        className={`${className} text-2xl font-medium border-b-2 text-black bg-transparent outline-none px-2
          ${isEditing ? 'border-blue-500' : 'border-transparent'} 
          ${isEditing ? '' : 'cursor-text'}`}
        style={{ width }}
        readOnly={!isEditing}
      />
      <Tooltip title={tooltipTitle}>
        <EditOutlined
          className="text-gray-600 ml-2 cursor-pointer mt-1"
          onClick={handleEditClick}
          style={{ fontSize: '24px', width: '20px', height: '20px' }}
        />
      </Tooltip>
    </div>
  );
};

export default EditableInput;