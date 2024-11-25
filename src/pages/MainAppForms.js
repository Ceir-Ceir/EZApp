// src/pages/MainAppForms.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import { db } from '../services/firebase'; // Firebase configuration
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Step Navigation
const Step = ({ number, label, isActive }) => (
  <div
    className={`cursor-pointer py-2 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
  >
    <span className="font-medium">{number}. </span>
    {label}
  </div>
);

const MainAppForm = () => {
  const [activeStep, setActiveStep] = useState(1); // Step navigation
  const [userData, setUserData] = useState({}); // Store form data across steps
  const navigate = useNavigate(); // For redirection to dashboard

  const handleNext = (stepData) => {
    setUserData((prev) => ({ ...prev, ...stepData })); // Merge step data
    if (activeStep === 4) {
      saveToFirestore(); // Save all data to Firestore
    } else {
      setActiveStep(activeStep + 1); // Move to next step
    }
  };

  const saveToFirestore = async () => {
    try {
      const docRef = doc(db, 'Users', userData.email); // Document ID is email
      await setDoc(docRef, userData);
      alert('Data saved successfully!');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const renderForm = () => {
    switch (activeStep) {
      case 1:
        return <PersonalInformationForm onNext={(data) => handleNext(data)} />;
      case 2:
        return <DemographicsForm onNext={(data) => handleNext(data)} />;
      case 3:
        return <EducationForm onNext={(data) => handleNext(data)} />;
      case 4:
        return <WorkExperienceForm onNext={(data) => handleNext(data)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 p-8 space-x-6">
      {/* Left Panel: Steps Navigation */}
      <div className="w-1/3 bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-6">Registration</h2>
        <Step number="1" label="Personal Information" isActive={activeStep === 1} />
        <Step number="2" label="Demographics" isActive={activeStep === 2} />
        <Step number="3" label="Education" isActive={activeStep === 3} />
        <Step number="4" label="Work Experience" isActive={activeStep === 4} />
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 bg-white rounded-lg p-6 shadow">{renderForm()}</div>
    </div>
  );
};

/* Personal Information Form */
const PersonalInformationForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email) {
      alert("Please fill in the required fields.");
      return;
    }
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Full Name</label>
          <input
            className="border border-gray-300 rounded-lg p-2"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Email Address</label>
          <input
            className="border border-gray-300 rounded-lg p-2"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Phone Number</label>
          <input
            label="Phone Number"
            className="border border-gray-300 rounded-lg p-2"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          /></div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">LinkedIn Profile URL</label>
          <input
            className="border border-gray-300 rounded-lg p-2"
            placeholder="Paste LinkedIn URL"
            value={formData.linkedIn}
            onChange={(e) => handleChange('linkedIn', e.target.value)}
          /></div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
      >
        Next
      </button>
    </form>
  );
};

/* Demographics Form */
const DemographicsForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    over18: '',
    workAuth: '',
    sponsorship: '',
    gender: '',
    pronouns: '',
    disability: '',
    veteran: '',
    race: '',
    hispanic: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Demographics</h2>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Are you over 18?</label>
        <input
          placeholder="Yes/No"
          value={formData.over18}
          onChange={(e) => handleChange('over18', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Work Authorization</label>
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter work authorization details"
          value={formData.workAuth}
          onChange={(e) => handleChange('workAuth', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Sponsorship Needed?</label>
        <input
          placeholder="Yes/No"
          value={formData.sponsorship}
          onChange={(e) => handleChange('sponsorship', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Gender</label>
        <input
          label="Gender"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter your gender"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Preferred Pronouns</label>
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter pronouns"
          value={formData.pronouns}
          onChange={(e) => handleChange('pronouns', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Disability Status</label>
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter disability status"
          value={formData.disability}
          onChange={(e) => handleChange('disability', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Veteran Status</label>
        <input
          label="Veteran Status"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter veteran status"
          value={formData.veteran}
          onChange={(e) => handleChange('veteran', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Race/Ethnicity</label>
        <input
          className="border border-gray-300 rounded-lg p-2"
          placeholder="Enter race/ethnicity"
          value={formData.race}
          onChange={(e) => handleChange('race', e.target.value)}
        />
        </div>
        <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Are you Hispanic or Latino?</label>
        <input
          placeholder="Yes/No"
          value={formData.hispanic}
          onChange={(e) => handleChange('hispanic', e.target.value)}
        />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
      >
        Next
      </button>
    </form>
  );
};

/* Education Form */
const EducationForm = ({ onNext }) => {
  const [educationEntries, setEducationEntries] = useState([
    { school: '', degree: '', startDate: '', endDate: '', description: '' },
  ]);

  const handleAddEntry = () => {
    setEducationEntries([
      ...educationEntries,
      { school: '', degree: '', startDate: '', endDate: '', description: '' },
    ]);
  };

  const handleRemoveEntry = (index) => {
    setEducationEntries(educationEntries.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...educationEntries];
    updatedEntries[index][field] = value;
    setEducationEntries(updatedEntries);
  };

  const handleSubmit = () => {
    onNext({ education: educationEntries });
  };

  return (
    <form className="flex flex-col h-full">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        {educationEntries.map((entry, index) => (
          <div key={index} className="space-y-4 border-b border-gray-300 pb-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">School/University Name</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.school}
                onChange={(e) => handleChange(index, 'school', e.target.value)}
                placeholder="Enter school/university name"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Degree</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.degree}
                onChange={(e) => handleChange(index, 'degree', e.target.value)}
                placeholder="Enter degree"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.endDate}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Description</label>
              <textarea
                className="border border-gray-300 rounded-lg p-2"
                value={entry.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="Describe your education, major, etc."
                rows="3"
              />
            </div>
            {educationEntries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="text-sm text-red-500 hover:underline mt-2"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEntry}
          className="text-sm text-[#004aad] hover:underline"
        >
          + Add Another Entry
        </button>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
      >
        Submit
      </button>
    </form>
  );
};


/* Work Experience Form */
const WorkExperienceForm = ({ onNext }) => {
  const [experienceEntries, setExperienceEntries] = useState([
    { company: '', position: '', startDate: '', endDate: '', description: '' },
  ]);

  const handleAddEntry = () => {
    setExperienceEntries([
      ...experienceEntries,
      { company: '', position: '', startDate: '', endDate: '', description: '' },
    ]);
  };

  const handleRemoveEntry = (index) => {
    setExperienceEntries(experienceEntries.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...experienceEntries];
    updatedEntries[index][field] = value;
    setExperienceEntries(updatedEntries);
  };

  const handleSubmit = () => {
    onNext({ workExperience: experienceEntries });
  };


  return (
    <form className="flex flex-col h-full">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
        {experienceEntries.map((entry, index) => (
          <div key={index} className="space-y-4 border-b border-gray-300 pb-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.company}
                onChange={(e) => handleChange(index, 'company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.position}
                onChange={(e) => handleChange(index, 'position', e.target.value)}
                placeholder="Enter position title"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={entry.endDate}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Job Description</label>
              <textarea
                className="border border-gray-300 rounded-lg p-2"
                value={entry.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements"
                rows="3"
              />
            </div>
            {experienceEntries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="text-sm text-red-500 hover:underline mt-2"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEntry}
          className="text-sm text-[#004aad] hover:underline"
        >
          + Add Another Entry
        </button>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
      >
        Submit
      </button>
    </form>
  );
};

// Input Component for Form
const Input = ({ label, type = 'text', value, onChange, options = [] }) => {
  if (type === 'radio') {
    return (
      <div className="flex items-center space-x-4">
        <label>{label}</label>
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              type="radio"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className="ml-2">{option}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
        placeholder={label}
      />
    </div>
  );
};
export default MainAppForm;