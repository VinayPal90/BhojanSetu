// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <-- FIX: Link component imported
import { FaUserEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaLock, FaSave, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ngoRegistrationId: '',
    newPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Fetch Profile Data ---
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_BACKEND_URL}/auth/profile`, config);
      
      const profileData = data.data;

      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        ngoRegistrationId: profileData.ngoRegistrationId || '',
        newPassword: '',
        role: profileData.role || ''
      });
      setError(null);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setError("Failed to fetch profile details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Input Change Handler ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- Update Profile Handler ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccess(null);
    setError(null);

    // Frontend validation
    if (formData.newPassword && formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        setIsUpdating(false);
        return;
    }

    try {
        // Data jo API ko bhejna hai
        const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            ngoRegistrationId: formData.ngoRegistrationId,
            // Sirf tab bhejo jab user ne naya password dala ho
            ...(formData.newPassword && { newPassword: formData.newPassword }) 
        };

        const { data } = await axios.put(`${BASE_BACKEND_URL}/auth/profile`, updateData, config);

        setSuccess(data.message);
        // Local storage update karein agar naam ya email change hua hai
        const currentUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({...currentUser, name: data.data.name, email: data.data.email}));

    } catch (err) {
        console.error("Profile Update Error:", err);
        setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isTransparent={false} />
      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
          
          {/* Back Button */}
          <Link to="/" className="flex items-center text-gray-500 hover:text-green-600 transition duration-200 font-medium mb-6">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center border-b pb-2">
            <FaUserEdit className="mr-3 text-green-600" /> User Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Edit your details or update your password. Role: <span className="font-bold text-orange-600">{formData.role.toUpperCase()}</span>
          </p>
          
          {/* Success/Error Messages */}
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}


          <form onSubmit={handleUpdate} className="space-y-4">
            
            {/* Name */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Email (Read-Only to avoid complex email verification for now) */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Address */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
              <textarea name="address" required value={formData.address} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* NGO ID (Only if user is NGO) */}
            {formData.role === 'ngo' && (
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">NGO Reg. ID</label>
                <input name="ngoRegistrationId" type="text" required value={formData.ngoRegistrationId} onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* Change Password */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1 flex items-center">
                <FaLock className="mr-2" /> New Password (Leave blank if unchanged)
              </label>
              <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Enter new password (min 6 chars)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
            >
              <FaSave className="mr-2" /> {isUpdating ? "Updating..." : "Save Changes"}
            </button>

          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;