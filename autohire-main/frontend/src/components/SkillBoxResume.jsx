import React from 'react';
import { Select, Space } from 'antd';

const options = [
  { label: 'Java', value: 'Java' },
  { label: 'Python', value: 'Python' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React.js', value: 'React.js' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'HTML', value: 'HTML' },
  { label: 'CSS', value: 'CSS' },
  { label: 'SQL', value: 'SQL' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'C++', value: 'C++' },
  { label: 'Ruby', value: 'Ruby' },
  { label: 'PHP', value: 'PHP' },
  { label: 'Swift', value: 'Swift' },
  { label: 'Kotlin', value: 'Kotlin' },
  { label: 'Go', value: 'Go' },
  { label: 'R', value: 'R' },
  { label: 'MATLAB', value: 'MATLAB' },
  { label: 'Perl', value: 'Perl' },
  { label: 'Scala', value: 'Scala' },
  { label: 'Dart', value: 'Dart' },
  { label: 'Rust', value: 'Rust' },
  { label: 'GraphQL', value: 'GraphQL' },
  { label: 'SASS', value: 'SASS' },
  { label: 'LESS', value: 'LESS' },
  { label: 'Docker', value: 'Docker' },
  { label: 'Kubernetes', value: 'Kubernetes' },
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'Firebase', value: 'Firebase' },
  { label: 'AWS', value: 'AWS' },
  { label: 'Azure', value: 'Azure' },
  { label: 'GCP', value: 'GCP' },
  { label: 'Jenkins', value: 'Jenkins' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'Deep Learning', value: 'Deep Learning' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
  { label: 'Blockchain', value: 'Blockchain' },
  { label: 'Unity', value: 'Unity' },
  { label: 'Unreal Engine', value: 'Unreal Engine' },
  { label: '3D Modeling', value: '3D Modeling' },
  { label: 'Game Development', value: 'Game Development' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'Ethical Hacking', value: 'Ethical Hacking' },
  { label: 'CI/CD', value: 'CI/CD' },
  { label: 'DevOps', value: 'DevOps' },
  { label: 'Agile Methodologies', value: 'Agile Methodologies' },
  { label: 'Scrum', value: 'Scrum' },
  { label: 'Photoshop', value: 'Photoshop' },
  { label: 'Illustrator', value: 'Illustrator' },
  { label: 'Figma', value: 'Figma' },
  { label: 'Adobe XD', value: 'Adobe XD' },
  { label: 'UI/UX', value: 'UI/UX' }
];

const SkillBox = ({ onSkillsChange, value }) => {
  const handleChange = (selectedValue) => {
    // Call the parent component's callback with the selected value
    onSkillsChange(selectedValue);
  };

  return (
    <Space style={{ width: '100%' }} direction="vertical">
      <Select
        allowClear
        style={{
          width: '100%',
        }}
        placeholder="Please select a skill"
        onChange={handleChange}
        options={options}
        value={value}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
    </Space>
  );
};

export default SkillBox;
