// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaBoxes, FaCheckCircle, FaSpinner, FaMapMarkedAlt, FaUser, FaClock, FaCheck, FaExclamationTriangle, FaTruckLoading, FaHandsHelping, FaHistory, FaTrash, FaEnvelope, FaPhone, FaUsers, FaChartLine, FaClipboardCheck, FaArrowLeft, FaCommentDots } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatModal from '../components/ChatModal'; 

// Helper component for status rendering
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

// DonationCard (NGO View)
const DonationCard = ({ donation, onAction, currentUserId, isProcessing, onChatOpen }) => {
    const isAssignedToMe = donation.assignedTo && donation.assignedTo._id === currentUserId;
    const isAssigned = donation.status !== 'pending' && donation.status !== 'expired';
    
    const renderActionButton = () => {
        if (donation.status === 'pending') {
            return (
                <button onClick={() => onAction(donation._id, 'assign')} disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center disabled:bg-gray-400">
                    <FaCheckCircle className="inline mr-2" /> Accept for Pickup
                </button>
            );
        } else if (donation.status === 'assigned' && isAssignedToMe) {
            return (
                <button onClick={() => onAction(donation._id, 'request_otp')} disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400">
                    <FaTruckLoading className="inline mr-2" /> Mark Picked Up (Verify OTP)
                </button>
            );
        } else if (donation.status === 'picked' && isAssignedToMe) {
            return (
                <button onClick={() => onAction(donation._id, 'delivered')} disabled={isProcessing}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center disabled:bg-gray-400">
                    <FaHandsHelping className="inline mr-2" /> Mark Delivered
                </button>
            );
        } else if (donation.status === 'assigned' && !isAssignedToMe) {
             return <p className="text-sm text-blue-700 font-semibold flex items-center"><FaCheck className="mr-2" />Assigned to another NGO.</p>
        }
        return null;
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
                <h4 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaBoxes className="text-orange-500 mr-3" /> ID: {donation._id.substring(0, 6)}...
                </h4>
                <StatusBadge status={donation.status} /> 
            </div>

            <div className="mb-4 space-y-2 text-gray-700">
                <p className="flex items-center"><FaUser className="mr-2 text-blue-500" /> **Donor:** {donation.donor.name}</p>
                <p className="flex items-center text-sm"><FaEnvelope className="mr-2 text-gray-400" /> **Email:** {donation.donor.email}</p>
                <p className="flex items-center text-sm"><FaPhone className="mr-2 text-gray-400" /> **Phone:** {donation.donor.phone}</p>
                <p className="flex items-center"><FaClock className="mr-2 text-yellow-600" /> **Expiry:** {new Date(donation.expiryDate).toLocaleString()}</p>
                <p className="flex items-center"><FaMapMarkedAlt className="mr-2 text-green-600" /> **Pickup:** {donation.pickupLocation.address}</p>
                {donation.notes && <p className="text-sm text-gray-500 mt-1">**Notes:** {donation.notes}</p>}
            </div>

            <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-1">Items:</h5>
                <ul className="list-disc list-inside text-gray-600 text-sm pl-2">
                    {donation.foodItems.map((item, idx) => (<li key={idx}>{item.name} - **{item.quantity}**</li>))}
                </ul>
            </div>
            
            {/* Action and Chat Button Area */}
            {(donation.status !== 'delivered' && donation.status !== 'expired') && (
                <div className="mt-4 pt-4 border-t">
                    {/* NGO Action Button and Chat Button side-by-side */}
                    {(donation.status === 'assigned' || donation.status === 'picked') ? (
                        <div className="flex space-x-2">
                            <div className="flex-grow">{renderActionButton()}</div>
                            {isAssigned && (
                                <button 
                                    onClick={() => onChatOpen(donation)}
                                    className="bg-blue-500 text-white p-2 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
                                    disabled={!isAssignedToMe} 
                                >
                                    <FaCommentDots />
                                </button>
                            )}
                        </div>
                    ) : (
                        // Pending status ke liye sirf single button
                        <>{renderActionButton()}</>
                    )}
                </div>
            )}
            
             {donation.status === 'delivered' && (
                <div className="mt-4 pt-4 border-t text-center text-green-600 font-bold">
                    <FaCheck className="inline mr-2" /> DELIVERED
                </div>
            )}
        </div>
    );
};


// **********************************************
// ************ ADMIN VIEW COMPONENT ************
// **********************************************

const AdminView = ({ onVerifyToggle, isProcessing }) => {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchAllUsers();
    }, []);

    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    
    // Fetch System Stats
    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${BASE_BACKEND_URL}/auth/admin/stats`, config);
            setStats(data.data);
        } catch (err) {
            console.error("Stats Error:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch All Users (Donor + NGO)
    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get(`${BASE_BACKEND_URL}/auth/admin/users`, config);
            setUsers(data.data);
        } catch (err) {
            console.error("Users Error:", err);
        } finally {
            setLoadingUsers(false);
        }
    };
    
    // UI component for displaying stats
    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
            <div className={`text-3xl ${color} mb-3`}>{icon}</div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
    );
    
    // UI component for User/NGO verification table row
    const UserRow = ({ user, onVerifyToggle, isProcessing }) => (
        <tr key={user._id} className="border-b hover:bg-gray-50">
            <td className="p-4 text-sm font-medium">{user.name}</td>
            <td className="p-4 text-sm">{user.email}</td>
            <td className="p-4 text-sm capitalize">{user.role}</td>
            <td className="p-4 text-sm">{user.ngoRegistrationId || 'N/A'}</td>
            <td className="p-4 text-sm">
                <StatusBadge status={user.isVerified ? 'delivered' : 'pending'} />
            </td>
            <td className="p-4">
                {user.role === 'ngo' && (
                    <button 
                        onClick={() => onVerifyToggle(user._id, !user.isVerified)}
                        disabled={isProcessing}
                        className={`py-1 px-3 text-white rounded-lg text-xs font-semibold transition ${user.isVerified ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                    >
                        {user.isVerified ? 'Unverify' : 'Verify NGO'}
                    </button>
                )}
            </td>
        </tr>
    );


    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center border-b pb-3">
                <FaChartLine className="mr-3 text-blue-600" /> System Statistics
            </h2>
            
            {loadingStats ? (
                <FaSpinner className="animate-spin text-xl text-blue-600" />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.totalUsers} icon={<FaUsers />} color="text-indigo-500" />
                    <StatCard title="Verified NGOs" value={stats.totalNGOs} icon={<FaClipboardCheck />} color="text-green-600" />
                    <StatCard title="Total Donations" value={stats.totalDonations} icon={<FaBoxes />} color="text-orange-500" />
                    <StatCard title="Pending Requests" value={stats.pendingDonations} icon={<FaExclamationTriangle />} color="text-red-500" />
                </div>
            )}
            
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center border-b pb-3">
                <FaClipboardCheck className="mr-3 text-green-600" /> NGO Verification Queue
            </h2>

            {loadingUsers ? (
                <FaSpinner className="animate-spin text-xl text-green-600" />
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. ID</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <UserRow key={user._id} user={user} onVerifyToggle={onVerifyToggle} isProcessing={isProcessing} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// **********************************************
// ************ MAIN DASHBOARD LOGIC ************
// **********************************************

const DashboardPage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); 
    const [activeTab, setActiveTab] = useState('pending');
    
    // OTP Modal States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [currentDonationId, setCurrentDonationId] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [otpSentToEmail, setOtpSentToEmail] = useState('');

    // Chat Modal States
    const [showChat, setShowChat] = useState(false);
    const [chatData, setChatData] = useState({});

    const user = JSON.parse(localStorage.getItem('user'));
    const currentUserId = user?._id;
    const userRole = user?.role;
    const navigate = useNavigate();


    useEffect(() => { 
        if(currentUserId && userRole !== 'admin') {
            fetchDonations();
        }
    }, [currentUserId, userRole]);

    // Fetch Donations (NGO)
    const fetchDonations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${BASE_BACKEND_URL}/donations`, { headers: { 'Authorization': `Bearer ${token}` } });
            setDonations(data.data);
        } catch (err) {
            setError("Failed to fetch donations.");
        } finally { setLoading(false); }
    };

    // Handle NGO Actions (Assign, Request OTP, Delivered)
    const handleDonationAction = async (id, actionType) => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        if (actionType === 'request_otp') {
            setIsProcessing(true);
            try {
                const { data } = await axios.post(`${BASE_BACKEND_URL}/donations/send-otp/${id}`, {}, config);
                alert(data.message); 
                setCurrentDonationId(id);
                setOtpSentToEmail(data.donorEmail);
                setShowOtpModal(true); 
            } catch(err) { alert(err.response?.data?.message || "Failed to send OTP."); }
            finally { setIsProcessing(false); }
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);
        try {
            let endpoint = actionType === 'assign' ? `/donations/assign/${id}` : `/donations/status/${id}`;
            let payload = actionType === 'assign' ? {} : { status: actionType };
            
            await axios.put(`${BASE_BACKEND_URL}${endpoint}`, payload, config);
            alert("Success!");
            fetchDonations();
        } catch (err) { alert(err.response?.data?.message || "Failed."); } 
        finally { setIsProcessing(false); }
    };
    
    // Handle OTP Verification
    const handleVerifyOtp = async () => {
        if(!otpInput) return alert("Enter OTP");
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${BASE_BACKEND_URL}/donations/status/${currentDonationId}`, { status: 'picked', otp: otpInput }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            alert("OTP Verified! Pickup Confirmed.");
            setShowOtpModal(false);
            setOtpInput('');
            fetchDonations();
        } catch (err) { alert(err.response?.data?.message || "Invalid OTP"); }
        finally { setIsProcessing(false); }
    };

    // Handle Admin Verification Toggle (Used in AdminView)
    const handleVerifyToggle = async (userId, newStatus) => {
        if (isProcessing) return;
        setIsProcessing(true);
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            const { data } = await axios.put(`${BASE_BACKEND_URL}/auth/admin/verify-user/${userId}`, { isVerified: newStatus }, config);
            
            alert(data.message);
            window.location.reload(); 

        } catch (err) {
            alert(err.response?.data?.message || "Verification update failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle Clear History (Used in NGO View)
    const handleClearHistory = async () => {
        if(!window.confirm("Are you sure you want to delete all delivery history?")) return;
        setIsProcessing(true);
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.delete(`${BASE_BACKEND_URL}/donations/history`, { headers: { 'Authorization': `Bearer ${token}` } });
          
          alert(data.message); 
          
          fetchDonations(); 
        } catch (err) { 
            console.error("Clear History Error:", err);
            alert("Failed to clear history."); 
        }
        finally { setIsProcessing(false); }
    };
    
    // Open Chat Handler
    const handleChatOpen = (donation) => {
        const isAssigned = donation.status !== 'pending' && donation.status !== 'expired';
        
        setChatData({
            donationId: donation._id,
            participantName: donation.donor?.name || 'Donor',
            isAssigned: isAssigned 
        });
        setShowChat(true);
    };
    
    // Close Chat Handler
    const handleChatClose = () => {
        setShowChat(false);
        setChatData({});
    };


    // --- RENDERING LOGIC ---
    const donationsWithPopulatedFields = donations.map(d => ({
        ...d,
        assignedTo: d.assignedTo && typeof d.assignedTo === 'object' ? d.assignedTo : { _id: d.assignedTo },
        donor: d.donor && typeof d.donor === 'object' ? d.donor : { _id: d.donor }
    }));
    const pendingDonations = donationsWithPopulatedFields.filter(d => d.status === 'pending');
    const myPickups = donationsWithPopulatedFields.filter(d => d.assignedTo && d.assignedTo._id === currentUserId && d.status !== 'delivered' && d.status !== 'expired');
    const deliveredDonations = donationsWithPopulatedFields.filter(d => d.status === 'delivered' || d.status === 'expired');
    const displayList = activeTab === 'pending' ? pendingDonations : activeTab === 'my_pickups' ? myPickups : deliveredDonations;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header isTransparent={false} />
            <main className="flex-grow py-8 px-4 md:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    
                    <div className="flex justify-between items-center mb-6">
                        {/* Back to Home Link */}
                        <Link to="/" className="flex items-center text-gray-500 hover:text-green-600 transition duration-200 font-medium">
                            <FaArrowLeft className="mr-2" /> Back to Home
                        </Link>
                        
                        <h1 className="text-3xl font-bold text-gray-900">
                            {userRole?.toUpperCase()} Dashboard
                        </h1>
                        <div className="w-1/4"></div> {/* Spacer */}
                    </div>
                    
                    {userRole === 'admin' ? (
                        // Render Admin View
                        <AdminView onVerifyToggle={handleVerifyToggle} isProcessing={isProcessing} />
                    ) : (
                        // Render NGO View (Tabs Restored)
                        <>
                            <p className="text-lg text-gray-600 mb-8">Manage Food Pickups and Deliveries</p>
                            
                            {/* Tab Navigation */}
                            <div className="flex border-b mb-6 space-x-4 overflow-x-auto">
                                {['pending', 'my_pickups', 'history'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-lg font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}>
                                        {tab.replace('_', ' ')} ({tab === 'pending' ? pendingDonations.length : tab === 'my_pickups' ? myPickups.length : deliveredDonations.length})
                                    </button>
                                ))}
                            </div>

                            {/* Clear History Button */}
                            {activeTab === 'history' && deliveredDonations.length > 0 && (
                                <div className='mb-4 text-right'>
                                    <button onClick={handleClearHistory} disabled={isProcessing} className="text-red-600 hover:text-red-800 font-semibold flex items-center disabled:opacity-50 float-right">
                                        <FaTrash className="mr-2" /> {isProcessing ? 'Clearing...' : 'Clear History'}
                                    </button>
                                </div>
                            )}

                            {isProcessing && <div className="mb-4 text-blue-600 font-medium"><FaSpinner className="animate-spin inline mr-2"/> Processing...</div>}
                            
                            {loading ? <div className="text-center mt-10">Loading...</div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayList.length === 0 ? <p className="col-span-3 text-center text-gray-500 py-10">No items found.</p> : 
                                     displayList.map(d => <DonationCard key={d._id} donation={d} onAction={handleDonationAction} currentUserId={currentUserId} isProcessing={isProcessing} onChatOpen={handleChatOpen} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* OTP MODAL */}
                {showOtpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                            <h3 className="text-xl font-bold mb-4">Verify Pickup</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Enter the 4-digit OTP shared by the Donor.
                            </p>
                            {otpSentToEmail && (
                                <p className="text-xs text-orange-600 font-medium mb-3 p-2 bg-yellow-50 rounded">
                                   OTP has been sent to Donor's email: **{otpSentToEmail}**
                                </p>
                            )}

                            <input type="text" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} 
                                className="w-full border p-2 rounded mb-4 text-center text-2xl tracking-widest" placeholder="XXXX" maxLength="4" />
                            <div className="flex space-x-3">
                                <button onClick={() => setShowOtpModal(false)} className="flex-1 py-2 border rounded hover:bg-gray-100">Cancel</button>
                                <button onClick={handleVerifyOtp} disabled={isProcessing} className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">Verify</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Chat Modal Rendering */}
                {showChat && (
                    <ChatModal 
                        donationId={chatData.donationId} 
                        participantName={chatData.participantName} 
                        isAssigned={chatData.isAssigned} 
                        onClose={handleChatClose}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;