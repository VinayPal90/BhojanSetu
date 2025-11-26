// frontend/src/pages/HomePage.jsx

import React from 'react';
// Image ko import karein, file path (hero_bg.jpg) ko check karein
import heroBg from '../assets/food.png'; 
import Footer from '../components/Footer'; // Abhi banayenge
import Header from '../components/Header'; // Abhi banayenge
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        <div className="text-3xl text-green-600 mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HomePage = () => {
    return (
        <div className="min-h-screen">
            <Header /> {/* Header component aayega */}

            {/* --- 1. HERO SECTION (Main Banner) --- */}
            {/* Image use karne ke liye, `heroBg` variable ko style attribute mein use kiya gaya hai */}
            <section 
                className="relative h-[80vh] md:h-[90vh] flex items-center justify-center bg-cover bg-center" 
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                {/* Dark Overlay (Text ko clearly dikhane ke liye) */}
                <div className="absolute inset-0 bg-green-900 opacity-60"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center text-white p-6 max-w-4xl">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-snug tracking-wide">
                        BhojanSetu: Waste Roko, Jeevan Jodo
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-10 font-light">
                        Har ek bacha hua daana kisi ki bhookh mita sakta hai. Hum ek 'setu' (bridge) hain.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link to="/donate" ><button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                            Food Donate Karein
                        </button></Link>
                        <Link to="/contact"><button className="bg-white hover:bg-gray-200 text-green-700 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
                            Help Line/NGOs Login
                        </button></Link>
                    </div>
                </div>
            </section>

            {/* --- 2. HOW IT WORKS SECTION (Features) --- */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-gray-800">
                        Kaise Kaam Karta Hai?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon="🍽️"
                            title="1. Report Waste/Donate"
                            description="Restaurants, events ya ghar se bacha hua, extra food report karein ya donate karein. Location aur quantity bataayein."
                        />
                        <FeatureCard 
                            icon="📍"
                            title="2. NGO Pickup"
                            description="Humari registered NGOs aapki location ko dekhkar turant food pickup schedule karti hain."
                        />
                        <FeatureCard 
                            icon="❤️"
                            title="3. Bhookh Mitao"
                            description="Food safety check ke baad, woh bhojan zarooratmand logon aur shelters tak pahunchaya jaata hai."
                        />
                    </div>
                </div>
            </section>
            
            <Footer /> {/* Footer component aayega */}
        </div>
    );
};

export default HomePage;