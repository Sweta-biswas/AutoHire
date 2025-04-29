import React, { useEffect } from 'react';
import { Form, Input, Row, Col } from 'antd';

const PersonalDetailsForm = ({ formData, onInputChange }) => {
  const [form] = Form.useForm();

  // Initialize form with formData values when component mounts or formData changes
  useEffect(() => {
    if (formData?.personal) {
      form.setFieldsValue({
        jobTitle: formData.personal.jobTitle || '',
        firstName: formData.personal.firstName || '',
        lastName: formData.personal.lastName || '',
        email: formData.personal.email || '',
        phone: formData.personal.phone || '',
        country: formData.personal.country || '',
        city: formData.personal.city || '',
        address: formData.personal.address || '',
        pincode: formData.personal.pincode || '',
        nationality: formData.personal.nationality || ''
      });
    }
  }, [formData, form]);

  // Handler to update form data
  const handleInputChange = (field, value) => {
    onInputChange('personal', field, value);
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      autoComplete="off"
      initialValues={{
        jobTitle: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        pincode: '',
        nationality: ''
      }}
    >
      {/* Row for Job Title */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Job Title" name="jobTitle">
            <Input
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12} />
      </Row>

      {/* Row for First Name and Last Name */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="First Name" name="firstName">
            <Input
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name" name="lastName">
            <Input
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Row for Email and Phone */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Email" name="email">
            <Input
              type="email"
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phone" name="phone">
            <Input
              type="tel"
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Row for Country and City */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Country" name="country">
            <Input
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="City" name="city">
            <Input
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Row for Address and Pincode */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Address" name="address">
            <Input
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Pincode" name="pincode">
            <Input
              onChange={(e) => handleInputChange('pincode', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Row for Nationality */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nationality" name="nationality">
            <Input
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PersonalDetailsForm;