import React, { useState } from 'react';
import MainAppForm from './MainAppForms';// Forms component
import DashboardView from './DashboardView'; // Dashboard component
import JobSearch from './JobSearch'; // Job search component (to be built)

const MainApp = () => {
  const [activeSection, setActiveSection] = useState('MainApp'); // Tracks active section

  const renderContent = () => {
    switch (activeSection) {
      case 'MainApp':
        return <MainAppForm />;
      case 'dashboard':
        return <DashboardView />;
      case 'jobSearch':
        return <JobSearch />;
      default:
        return <MainAppForm />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[344px] bg-[#004aad] text-white flex flex-col">
        {/* Logo */}
        <div className="px-8 py-6">
          <img 
            src="/images/logoez.png" 
            alt="EZ Apply Logo" 
            className="h-[52px] w-auto"
          />
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 space-y-4 px-6">
          <NavItem
            icon="🛠️"
            label="Main App"
            isActive={activeSection === 'mainApp'}
            onClick={() => setActiveSection('MainApp')}
          />
          <NavItem
            icon="📊"
            label="Dashboard"
            isActive={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <NavItem
            icon="🔍"
            label="Job Search"
            isActive={activeSection === 'jobSearch'}
            onClick={() => setActiveSection('jobSearch')}
          />
          <NavItem icon="🚪" label="Sign Out" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white px-8 py-4 shadow">
          <h1 className="text-lg font-medium">
            {activeSection === 'mainApp' && 'Main App'}
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'jobSearch' && 'Job Search'}
          </h1>
        </header>
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

/* NavItem Component */
const NavItem = ({ icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer ${
      isActive ? 'bg-white text-[#004aad] font-semibold' : 'hover:bg-[#003b85]'
    } transition`}
  >
    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#004aad]">
      {icon}
    </div>
    <span>{label}</span>
  </div>
);

export default MainApp;
