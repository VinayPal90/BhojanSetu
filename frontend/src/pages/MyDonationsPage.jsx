// frontend/src/pages/MyDonationsPage.jsx (Update Code: Fixing Blank Page, Chat UI)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaSpinner, FaBoxes, FaClock, FaTruckLoading, FaCheckCircle, FaExclamationTriangle, FaCommentDots } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatModal from '../components/ChatModal'; 

// FIX 1: StatusBadge component ko yahan define kiya (Blank page fix)
const StatusBadge = ({ status }) => {
    let classes = 'px-3 py-1 text-sm font-semibold rounded-full ';
    switch (status) {
        case 'pending': classes += 'bg-red-100 text-red-700'; break;
        case 'assigned': classes += 'bg-blue-100 text-blue-700'; break;
        case 'picked': classes += 'bg-yellow-100 text-yellow-700'; break;
        case 'delivered': classes += 'bg-green-100 text-green-700'; break;
        case 'expired': classes += 'bg-gray-500 text-white'; break;
        default: classes += 'bg-gray-100 text-gray-700';
    }
    return <span className={classes}>{status.toUpperCase()}</span>;
};


const MyDonationCard = ({ donation, onChatOpen }) => {
  // Chat button tabhi dikhao jab assigned ho ya picked ho
  const isAssigned = donation.status === 'assigned' || donation.status === 'picked';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-start mb-4 border-b pb-3">
        <h4 className="text-xl font-bold text-gray-800 flex items-center">
          <FaBoxes className="text-orange-500 mr-3" /> Donation Date: {new Date(donation.createdAt).toLocaleDateString()}
        </h4>
        <StatusBadge status={donation.status} />
      </div>

      <div className="mb-4 space-y-2 text-gray-700">
        <p className="flex items-center text-sm"><FaClock className="mr-2 text-yellow-600" /> **Expiry:** {new Date(donation.expiryDate).toLocaleString()}</p>
        <p className="flex items-center text-sm"><FaTruckLoading className="mr-2 text-blue-500" /> **Assigned To:** {donation.assignedTo ? donation.assignedTo.name : 'Not yet assigned'}</p>
        <p className="text-sm text-gray-500">**Pickup Address:** {donation.pickupLocation.address}</p>
      </div>

      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2">Items:</h5>
        <ul className="list-disc list-inside text-gray-600 text-sm pl-4">
          {donation.foodItems.map((item, idx) => (
            <li key={idx}>{item.name} - **{item.quantity}**</li>
          ))}
        </ul>
      </div>

      {/* Chat Button (Donor side) */}
      {isAssigned && donation.assignedTo && (
          <div className='mt-4 pt-4 border-t'>
              <button 
                  onClick={() => onChatOpen(donation)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center transition"
              >
                  <FaCommentDots className='mr-2'/> Chat with NGO ({donation.assignedTo.name})
              </button>
          </div>
      )}
      
      {donation.status === 'delivered' && (
        <div className="mt-4 pt-4 border-t text-center text-green-600 font-bold">
          <FaCheckCircle className="inline mr-2" /> SUCCESSFULLY DELIVERED
        </div>
      )}
    </div>
  );
};


const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat Modal States
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState({});

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const { data } = await axios.get(`${BASE_BACKEND_URL}/donations/my-donations`, config);
      setDonations(data.data);
    } catch (err) {
      setError("Failed to fetch your donation history.");
    } finally {
      setLoading(false);
    }
  };
  
  // Open Chat Handler
  const handleChatOpen = (donation) => {
      if (!donation.assignedTo) {
          alert('Chat is only available after an NGO has accepted the donation.');
          return;
      }
      setChatData({
          donationId: donation._id,
          participantName: donation.assignedTo.name, 
          isAssigned: true 
      });
      setShowChat(true);
  };
  
  // Close Chat Handler
  const handleChatClose = () => {
      setShowChat(false);
      setChatData({});
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isTransparent={false} />
      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
            <FaHistory className="mr-3 text-orange-500" /> My Donation History
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tracking status of food donated by you.
          </p>

          {loading && (
            <div className="text-center mt-10 text-green-600 text-xl flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3" /> Loading your donation history...
            </div>
          )}

          {error && <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-center"><FaExclamationTriangle className="mr-2" /> {error}</div>}

          {!loading && !error && donations.length === 0 && (
            <div className="text-center mt-10 p-10 bg-yellow-100 text-yellow-700 rounded-lg">
              <p className="text-xl">🙌 You haven't made any donations yet. Donate now!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {donations.map(donation => (
              <MyDonationCard key={donation._id} donation={donation} onChatOpen={handleChatOpen} />
            ))}
          </div>

        </div>
      </main>
      <Footer />
      
      {/* Chat Modal Rendering */}
      {showChat && (
          <ChatModal 
              donationId={chatData.donationId} 
              participantName={chatData.participantName} 
              isAssigned={chatData.isAssigned}
              onClose={handleChatClose}
          />
      )}
    </div>
  );
};

export default MyDonationsPage;