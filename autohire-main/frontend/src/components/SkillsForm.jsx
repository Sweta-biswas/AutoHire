import React, { useState } from 'react';
import { Form, Row, Col } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import SkillLevel from './skill-level';
import SkillBox from './SkillBoxResume';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated } from 'react-spring';

const SkillsForm = ({ skill, onInputChange, index, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  const animationProps = useSpring({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
  });

  const handleChange = (field, value) => {
    const updatedSkill = {
      ...skill,
      [field]: value,
    };
    onInputChange(index, updatedSkill);
  };

  const getTitle = () => {
    return skill.name || '(Not specified)';
  };

  const formattedLevel = skill.level
    ? skill.level.charAt(0).toUpperCase() + skill.level.slice(1)
    : 'Novice';

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      {/* Collapsible Section */}
      <div
        className="flex flex-col p-4 cursor-pointer hover:bg-gray-50"
        onClick={toggleOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black">{getTitle()}</h3>
            <p className="text-sm text-gray-500">{formattedLevel}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              <DeleteFilled className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Form Inputs */}
      <animated.div style={animationProps}>
        <Form layout="vertical" autoComplete="off" className="p-6 pt-2 bg-gray-50">
          <Row gutter={16}>
            {/* Single SkillBox */}
            <Col span={12}>
              <Form.Item label="Skill" className="mb-4 mt-[13px]">
                <SkillBox
                  value={skill.name || null}
                  onSkillsChange={(selectedValue) => handleChange('name', selectedValue)}
                />
              </Form.Item>
            </Col>
            {/* Skill Level Selector */}
            <Col span={12}>
              <SkillLevel
                defaultLevel={skill.level || 'novice'}
                onChange={(level) => handleChange('level', level)}
              />
            </Col>
          </Row>
        </Form>
      </animated.div>
    </div>
  );
};

export default SkillsForm;
