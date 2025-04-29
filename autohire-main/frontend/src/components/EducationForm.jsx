import React, { useState } from 'react';
import { Form, Input, Row, Col, DatePicker, Checkbox } from 'antd';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DeleteFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
import { useSpring, animated } from 'react-spring';

const EducationForm = ({ education, onInputChange, index, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(education.endDate === 'Present');

  const animationProps = useSpring({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
  });

  const handleChange = (field, value) => {
    const updatedEducation = {
      ...education,
      [field]: value,
    };
    onInputChange('education', index, updatedEducation);
  };

  const handleDateChange = (field) => (date) => {
    const formattedDate = date ? date.format('MM/YYYY') : null;
    handleChange(field, formattedDate);
  };

  const parseDateString = (dateString) => {
    if (!dateString || dateString === 'Present') return null;
    const date = dayjs(dateString, 'MM/YYYY');
    return date.isValid() ? date : null;
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handlePresentChange = (e) => {
    setIsPresent(e.target.checked);
    handleChange('endDate', e.target.checked ? 'Present' : null);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    if (dateString === 'Present') return 'Present';
    return dayjs(dateString, 'MM/YYYY').format('MMM YYYY');
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <div 
        className="flex flex-col p-4 cursor-pointer hover:bg-gray-50"
        onClick={toggleOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
          <h3 className="text-lg text-black font-semibold">
  {education.degree && education.school
    ? `${education.degree} at ${education.school}`
    : education.school || education.degree || '(Not specified)'}
</h3>


          </div>
          <div className="flex items-center space-x-2">
            <Tooltip title="Delete">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <DeleteFilled className="w-5 h-5 text-red-500 hover:text-red-700" />
              </button>
            </Tooltip>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {formatDateForDisplay(education.startDate)} - {formatDateForDisplay(education.endDate)}
        </div>
      </div>

      <animated.div style={animationProps}>
        <Form layout="vertical" autoComplete="off" className="p-6 pt-2 bg-gray-50">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="School" 
                className="mb-4"
              >
                <Input
                  value={education.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  placeholder="e.g. Harvard University"
                  className="p-2"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Degree" 
                className="mb-4"
              >
                <Input
                  value={education.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className="p-2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Start Date" className="mb-4">
                <DatePicker
                  picker="month"
                  value={parseDateString(education.startDate)}
                  onChange={handleDateChange('startDate')}
                  className="w-full"
                  format="MM/YYYY"
                  placeholder="MM/YYYY"
                  disabledDate={(currentDate) => {
                    const today = dayjs();
                    const endDate = parseDateString(education.endDate);
                    return currentDate.isAfter(today, 'month') || (endDate && currentDate.isAfter(endDate, 'month'));
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="End Date" className="mb-4">
                <DatePicker
                  picker="month"
                  value={parseDateString(education.endDate)}
                  onChange={handleDateChange('endDate')}
                  className="w-full"
                  format="MM/YYYY"
                  placeholder="MM/YYYY"
                  disabled={isPresent}
                  disabledDate={(currentDate) => {
                    const startDate = parseDateString(education.startDate);
                    return startDate && currentDate.isBefore(startDate, 'month');
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={isPresent}
                  onChange={handlePresentChange}
                >
                  Present
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="City" 
                className="mb-4"
              >
                <Input
                  value={education.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Cambridge"
                  className="p-2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Description"
            className="mb-4"
          >
            <Input.TextArea
              value={education.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g. Studied advanced topics in computer science."
              className="p-2"
              rows={4}
            />
            <div className="flex justify-between mt-2 text-gray-500 text-sm">
              <span>Recruiter tip: write 200+ characters to increase interview chances</span>
              <span>{(education.description?.length || 0)} / 200+</span>
            </div>
          </Form.Item>
        </Form>
      </animated.div>
    </div>
  );
};

export default EducationForm; 