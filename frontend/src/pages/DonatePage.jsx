// frontend/src/pages/DonatePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash, FaUtensils, FaCalendarAlt, FaMapMarkerAlt, FaNotesMedical, FaArrowLeft } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DonatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Food Items State (Array of objects)
  const [foodItems, setFoodItems] = useState([{ name: '', quantity: '' }]);

  // Main Form Data State
  const [formData, setFormData] = useState({
    expiryDate: '',
    address: '', // Pickup address user ke profile se bhi aa sakta hai, par yahan bhi le rahe hain
    notes: ''
  });

  // --- Check Auth Status ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to donate food.");
      navigate('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);
  // -------------------------

  // --- Handlers ---
  
  // Handle single input field changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle addition of a new food item row
  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: '', quantity: '' }]);
  };

  // Handle removal of a food item row
  const removeFoodItem = (index) => {
    const list = [...foodItems];
    list.splice(index, 1);
    setFoodItems(list);
  };

  // Handle changes within the food items array
  const handleFoodItemChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...foodItems];
    list[index][name] = value;
    setFoodItems(list);
  };

  // --- Donation Submit Handler ---
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Data Cleaning
    const finalFoodItems = foodItems.filter(item => item.name.trim() !== '' && item.quantity.trim() !== '');

    if (finalFoodItems.length === 0 || !formData.expiryDate || !formData.address) {
      alert("Please fill out all required fields and add at least one food item.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Token bhejna zaroori hai
        }
      };

      const donationData = {
        foodItems: finalFoodItems,
        expiryDate: formData.expiryDate,
        // Backend pickupLocation object expect karta hai
        pickupLocation: { address: formData.address }, 
        notes: formData.notes
      };

      const { data } = await axios.post(`${BASE_BACKEND_URL}/donations/create`, donationData, config);

      if (data.success) {
        alert("Donation Registered Successfully! NGO is being notified.");
        // Form reset karein
        setFoodItems([{ name: '', quantity: '' }]);
        setFormData({ expiryDate: '', address: '', notes: '' });
        navigate('/'); 
      }
    } catch (error) {
      console.error("Donation Error:", error);
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  // -------------------------------

  if (!isLoggedIn) {
    return null; // Jab tak login check nahi hota, tab tak kuch nahi dikhayenge
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-2xl mt-10">
          
          {/* Back Button */}
          <Link to="/" className="flex items-center text-gray-500 hover:text-green-600 transition duration-200 font-medium mb-6">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 border-b pb-2">
            Food Donate Karein
          </h2>
          <p className="text-gray-600 mb-8">
            Apne pass bache hue bhojan ki jaankari dein taaki hum use jaldi se jaldi pick kar saken.
          </p>

          <form onSubmit={handleDonationSubmit} className="space-y-8">
            
            {/* 1. Food Items Section */}
            <div className="border border-gray-200 p-6 rounded-lg bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaUtensils className="mr-3 text-green-600" /> Details of Food Items
                </h3>
                {foodItems.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium text-gray-700">Food Name (e.g., Dal, Roti, Rice)</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={item.name}
                                onChange={(e) => handleFoodItemChange(e, index)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium text-gray-700">Quantity (e.g., 5 kg, 20 plates)</label>
                            <input
                                name="quantity"
                                type="text"
                                required
                                value={item.quantity}
                                onChange={(e) => handleFoodItemChange(e, index)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        {foodItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeFoodItem(index)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addFoodItem}
                    className="flex items-center text-green-600 hover:text-green-700 font-medium mt-2"
                >
                    <FaPlus className="mr-2" /> Add More Food Item
                </button>
            </div>

            {/* 2. Pickup Details */}
            <div className="space-y-4">
                {/* Expiry Date/Time */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Food Expiry Date/Time (Zaroori)</label>
                    <div className="absolute inset-y-0 left-0 pl-3 top-6 flex items-center pointer-events-none">
                       <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                        name="expiryDate"
                        type="datetime-local" // Use datetime-local for specific expiry time
                        required
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Pickup Address */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Pickup Address</label>
                    <div className="absolute top-8 left-3 pointer-events-none">
                       <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <textarea
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Complete pickup address"
                        className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Notes */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Notes (Optional)</label>
                    <div className="absolute top-8 left-3 pointer-events-none">
                       <FaNotesMedical className="text-gray-400" />
                    </div>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Any specific instructions (e.g., gate code, contact person)"
                        className="w-full pl-10 px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200"
            >
              {loading ? "Registering Donation..." : "Confirm Donation"}
            </button>

          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonatePage;