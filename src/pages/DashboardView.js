import React, { useState } from "react";

const DashboardView = () => {
  // Placeholder data for now; to be replaced with dynamic data from Firebase
  const [userData, setUserData] = useState({
    name: "Nicole Richardson",
    email: "nicolerichardson444@gmail.com",
    phone: "03428765431",
    location: "Virginia Beach, United States",
    linkedIn: "https://www.linkedin.com/in/nicole-richardson",
    skills: [
      "Creativity",
      "Sales",
      "Adaptability",
      "Project Management",
      "Marketing Strategy",
    ],
    experiences: [
      {
        title: "UI/UX Designer",
        company: "Amazon",
        startDate: "Dec 2022",
        endDate: "Dec 2023",
      },
      {
        title: "UI/UX Designer",
        company: "Amazon",
        startDate: "Jan 2024",
        endDate: "Present",
      },
    ],
    education: [
      {
        school: "The John Cooper School",
        years: "2021-2023",
      },
      {
        school: "Duke University",
        years: "2024-Present",
      },
    ],
  });

  // Edit state for each section
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingExperiences, setIsEditingExperiences] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  // Skills Editing Handlers
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...userData.skills];
    updatedSkills[index] = value;
    setUserData({ ...userData, skills: updatedSkills });
  };

  const handleAddSkill = () => {
    setUserData({ ...userData, skills: [...userData.skills, ""] });
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = userData.skills.filter((_, i) => i !== index);
    setUserData({ ...userData, skills: updatedSkills });
  };

  // Experience Editing Handlers
  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...userData.experiences];
    updatedExperiences[index][field] = value;
    setUserData({ ...userData, experiences: updatedExperiences });
  };

  const handleAddExperience = () => {
    setUserData({
      ...userData,
      experiences: [
        ...userData.experiences,
        { title: "", company: "", startDate: "", endDate: "" },
      ],
    });
  };

  const handleRemoveExperience = (index) => {
    const updatedExperiences = userData.experiences.filter((_, i) => i !== index);
    setUserData({ ...userData, experiences: updatedExperiences });
  };

  // Education Editing Handlers
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...userData.education];
    updatedEducation[index][field] = value;
    setUserData({ ...userData, education: updatedEducation });
  };

  const handleAddEducation = () => {
    setUserData({
      ...userData,
      education: [...userData.education, { school: "", years: "" }],
    });
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = userData.education.filter((_, i) => i !== index);
    setUserData({ ...userData, education: updatedEducation });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold">{userData.name}'s Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <p className="text-gray-700">
            <span className="font-medium">Email: </span>
            {userData.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Phone: </span>
            {userData.phone}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Location: </span>
            {userData.location}
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
          <span>Skills</span>
          {!isEditingSkills && (
            <button
              onClick={() => setIsEditingSkills(true)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </h2>
        {isEditingSkills ? (
          <div>
            {userData.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddSkill}
              className="text-blue-600 hover:underline mb-4"
            >
              + Add Skill
            </button>
            <div>
              <button
                onClick={() => setIsEditingSkills(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingSkills(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>




      {/* Experience Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Experience</h2>
        {isEditingExperiences ? (
          <div>
            {userData.experiences.map((experience, index) => (
              <div key={index} className="mb-4 border-b border-gray-200 pb-4">
                <input
                  type="text"
                  value={experience.title}
                  onChange={(e) =>
                    handleExperienceChange(index, "title", e.target.value)
                  }
                  placeholder="Job Title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) =>
                    handleExperienceChange(index, "company", e.target.value)
                  }
                  placeholder="Company Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  value={experience.startDate}
                  onChange={(e) =>
                    handleExperienceChange(index, "startDate", e.target.value)
                  }
                  placeholder="Start Date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  value={experience.endDate}
                  onChange={(e) =>
                    handleExperienceChange(index, "endDate", e.target.value)
                  }
                  placeholder="End Date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-500 hover:underline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddExperience}
              className="text-blue-600 hover:underline mb-4"
            >
              + Add Experience
            </button>
            <div>
              <button
                onClick={() => setIsEditingExperiences(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingExperiences(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ul className="space-y-4">
              {userData.experiences.map((experience, index) => (
                <li key={index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{experience.title}</h3>
                    <p className="text-gray-600">
                      {experience.company} | {experience.startDate} - {experience.endDate}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingExperiences(true)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>


      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        {isEditingEducation ? (
          <div>
            {userData.education.map((edu, index) => (
              <div key={index} className="mb-4 border-b border-gray-200 pb-4">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) =>
                    handleEducationChange(index, "school", e.target.value)
                  }
                  placeholder="School Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  value={edu.years}
                  onChange={(e) =>
                    handleEducationChange(index, "years", e.target.value)
                  }
                  placeholder="Years"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => handleRemoveEducation(index)}
                  className="text-red-500 hover:underline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddEducation}
              className="text-blue-600 hover:underline mb-4"
            >
              + Add Education
            </button>
            <div>
              <button
                onClick={() => setIsEditingEducation(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingEducation(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ul className="space-y-4">
              {userData.education.map((edu, index) => (
                <li key={index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{edu.school}</h3>
                    <p className="text-gray-600">{edu.years}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingEducation(true)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Edit
                    </button>
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>


      {/* Social Links Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
        <a
          href={userData.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
};

export default DashboardView;
