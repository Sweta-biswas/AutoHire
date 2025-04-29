import React, { useState } from 'react';
import { Form, Input, Row, Col } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated } from 'react-spring';

const WebsiteForm = ({ website, onInputChange, index, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  const animationProps = useSpring({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
    overflow: 'hidden',
  });

  const handleChange = (field, value) => {
    const updatedWebsite = {
      ...website,
      [field]: value,
    };
    onInputChange(index, updatedWebsite);
  };

  const getTitle = () => {
    if (website.label && website.link) {
      return `${website.label}`;
    } else if (website.label) {
      return `${website.label}`;
    } else if (website.link) {
      return `${website.link}`;
    } else {
      return '(Not specified)';
    }
  };

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
            {website.link && (
              <a
                href={website.link}
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                {website.link}
              </a>
            )}
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
      </div>

      {/* Animated Form Inputs */}
      <animated.div style={animationProps}>
        <Form layout="vertical" autoComplete="off" className="p-6 pt-2 bg-gray-50">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Label" className="mb-4">
                <Input
                  value={website.label}
                  onChange={(e) => handleChange('label', e.target.value)}
                  placeholder="e.g. LinkedIn"
                  className="p-2"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Link" className="mb-4">
                <Input
                  value={website.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  placeholder="e.g. https://linkedin.com/in/yourprofile"
                  className="p-2"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </animated.div>
    </div>
  );
};

export default WebsiteForm;
