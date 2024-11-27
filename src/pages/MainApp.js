// src/pages/MainApp.js
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Search, LogOut } from 'lucide-react';

const MainApp = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="flex justify-between items-center bg-white shadow-md fixed w-full z-10 h-16 px-6">
        <div className="flex items-center">
          <img
            src="/images/logoez.png"
            alt="EZApply Logo"
            className="h-28 w-auto object-contain"
          />
        </div>
        <div className="flex items-center">
          <span className="mr-4 text-gray-600">Eng (US)</span>
          <span className="mr-4 text-gray-800 font-medium">Musfiq</span>
          <LogOut
            className="cursor-pointer text-gray-600 hover:text-red-600 transition duration-200"
            size={20}
          />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex pt-16 w-full">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white min-h-screen">
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
        <div className="flex-1 p-8">
          {/* Render Content via Outlet */}
          <div className="bg-white shadow-md rounded-lg p-6" style={{ minHeight: 'calc(100vh - 96px)' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
