// frontend/src/pages/DonorDashboardPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaDonate, FaHistory } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DonorDashboardPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.name || 'Valued Donor';

    const ActionCard = ({ title, description, icon, link, bgColor }) => (
        <Link to={link} className={`flex flex-col items-center p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105 ${bgColor} text-white`}>
            <div className="text-5xl mb-3">{icon}</div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-center opacity-90">{description}</p>
        </Link>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header isTransparent={false} />
            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
                        <FaHeart className="mr-3 text-red-500" /> Welcome, {userName}!
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 border-b pb-4">
                        Your actions make a difference. Choose your next step:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <ActionCard 
                            title="Donate Food Now"
                            description="Report surplus food immediately to connect with NGOs nearby."
                            icon={<FaDonate />}
                            link="/donate"
                            bgColor="bg-green-600 hover:bg-green-700"
                        />
                        
                        <ActionCard 
                            title="View My History"
                            description="Track the status of all your past and current donation requests."
                            icon={<FaHistory />}
                            link="/my-donations"
                            bgColor="bg-blue-600 hover:bg-blue-700"
                        />
                        
                    </div>
                    
                    <div className="mt-10 p-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg">
                        <p className="font-semibold">Quick Tip:</p>
                        <p className="text-sm">Click 'My Profile' in the header to update your phone number or address for quicker pickups.</p>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DonorDashboardPage;