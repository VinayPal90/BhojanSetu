// frontend/src/components/Header.jsx (Full Updated Code)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaSignInAlt, FaBars, FaTimes, FaUserCircle, FaDonate } from 'react-icons/fa';

const Header = ({ isTransparent }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to update authentication status from localStorage
  const checkAuthStatus = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserRole(userData.role || null); 
      } catch (e) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  // Check login status on component mount and on storage change
  useEffect(() => {
    checkAuthStatus();
    // Listen for storage changes 
    window.addEventListener('storage', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []); 


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    alert('Logged out successfully!');
    navigate('/');
  };
  
  // Helper function to render profile link text
  const renderProfileText = () => {
      if (!userRole) return 'Profile';
      if (userRole === 'donor') return 'My Profile';
      return `${userRole.toUpperCase()} Profile`;
  };


  // Navigation Items ki logic:
  const navItems = [
    { name: 'Home', path: '/' },
    
    // 1. Dashboard for NGO/Admin
    ...(isAuthenticated && (userRole === 'ngo' || userRole === 'admin') ? 
        [{ name: 'Dashboard', path: '/dashboard' }] : 
        []),
        
    // 2. Donor Dashboard (Only visible to Donors)
    ...(userRole === 'donor' ? 
        [{ name: 'My Dashboard', path: '/donor-dashboard' }] : 
        []),
        
    // 3. Donate Karein for Donor/Guest (Link remains the same)
    ...(userRole === 'donor' || !isAuthenticated ? 
        [{ name: 'Donate Karein', path: '/donate', icon: <FaDonate className="mr-1" /> }] : 
        []),

    // 4. My Donations (Only visible to Donors)
     ...(userRole === 'donor' ? 
        [{ name: 'My Donations', path: '/my-donations' }] : 
        []),
        
    { name: 'Contact', path: '/contact' },
  ];

  // Styling based on isTransparent prop
  const headerClass = isTransparent 
    ? "absolute top-0 left-0 right-0 bg-transparent py-4" 
    : "relative bg-white shadow-md py-4"; 
  
  const linkColor = isTransparent ? "text-white" : "text-gray-700";
  const logoColor = isTransparent ? "text-white" : "text-gray-800";


  return (
    <header className={`${headerClass} z-20`}>
      <nav className="container mx-auto px-6 flex justify-between items-center max-w-6xl">
        
        {/* Logo/App Name */}
        <Link to="/" className={`text-3xl font-extrabold ${logoColor} hover:text-orange-500 transition duration-300`}>
          Bhojan<span className="text-orange-500">Setu</span>
        </Link>

        {/* Desktop Navigation & Auth Buttons */}
        <div className="hidden md:flex space-x-6 items-center">
          {/* Main Navigation Links */}
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className={`${linkColor} text-lg font-medium hover:text-orange-500 transition duration-300 flex items-center`}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Auth Button Logic */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 ml-4">
              {/* Profile Link Text */}
              <Link 
                to="/profile" 
                className={`flex items-center text-sm font-semibold ${isTransparent ? 'text-white' : 'text-gray-700'} hover:text-orange-500 transition duration-300`}
              >
                 <FaUserCircle className="mr-1 text-lg text-orange-500" /> 
                 {renderProfileText()}
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 ml-4 flex items-center">
              <FaSignInAlt className="mr-2" /> Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`${linkColor} text-3xl`}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-green-800 bg-opacity-95 p-4 space-y-3 shadow-lg transition-transform duration-300">
           {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              onClick={() => setIsMenuOpen(false)}
              className="block text-white text-lg font-medium hover:text-orange-500 transition duration-300 py-2 border-b border-green-700"
            >
              {item.name}
            </Link>
          ))}
          
          {isAuthenticated && (
            <>
                {/* Mobile Profile Link */}
                <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-lg font-medium hover:text-orange-500 transition duration-300 py-2 border-b border-green-700"
                >
                    <FaUserCircle className="mr-2 text-orange-500" /> {renderProfileText()}
                </Link>

                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left bg-red-500 text-white font-semibold py-2 px-4 rounded transition duration-300 flex items-center justify-center mt-3"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </>
          )}
          {!isAuthenticated && (
            <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center bg-orange-500 text-white font-semibold py-2 px-4 rounded transition duration-300 flex items-center justify-center mt-3"
            >
              <FaSignInAlt className="mr-2" /> Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;