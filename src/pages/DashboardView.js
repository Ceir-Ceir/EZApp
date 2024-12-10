import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase'; // Firebase configuration
import { CSVLink } from 'react-csv'; // CSV Export
import * as XLSX from 'xlsx'; // Excel Export
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { checkSubscriptionStatus } from '../services/stripe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

const DashboardView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [userData, setUserData] = useState({});

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingExperiences, setIsEditingExperiences] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  console.log("userID", userId);
  const userEmail = auth.currentUser?.email;
  console.log("userEmail", userEmail);
  const { currentUser } = useAuth();
  // Fetch data from DB
  const fetchData = async () => {
    try {
      const userRef = doc(db, "Users", currentUser.uid); // Firestore document reference
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        navigate('/main-app-forms');
      }

      setUserData(userSnap.data());
      const data = userSnap.data();
      setUserData({
        ...data,
        skills: data.skills || [],
        experiences: data.workExperience || [],
        education: data.education || [],
      });

      const status = await checkSubscriptionStatus(userId);
      setSubscriptionStatus(status);  // Set the status in state
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  // Save the Data to DB
  const saveData = async () => {
    try {
      if (!userId) return;

      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, {
        skills: userData.skills,
        workExperience: userData.experiences,
        education: userData.education,
      }, { merge: true });
      alert("Data saved successfully!");
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Failed to save data.");
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login'); // Redirect to login if user is not authenticated
      return;
    }

    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!userData) {
    return <div>No user data available</div>;
  }

  // Export to Excel
  const handleExcelExport = () => {
    const ws = XLSX.utils.json_to_sheet([userData]); // Convert userData to a sheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'User Data'); // Append the sheet to the workbook
    XLSX.writeFile(wb, 'user_data.xlsx'); // Download as an Excel file
  };

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
    console.log(`Changing experience[${index}].${field} to ${value}`); // Debug log
    const updatedExperiences = [...userData.experiences];
    updatedExperiences[index][field] = value;
    setUserData({ ...userData, experiences: updatedExperiences });
  };

  const handleAddExperience = () => {
    setUserData({
      ...userData,
      experiences: [
        ...userData.experiences,
        { position: "", company: "", startDate: "", endDate: "" },
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
      education: [...userData.education,
      { degree: "", school: "", startDate: "", endDate: "" }
      ],
    });
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = userData.education.filter((_, i) => i !== index);
    setUserData({ ...userData, education: updatedEducation });
  };

  return (
    <div className="p-8">
      {/* Export to Excel Button */}
      <button
        className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        onClick={handleExcelExport}
      >
        <FontAwesomeIcon icon={faFileExcel} className="text-xl" />
        &nbsp;Export
      </button>
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold">{userData.fullName}'s Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <p className="text-gray-700">
            <span className="font-medium">Email: </span>
            {userEmail}
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
                onClick={() => {
                  saveData(); // Save data when the user clicks "Save"
                  setIsEditingSkills(false); // Exit edit mode
                }}
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
                  value={experience.position}
                  onChange={(e) =>
                    handleExperienceChange(index, "position", e.target.value)
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
                onClick={() => {
                  saveData(); // Save data when the user clicks "Save"
                  setIsEditingExperiences(false); // Exit edit mode
                }}
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
                    <h3 className="font-semibold text-gray-800">{experience.position}</h3>
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
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(index, "degree", e.target.value)
                  }
                  placeholder="Degree"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
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
                  value={edu.startDate}
                  onChange={(e) =>
                    handleEducationChange(index, "startDate", e.target.value)
                  }
                  placeholder="Start Date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                />
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) =>
                    handleEducationChange(index, "endDate", e.target.value)
                  }
                  placeholder="End Date"
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
                onClick={() => {
                  saveData(); // Save data when the user clicks "Save"
                  setIsEditingEducation(false); // Exit edit mode
                }}
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
                    <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-600">
                      {edu.school} | {edu.startDate} - {edu.endDate}
                    </p>
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
