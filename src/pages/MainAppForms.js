import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';

// Step Component
const Step = ({ number, label, isActive, onClick }) => (
  <div
    className={`flex items-center gap-4 cursor-pointer ${
      isActive ? 'text-blue-600 font-bold' : 'text-gray-600'
    }`}
    onClick={onClick}
  >
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
        isActive ? 'border-blue-600 bg-blue-100' : 'border-gray-400'
      }`}
    >
      {number}
    </div>
    <div>
      <p>{label}</p>
    </div>
  </div>
);

const MainAppForms = () => {
  const { currentUser } = useAuth(); // Ensure `useAuth` is used at the top level
  const [activeStep, setActiveStep] = useState(1);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  const fetchUserData = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'Users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Fetched Data:", docSnap.data());
        setUserData(docSnap.data()); // Set the fetched data, including email
      } else {
        console.log('No such document!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    }
  };

  fetchUserData();
}, [currentUser, navigate]);


  const handleNext = (stepData) => {
    // Merge workExperience data into userData
    console.log('Step Data:', stepData); // Log step data to verify
    setUserData((prev) => ({ ...prev, ...stepData }));
  
    if (activeStep === 4) {
      console.log('Final User Data before save:', { ...userData, ...stepData }); // Check if workExperience is included
      saveToFirestore({ ...userData, ...stepData }); // Pass the complete data including workExperience
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const saveToFirestore = async (finalData) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

        // Add the profileComplete field to finalData
    const updatedData = { ...finalData, profileComplete: true };
  
      const db = getFirestore();
      console.log('Saving data to Firestore:', updatedData);
  
      const docRef = doc(db, 'Users', currentUser.uid); // Save under user's UID
      await setDoc(docRef, updatedData, { merge: true }); // Merge the new data with existing data
      console.log('Data saved successfully!');
      navigate('/main-app/dashboard');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };
  


  const renderForm = () => {
    switch (activeStep) {
      case 1:
        return (
          <PersonalInformationForm
            onNext={(data) => handleNext(data)}
            prefillData={userData} // Pass pre-filled data
          />
        );
      case 2:
        return (
          <DemographicsForm
            onNext={(data) => handleNext(data)}
            prefillData={userData} // Pass pre-filled data
          />
        );
      case 3:
        return (
          <EducationForm
            onNext={(data) => handleNext(data)}
            prefillData={userData} // Pass pre-filled data
          />
        );
      case 4:
        return (
          <WorkExperienceForm
            onNext={(data) => handleNext(data)}
            prefillData={userData} // Pass pre-filled data
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Panel: Step Navigation */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lets Build Your Resume</h2>
        <div className="space-y-4">
        <Step
          number={1}
          label="Personal Information"
          isActive={activeStep === 1}
          onClick={() => handleStepClick(1)} // Update here
        />
        <Step
          number={2}
          label="Demographics"
          isActive={activeStep === 2}
          onClick={() => handleStepClick(2)} // Update here
        />
        <Step
          number={3}
          label="Education"
          isActive={activeStep === 3}
          onClick={() => handleStepClick(3)} // Update here
        />
        <Step
          number={4}
          label="Work Experience"
          isActive={activeStep === 4}
          onClick={() => handleStepClick(4)} // Update here
          />
        </div>
      </div>

      {/* Right Panel: Form Content */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6">
        {renderForm()}
      </div>
    </div>
  );
};

/* Personal Information Form */
const PersonalInformationForm = ({ onNext, prefillData }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: prefillData?.fullName || '',
      email: prefillData?.email || '',
      phone: prefillData?.phone || '',
      linkedIn: prefillData?.linkedIn || '',
    }));
  }, [prefillData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email) {
      alert('Please fill in the required fields.');
      return;
    }
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email Address</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">LinkedIn Profile URL</label>
          <input
            type="url"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Paste LinkedIn URL"
            value={formData.linkedIn}
            onChange={(e) => handleChange('linkedIn', e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium"
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
      <h2 className="text-xl font-semibold mb-4">Demographics</h2>
      <div className="space-y-4">
        {/* Over 18 */}
        <div>
          <label className="block text-sm font-medium">Are you over 18?</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Yes"
                checked={formData.over18 === 'Yes'}
                onChange={() => handleChange('over18', 'Yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                checked={formData.over18 === 'No'}
                onChange={() => handleChange('over18', 'No')}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Work Authorization */}
        <div>
          <label className="block text-sm font-medium">Work Authorization</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={formData.workAuth}
            onChange={(e) => handleChange('workAuth', e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="U.S. Citizen">U.S. Citizen</option>
            <option value="Permanent Resident">Permanent Resident</option>
            <option value="Work Visa (H1B, L1, etc.)">Work Visa (H1B, L1, etc.)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sponsorship */}
        <div>
          <label className="block text-sm font-medium">Do you need sponsorship?</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Yes"
                checked={formData.sponsorship === 'Yes'}
                onChange={() => handleChange('sponsorship', 'Yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                checked={formData.sponsorship === 'No'}
                onChange={() => handleChange('sponsorship', 'No')}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">Select your gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Prefer Not to Say">Prefer Not to Say</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium">Preferred Pronouns</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={formData.pronouns}
            onChange={(e) => handleChange('pronouns', e.target.value)}
          >
            <option value="">Select your pronouns</option>
            <option value="He/Him">He/Him</option>
            <option value="She/Her">She/Her</option>
            <option value="They/Them">They/Them</option>
            <option value="Prefer Not to Say">Prefer Not to Say</option>
          </select>
        </div>

        {/* Disability Status */}
        <div>
          <label className="block text-sm font-medium">Do you have a disability?</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Yes"
                checked={formData.disability === 'Yes'}
                onChange={() => handleChange('disability', 'Yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                checked={formData.disability === 'No'}
                onChange={() => handleChange('disability', 'No')}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Veteran Status */}
        <div>
          <label className="block text-sm font-medium">Are you a veteran?</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Yes"
                checked={formData.veteran === 'Yes'}
                onChange={() => handleChange('veteran', 'Yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                checked={formData.veteran === 'No'}
                onChange={() => handleChange('veteran', 'No')}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Race/Ethnicity */}
        <div>
          <label className="block text-sm font-medium">Race/Ethnicity</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={formData.race}
            onChange={(e) => handleChange('race', e.target.value)}
          >
            <option value="">Select your race/ethnicity</option>
            <option value="White">White</option>
            <option value="Black or African American">Black or African American</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic or Latino">Hispanic or Latino</option>
            <option value="Native American or Alaska Native">
              Native American or Alaska Native
            </option>
            <option value="Native Hawaiian or Pacific Islander">
              Native Hawaiian or Pacific Islander
            </option>
            <option value="Two or More Races">Two or More Races</option>
            <option value="Prefer Not to Say">Prefer Not to Say</option>
          </select>
        </div>

        {/* Hispanic/Latino */}
        <div>
          <label className="block text-sm font-medium">
            Are you Hispanic or Latino?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="Yes"
                checked={formData.hispanic === 'Yes'}
                onChange={() => handleChange('hispanic', 'Yes')}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                checked={formData.hispanic === 'No'}
                onChange={() => handleChange('hispanic', 'No')}
              />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium"
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
      <h2 className="text-xl font-semibold mb-4">Education</h2>
      <div className="space-y-4">
        {educationEntries.map((entry, index) => (
          <div key={index} className="space-y-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium">School/University</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter school/university name"
                value={entry.school}
                onChange={(e) => handleChange(index, 'school', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Degree</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter degree"
                value={entry.degree}
                onChange={(e) => handleChange(index, 'degree', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={entry.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={entry.endDate}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Describe your education"
                value={entry.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
              />
            </div>
            {educationEntries.length > 1 && (
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveEntry(index)}
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600"
          onClick={handleAddEntry}
        >
          + Add Another Entry
        </button>
      </div>
      <button
        type="button"
        className="mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium"
        onClick={handleSubmit}
      >
        Next
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
    console.log('Work Experience Data:', experienceEntries);
    onNext({ workExperience: experienceEntries });
  };

  return (
    <form className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
      <div className="space-y-4">
        {experienceEntries.map((entry, index) => (
          <div key={index} className="space-y-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium">Company</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter company name"
                value={entry.company}
                onChange={(e) => handleChange(index, 'company', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Position</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter position"
                value={entry.position}
                onChange={(e) => handleChange(index, 'position', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={entry.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={entry.endDate}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Describe your responsibilities"
                value={entry.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
              />
            </div>
            {experienceEntries.length > 1 && (
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveEntry(index)}
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600"
          onClick={handleAddEntry}
        >
          + Add Another Entry
        </button>
      </div>
      <button
        type="button"
        className="mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};

export default MainAppForms;
