import React, { useState } from 'react';

// MainAppForm Component
const MainAppForm = () => {
  const [activeStep, setActiveStep] = useState(1); // Step state to control form progression

  const renderForm = () => {
    // Dynamically render forms based on active step
    switch (activeStep) {
      case 1:
        return <PersonalInformationForm onNext={() => setActiveStep(2)} />;
      case 2:
        return <DemographicsForm onNext={() => setActiveStep(3)} />;
      case 3:
        return <EducationForm onNext={() => setActiveStep(4)} />;
      case 4:
        return <WorkExperienceForm onNext={() => alert('All steps completed!')} />;
      default:
        return <PersonalInformationForm onNext={() => setActiveStep(2)} />;
    }
  };

  return (
    <div className="flex flex-1 p-8 space-x-6">
      {/* Left Panel: Steps Navigation */}
      <div className="w-1/3 bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-6">Registration</h2>
        <Step number="1" label="Personal Information" isActive={activeStep === 1} onClick={() => setActiveStep(1)} />
        <Step number="2" label="Demographics (Optional)" isActive={activeStep === 2} onClick={() => setActiveStep(2)} />
        <Step number="3" label="Education" isActive={activeStep === 3} onClick={() => setActiveStep(3)} />
        <Step number="4" label="Work Experience" isActive={activeStep === 4} onClick={() => setActiveStep(4)} />
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 bg-white rounded-lg p-6 shadow">
        {renderForm()} {/* Dynamically render the form based on the current step */}
      </div>
    </div>
  );
};

/* Personal Information Form */
const PersonalInformationForm = ({ onNext }) => (
    <form className="flex flex-col h-full">
    <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <Input label="Full Name" placeholder="Enter your full name" />
        <Input label="Email Address" placeholder="Enter your email address" />
        <Input label="Phone Number" placeholder="Enter your phone number" />
        <Input label="LinkedIn Profile URL" placeholder="Paste LinkedIn URL" />
    </div>
    <button
        type="button"
        onClick={onNext}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
    >
        Next
    </button>
    </form>
);

const DemographicsForm = ({ onNext }) => (
    <form className="flex flex-col h-full">
      {/* Form Fields */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Demographics</h2>
  
        {/* Left Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Are You Over 18 */}
            <Question
              label="Are you over 18 years of age?"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
  
            {/* Authorization to Work */}
            <Question
              label="Do you have authorization to work in the United States?"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
  
            {/* Sponsorship Requirement */}
            <Question
              label="Do you require sponsorship to work in the United States?"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
          </div>
  
          {/* Right Section */}
          <div className="space-y-6">
            {/* Gender Question */}
            <div>
              <p className="text-sm font-medium mb-2">Gender</p>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
              >
                <option value="" disabled selected>
                  Select your gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="genderqueer">Genderqueer</option>
                <option value="prefer_not_to_say">Prefer Not to Say</option>
              </select>
            </div>
  
            {/* Pronouns Question */}
            <div>
              <p className="text-sm font-medium mb-2">Pronouns</p>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
              >
                <option value="" disabled selected>
                  Select your pronouns
                </option>
                <option value="he_him">He/Him</option>
                <option value="she_her">She/Her</option>
                <option value="they_them">They/Them</option>
                <option value="xe_xem">Xe/Xem</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
  
        {/* Disability Status */}
        <Question
          label="Do you have a disability?"
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Prefer not to say", value: "prefer_not_to_say" },
          ]}
        />
  
        {/* Veteran Status */}
        <Question
          label="Are you a veteran?"
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Prefer not to say", value: "prefer_not_to_say" },
          ]}
        />
  
        {/* Race Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">Select your race</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
          >
            <option value="" disabled selected>
              Choose an option
            </option>
            <option value="white">White</option>
            <option value="black">Black or African American</option>
            <option value="asian">Asian</option>
            <option value="native_american">Native American or Alaska Native</option>
            <option value="native_hawaiian">Native Hawaiian or Other Pacific Islander</option>
            <option value="two_or_more">Two or More Races</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer Not to Say</option>
          </select>
        </div>
  
        {/* Hispanic/Latino Question */}
        <div>
          <p className="text-sm font-medium mb-2">Are you Hispanic or Latino?</p>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="text-[#004aad] focus:ring-[#004aad]"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              className="text-[#004aad] focus:ring-[#004aad]"
            />
            <span>No</span>
          </label>
        </div>
      </div>
  
      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
      >
        Next
      </button>
    </form>
  );
  
 
    // education form
const EducationForm = ({ onNext }) => {
const [educationEntries, setEducationEntries] = useState([
    { school: '', degree: '', year: '', field: '' },
]); // Start with one entry

const handleAddEntry = () => {
    setEducationEntries([...educationEntries, { school: '', degree: '', year: '', field: '' }]);
};

const handleRemoveEntry = (index) => {
    setEducationEntries(educationEntries.filter((_, i) => i !== index));
};

const handleChange = (index, field, value) => {
    const updatedEntries = [...educationEntries];
    updatedEntries[index][field] = value;
    setEducationEntries(updatedEntries);
};

return (
    <form className="flex flex-col h-full">
    <div className="flex-1 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        {educationEntries.map((entry, index) => (
        <div key={index} className="space-y-4 border-b border-gray-300 pb-4">
            {/* School Name */}
            <Input
            label="School Name"
            placeholder="Enter your school name"
            value={entry.school}
            onChange={(e) => handleChange(index, 'school', e.target.value)}
            />

        {/* Degree Earned */}
        <div>
        <label className="block text-sm font-medium mb-2">Degree Earned</label>
        <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
            value={entry.degree}
            onChange={(e) => handleChange(index, 'degree', e.target.value)}
        >
            <option value="" disabled selected>
            Select degree
            </option>
            <option value="high_school">High School Diploma</option>
            <option value="ged">GED</option>
            <option value="associates">Associate's Degree</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="doctoral">Doctoral Degree</option>
            <option value="post_doc">Post-Doctoral Degree</option>
        </select>
        </div>

        {/* Graduation Year */}
        <div>
        <label className="block text-sm font-medium mb-2">Graduation Year</label>
        <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
            value={entry.year}
            onChange={(e) => handleChange(index, 'year', e.target.value)}
        >
            <option value="" disabled selected>
            Select year
            </option>
            {Array.from({ length: 100 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
                <option key={year} value={year}>
                {year}
                </option>
            );
            })}
        </select>
        </div>

            {/* Field of Study */}
            <Input
            label="Field of Study"
            placeholder="Enter your field of study"
            value={entry.field}
            onChange={(e) => handleChange(index, 'field', e.target.value)}
            />

            {/* Remove Entry Button */}
            {educationEntries.length > 1 && (
            <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="text-sm text-red-500 hover:underline"
            >
                Remove Entry
            </button>
            )}
        </div>
        ))}

        {/* Add Entry Button */}
        <button
        type="button"
        onClick={handleAddEntry}
        className="text-sm text-[#004aad] hover:underline"
        >
        + Add Another Entry
        </button>
    </div>

    {/* Next Button */}
    <button
        type="button"
        onClick={onNext}
        className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
    >
        Next
    </button>
    </form>
);
};


    // work experince
    const WorkExperienceForm = ({ onNext }) => {
        const [workEntries, setWorkEntries] = useState([
          { company: '', title: '', startMonth: '', startYear: '', endMonth: '', endYear: '', responsibilities: '', links: '' },
        ]); // Start with one entry
      
        const handleAddEntry = () => {
          setWorkEntries([
            ...workEntries,
            { company: '', title: '', startMonth: '', startYear: '', endMonth: '', endYear: '', responsibilities: '', links: '' },
          ]);
        };
      
        const handleRemoveEntry = (index) => {
          setWorkEntries(workEntries.filter((_, i) => i !== index));
        };
      
        const handleChange = (index, field, value) => {
          const updatedEntries = [...workEntries];
          updatedEntries[index][field] = value;
          setWorkEntries(updatedEntries);
        };
      
        return (
          <form className="flex flex-col h-full">
            <div className="flex-1 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
              {workEntries.map((entry, index) => (
                <div key={index} className="space-y-4 border-b border-gray-300 pb-4">
                  {/* Company Name */}
                  <Input
                    label="Company Name"
                    placeholder="Enter the company name"
                    value={entry.company}
                    onChange={(e) => handleChange(index, 'company', e.target.value)}
                  />
      
                  {/* Job Title */}
                  <Input
                    label="Job Title"
                    placeholder="Enter your job title"
                    value={entry.title}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                  />
      
                  {/* Start Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Month</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
                        value={entry.startMonth}
                        onChange={(e) => handleChange(index, 'startMonth', e.target.value)}
                      >
                        <option value="" disabled selected>
                          Select month
                        </option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Year</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
                        value={entry.startYear}
                        onChange={(e) => handleChange(index, 'startYear', e.target.value)}
                      >
                        <option value="" disabled selected>
                          Select year
                        </option>
                        {Array.from({ length: 100 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
      
                  {/* End Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">End Month</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
                        value={entry.endMonth}
                        onChange={(e) => handleChange(index, 'endMonth', e.target.value)}
                      >
                        <option value="" disabled selected>
                          Select month
                        </option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Year</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
                        value={entry.endYear}
                        onChange={(e) => handleChange(index, 'endYear', e.target.value)}
                      >
                        <option value="" disabled selected>
                          Select year
                        </option>
                        {Array.from({ length: 100 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
      
                  {/* Key Responsibilities */}
                  <Input
                    label="Key Responsibilities"
                    placeholder="List your key responsibilities"
                    value={entry.responsibilities}
                    onChange={(e) => handleChange(index, 'responsibilities', e.target.value)}
                  />
      
                  {/* Links */}
                  <Input
                    label="Links (optional)"
                    placeholder="Add any relevant links (e.g., portfolio, references)"
                    value={entry.links}
                    onChange={(e) => handleChange(index, 'links', e.target.value)}
                  />
      
                  {/* Remove Entry Button */}
                  {workEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(index)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove Entry
                    </button>
                  )}
                </div>
              ))}
      
              {/* Add Entry Button */}
              <button
                type="button"
                onClick={handleAddEntry}
                className="text-sm text-[#004aad] hover:underline"
              >
                + Add Another Entry
              </button>
            </div>
      
            {/* Next Button */}
            <button
              type="button"
              onClick={onNext}
              className="mt-auto w-full bg-[#004aad] text-white py-3 rounded-lg font-semibold"
            >
              Next
            </button>
          </form>
        );
      };

    
      const Input = ({ label, placeholder }) => (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">{label}</label>
          <input 
            type="text" 
            placeholder={placeholder} 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004aad]"
          />
        </div>
      );
      
      const Question = ({ label, options }) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">{label}</p>
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input type="radio" name={label} value={option.value} className="text-[#004aad]" />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
      

export default MainAppForm;

