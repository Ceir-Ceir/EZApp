import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Layout, 
  Search, 
  LogOut 
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: <Layout className="w-8 h-8" />, 
      label: 'Main App',
      onClick: () => navigate('/app'),
      highlight: true
    },
    { 
      icon: <Layout className="w-8 h-8" />, 
      label: 'dashboard',
      onClick: () => navigate('/dashboard')
    },
    { 
      icon: <Search className="w-8 h-8" />, 
      label: 'Job Search',
      onClick: () => navigate('/search')
    }
  ];

  const handleSignOut = () => {
    // Add sign out logic here
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[344px] bg-[#004aad] min-h-screen flex flex-col">
        {/* Logo */}
        <div className="px-12 py-14">
          <img 
            src="/images/logoez.png" 
            alt="Logo" 
            className="h-13 w-auto bg-white"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="px-8 py-4 flex-1">
          <div className="space-y-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-6 px-6 py-4 text-left
                  ${item.highlight 
                    ? 'bg-white rounded-2xl shadow text-[#004aad] font-semibold' 
                    : 'text-white'
                  }`}
              >
                <span className={`p-1 rounded ${item.highlight ? 'bg-[#004aad]' : 'bg-white'}`}>
                  {item.icon}
                </span>
                <span className={`text-xl ${item.highlight ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="mt-8 w-full flex items-center gap-6 px-6 py-4 text-white"
          >
            <span className="p-1 rounded bg-white">
              <LogOut className="w-8 h-8 rotate-180" />
            </span>
            <span className="text-xl">Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;