// src/pages/MainApp.js
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Search, LogOut, Menu, X } from 'lucide-react';
import { getAuth } from 'firebase/auth';

const MainApp = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log('Logged out successfully');
      navigate("/login");
    }).catch((error) => {
      console.error('Logout Error:', error);
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="flex justify-between items-center bg-white shadow-md fixed w-full z-10 h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <img
            src="/images/logoez.png"
            alt="EZApply Logo"
            className="h-20 sm:h-28 w-auto object-contain"
          />
        </div>
        <div className="flex items-center">
          <span className="hidden sm:inline mr-4 text-gray-600">Eng (US)</span>
          <span className="hidden sm:inline mr-4 text-gray-800 font-medium">Musfiq</span>
          <button 
            onClick={toggleMobileMenu}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <LogOut
            onClick={handleLogout}
            className="hidden sm:block cursor-pointer text-gray-600 hover:text-red-600 transition duration-200"
            size={20}
          />
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-20 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b">
            <button onClick={toggleMobileMenu} className="p-2">
              <X size={24} />
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-4">
              <li
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  navigate('/main-app');
                  toggleMobileMenu();
                }}
              >
                <Home className="mr-3" size={20} />
                <span className="text-lg">About You</span>
              </li>
              <li
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  navigate('/main-app/dashboard');
                  toggleMobileMenu();
                }}
              >
                <LayoutDashboard className="mr-3" size={20} />
                <span className="text-lg">Dashboard</span>
              </li>
              <li
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  navigate('/main-app/job-search');
                  toggleMobileMenu();
                }}
              >
                <Search className="mr-3" size={20} />
                <span className="text-lg">Job Search</span>
              </li>
              <li
                className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-3" size={20} />
                <span className="text-lg">Sign Out</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-col sm:flex-row pt-16 w-full">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden sm:block w-64 bg-blue-900 text-white min-h-screen">
          <nav className="mt-8">
            <ul>
              <li
                className="px-6 py-3 flex items-center cursor-pointer hover:bg-blue-800 rounded-lg transition duration-200"
                onClick={() => navigate('/main-app')}
              >
                <Home className="inline-block mr-3" size={20} />
                <span className="text-lg font-medium">About You</span>
              </li>
              <li
                className="px-6 py-3 flex items-center cursor-pointer hover:bg-blue-800 rounded-lg transition duration-200"
                onClick={() => navigate('/main-app/dashboard')}
              >
                <LayoutDashboard className="inline-block mr-3" size={20} />
                <span className="text-lg font-medium">Dashboard</span>
              </li>
              <li
                className="px-6 py-3 flex items-center cursor-pointer hover:bg-blue-800 rounded-lg transition duration-200"
                onClick={() => navigate('/main-app/job-search')}
              >
                <Search className="inline-block mr-3" size={20} />
                <span className="text-lg font-medium">Job Search</span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-8">
          {/* Render Content via Outlet */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6" style={{ minHeight: 'calc(100vh - 96px)' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
