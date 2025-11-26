// frontend/src/pages/AboutPage.jsx

import React from 'react';
import { FaHeartbeat, FaHandsHelping, FaGlobe, FaCheckCircle,FaUserCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
    
    const MissionVisionCard = ({ icon, title, description, bgColor }) => (
        <div className={`p-6 rounded-xl shadow-lg border-t-4 ${bgColor} bg-white transition duration-300 hover:shadow-xl`}>
            <div className={`text-4xl mb-4 ${bgColor.includes('green') ? 'text-green-600' : 'text-orange-500'}`}>{icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
    
    const TeamMember = ({ name, role, motto }) => (
        <div className="text-center p-4 bg-gray-50 rounded-lg shadow-md">
            <FaUserCircle className="text-5xl text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold">{name}</h4>
            <p className="text-sm text-orange-600 mb-1">{role}</p>
            <p className="text-xs text-gray-500 italic">"{motto}"</p>
        </div>
    );


    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header isTransparent={false} />
            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl space-y-10">
                    
                    <header className="text-center border-b pb-6">
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Hamari Kahani (About Us)</h1>
                        <p className="text-xl text-green-700">Connecting Surplus Food with Empty Plates.</p>
                    </header>

                    {/* Mission & Vision Section */}
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Mission aur Vision</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <MissionVisionCard 
                                icon={<FaHeartbeat />}
                                title="Hamara Mission"
                                description="Zero food waste प्राप्त करना और भारत में हर भूखे पेट तक पोषण सुनिश्चित करना।"
                                bgColor="border-green-600"
                            />
                            <MissionVisionCard 
                                icon={<FaGlobe />}
                                title="Hamara Vision"
                                description="Ek aisa Bharat jahan surplus food samay par zarooratmand logon tak pahunche, aur koi bhi bhojan bekaar na ho."
                                bgColor="border-orange-500"
                            />
                        </div>
                    </section>
                    
                    {/* The Problem & Solution */}
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-green-600 pl-3">The BhojanSetu Difference</h2>
                        <p className="text-gray-700">
                            Bharat mein har saal tonon food waste hota hai, jabki dusri taraf लाखों log bhookhe rehte hain. BhojanSetu is gap ko bharne ke liye ek technological bridge hai.
                        </p>
                        <div className="flex items-center p-4 bg-green-50 rounded-lg">
                            <FaCheckCircle className="text-3xl text-green-600 mr-4 flex-shrink-0" />
                            <p className="text-green-800 font-medium">
                                Hum Donors (Restaurants, Events) ko Verified NGOs aur pickup agents se real-time mein connect karte hain.
                            </p>
                        </div>
                    </section>

                    {/* Team Section (Dummy) */}
                    <section className="space-y-6 text-center ">
                        <h2 className="text-3xl font-bold text-gray-800 border-b pb-3">Developed By</h2>
                        <div className="grid grid-cols-1  gap-6 flex items-center justify-center">
                            <TeamMember name="Vinay Kumar" role="Founder & CEO" motto="Technology for Humanity." />
                        </div>
                    </section>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;