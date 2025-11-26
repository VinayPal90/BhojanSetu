// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaIdCard, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // States for OTP Verification
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '', role: 'donor', ngoRegistrationId: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- Register Handler ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_BACKEND_URL}/auth/register`, formData);
      
      if (data.success) {
        if (data.needsVerification) {
            setUserEmail(data.userEmail);
            setNeedsVerification(true); // OTP modal dikhao
        } else {
            alert("Registration Successful!");
            navigate('/login');
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong in Registration");
    } finally {
      setLoading(false);
    }
  };
  
  // --- OTP Verification Handlers ---
  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
        return alert("Please enter 6-digit OTP.");
    }
    setOtpLoading(true);

    try {
        const { data } = await axios.post(`${BASE_BACKEND_URL}/auth/verify-email`, { email: userEmail, otp: otpInput });

        if (data.success) {
            alert(data.message);
            // Auto login ho gaya, token aur user save karo
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // FIX: Hard refresh/replace page to ensure Header re-renders with correct state
            window.location.replace('/'); 
        }

    } catch (error) {
        alert(error.response?.data?.message || "Verification failed.");
    } finally {
        setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
      setOtpLoading(true);
      try {
          const { data } = await axios.post(`${BASE_BACKEND_URL}/auth/resend-otp`, { email: userEmail });
          alert(data.message);
      } catch (error) {
          alert(error.response?.data?.message || "Failed to resend OTP.");
      } finally {
          setOtpLoading(false);
      }
  };
  // ------------------------------------

  // --- OTP Verification Screen Rendering ---
  if (needsVerification) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
              <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl text-center">
                  <FaCheckCircle className="text-6xl text-green-600 mx-auto" />
                  <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
                  <p className="text-gray-600">
                      A 6-digit verification code has been sent to **{userEmail}**. Please enter the code below to complete registration.
                  </p>
                  <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      maxLength="6"
                      className="w-full border p-3 rounded-lg text-xl tracking-widest text-center"
                  />
                  <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otpInput.length !== 6}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
                  >
                      {otpLoading ? "Verifying..." : "Verify Account"}
                  </button>
                  <button
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-4 disabled:opacity-50"
                  >
                      {otpLoading ? "Sending..." : "Resend OTP"}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Code expires in 10 minutes.</p>
              </div>
          </div>
      );
  }

  // --- Main Registration Form Rendering ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        
        {/* Back Button */}
        <div>
          <Link to="/" className="flex items-center text-gray-500 hover:text-green-600 transition duration-200 font-medium">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Account Banayein</h2>
          <p className="mt-2 text-sm text-gray-600">Join BhojanSetu today</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          
          {/* Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              name="name" type="text" required value={formData.name} onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Full Name / Organization Name"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              name="email" type="email" required value={formData.email} onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Email Address"
            />
          </div>

          {/* Password with Toggle */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Password (Min 6 chars)"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Phone */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              name="phone" type="text" value={formData.phone} onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Phone Number"
            />
          </div>

          {/* Address */}
          <div className="relative">
             <div className="absolute top-3 left-3 pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <textarea
              name="address" required value={formData.address} onChange={handleChange} rows="2"
              className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Complete Address"
            />
          </div>

          {/* Role Selection */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-gray-700 text-sm font-bold">Register as:</span>
            <select
              name="role" value={formData.role} onChange={handleChange}
              className="block w-1/2 px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="donor">Donor (Individual)</option>
              <option value="ngo">NGO (Organization)</option>
            </select>
          </div>

          {/* Conditional Field: Only for NGO */}
          {formData.role === 'ngo' && (
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                </div>
                <input
                    name="ngoRegistrationId" type="text" required value={formData.ngoRegistrationId} onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="NGO Registration ID"
                />
           </div>
          )}

          <button
            type="submit" disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account? {' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Login Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;