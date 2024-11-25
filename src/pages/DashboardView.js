import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase'; // Firebase configuration
import { CSVLink } from 'react-csv'; // CSV Export
import * as XLSX from 'xlsx'; // Excel Export
import { getAuth } from 'firebase/auth';
import { checkSubscriptionStatus } from '../services/stripe'; 

const DashboardView = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid; // Get the authenticated user's ID
  const userEmail = auth.currentUser?.email;
  // Fetch user data from Firestore and subscription status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRef = doc(db, 'Users', userEmail);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError('User data not found');
          return;
        }

        setUserData(userSnap.data());

        // Fetch subscription status
        const status = await checkSubscriptionStatus(userId);
        setSubscriptionStatus(status);  // Set the status in state
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);  // Stop loading once data is fetched
      }
    };

    if (userId) {
      fetchData();  // Call the function when component mounts
    }
  }, [userId]);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div>{error}</div>;
  }

  // Handle logout
  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log('Logged out successfully');
      // Redirect or show login page
    }).catch((error) => {
      console.error('Logout Error:', error);
    });
  };

  // Export to Excel
  const handleExcelExport = () => {
    const ws = XLSX.utils.json_to_sheet([userData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'User Data');
    XLSX.writeFile(wb, 'user_data.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">User Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-white bg-red-500 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* User Profile Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p><strong>Name:</strong> {userData.fullName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Phone:</strong> {userData.phone}</p>
            <p><strong>Linkedin:</strong> {userData.linkedIn}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Demographics</h2>
            <p><strong>Are you over 18?:</strong> {userData.over18}</p>
            <p><strong>Work Authorization:</strong> {userData.workAuth}</p>
            <p><strong>Gender:</strong> {userData.gender}</p>
            <p><strong>Sponsorship Needed?:</strong> {userData.sponsorship}</p>
            <p><strong>Preferred Pronouns:</strong> {userData.pronouns}</p>
            <p><strong>Disability Status:</strong> {userData.disability}</p>
            <p><strong>Veteran Status:</strong> {userData.veteran}</p>
            <p><strong>Race/Ethnicity:</strong> {userData.race}</p>
            <p><strong>Are you Hispanic or Latino?:</strong> {userData.hispanic}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Education</h2>
            {userData.education?.map((entry, index) => (
              <div key={index} className="space-y-2">
                <p><strong>School/University:</strong> {entry.school}</p>
                <p><strong>Degree:</strong> {entry.degree}</p>
                <p><strong>Start Date:</strong> {entry.startDate}</p>
                <p><strong>End Date:</strong> {entry.endDate}</p>
                <p><strong>Description:</strong> {entry.description}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Work Experience</h2>
            {userData.workExperience?.map((entry, index) => (
              <div key={index} className="space-y-2">
                <p><strong>Company:</strong> {entry.company}</p>
                <p><strong>Position:</strong> {entry.position}</p>
                <p><strong>Start Date:</strong> {entry.startDate}</p>
                <p><strong>End Date:</strong> {entry.endDate}</p>
                <p><strong>Responsibilities:</strong> {entry.responsibilities}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-4 mt-6">
          <CSVLink
            data={[userData]}
            filename={"user_data.csv"}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Export to CSV
          </CSVLink>

          <button
            onClick={handleExcelExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Export to Excel
          </button>
        </div>

        {/* Subscription Details */}
        {subscriptionStatus && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Subscription Details</h2>
            <p><strong>Status:</strong> {userData.subscriptionStatus}</p>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default DashboardView;
