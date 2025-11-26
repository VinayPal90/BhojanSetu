// frontend/src/components/Footer.jsx (Full Updated Code)

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logo and Motto */}
          <div>
            <Link to="/" className="text-2xl font-extrabold text-white">
              Bhojan<span className="text-orange-500">Setu</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Waste Roko, Jeevan Jodo. <br/> Together, we fight food waste and hunger.
            </p>
             {/* Social Links */}
             <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-blue-500 transition duration-300"><FaFacebook className='text-lg' /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-300"><FaTwitter className='text-lg' /></a>
                <a href="#" className="text-gray-400 hover:text-pink-500 transition duration-300"><FaInstagram className='text-lg' /></a>
                <a href="#" className="text-gray-400 hover:text-blue-700 transition duration-300"><FaLinkedin className='text-lg' /></a>
            </div>
          </div>

          {/* Column 2: Quick Links (Updated) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition duration-300">About Us</Link></li> {/* <-- Link Fixed */}
              <li><Link to="/faq" className="hover:text-white transition duration-300">FAQ</Link></li>
              <li><Link to="/policy" className="hover:text-white transition duration-300">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 3: Get Involved */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">Get Involved</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/donate" className="hover:text-white transition duration-300">Donate Food</Link></li>
              <li><Link to="/register" className="hover:text-white transition duration-300">Register NGO/Donor</Link></li>
              <li><Link to="/volunteer" className="hover:text-white transition duration-300">Volunteer</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-500">Contact</h3>
            <p className="text-gray-400">Email: vinaypal9012@gmail.com</p>
            <p className="text-gray-400 mt-2">Ph: +91 9012536628</p>
            <p className="text-gray-400 mt-2 text-sm">Noida, UP, India</p>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-500">
          &copy; {new Date().getFullYear()} BhojanSetu. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;