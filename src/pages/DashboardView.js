import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase.js'; // Firebase configuration
import { CSVLink } from 'react-csv'; // CSV Export
import * as XLSX from 'xlsx'; // Excel Export
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext.js';
import { checkSubscriptionStatus } from '../services/stripe.js';
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-600 text-center p-4">
      {error}
    </div>
  );

  if (!userData) {
    return (
      <div className="text-center p-4">
        No user data available
      </div>
    );
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
      { degree: "", school: "", startDate: "", endDate: "", schoolCityState: "" }
      ],
    });
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = userData.education.filter((_, i) => i !== index);
    setUserData({ ...userData, education: updatedEducation });
  };

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Profile Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
            <p className="text-base">{userData.fullName || 'Not provided'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-base">{userData.email || 'Not provided'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
            <p className="text-base">{userData.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Education</h2>
        <div className="space-y-4">
          {userData.education?.map((edu, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{edu.school}</h3>
              <p className="text-gray-600 mb-1">{edu.degree}</p>
              <p className="text-gray-600 mb-1">{edu.schoolCityState}</p>
              <p className="text-gray-600">
                {edu.startDate} - {edu.endDate}
              </p>
              {edu.description && (
                <p className="text-gray-600 mt-2">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Work Experience */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Work Experience</h2>
        <div className="space-y-4">
          {userData.experiences?.map((exp, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{exp.title}</h3>
              <p className="text-gray-600 mb-1">{exp.company}</p>
              <p className="text-gray-600 mb-1">{exp.location}</p>
              <p className="text-gray-600">
                {exp.startDate} - {exp.endDate}
              </p>
              {exp.description && (
                <p className="text-gray-600 mt-2">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {userData.skills?.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/main-app-forms')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default DashboardView;
