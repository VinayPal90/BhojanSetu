// frontend/src/pages/ContactPage.jsx (Update Code)

import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaComments, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import BASE_BACKEND_URL from '../config/apiConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form submit handle karein (Ab API hit hoga)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setIsSubmitted(false);
        setError(null);

        try {
            const { data } = await axios.post(`${BASE_BACKEND_URL}/contact`, formData);
            
            if (data.success) {
                setIsSubmitted(true);
                setFormData({ name: '', email: '', message: '' }); // Form reset
            }

        } catch (err) {
            console.error("Contact Form Submission Error:", err);
            setError(err.response?.data?.message || "Message failed to send. Check console/network.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header isTransparent={false} />
            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
                    
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 border-b pb-2 flex items-center">
                        <FaComments className="mr-3 text-green-600" /> Humse Sampark Karein (Contact Us)
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Aapke sawaal, sujhav, ya kisi bhi tarah ki inquiry ke liye humein likhein.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Contact Information Column (Same as before) */}
                        <div className="md:col-span-1 space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Humein Dhundhein</h3>
                            
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="text-xl text-orange-500 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Office Address</p>
                                    <p className="text-gray-600">BhojanSetu Headquarters, Noida, Uttar Pradesh, India</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <FaEnvelope className="text-xl text-orange-500 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Email Us</p>
                                    <p className="text-gray-600">vinaypal9012@gmail.com</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <FaPhone className="text-xl text-orange-500 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Call Us</p>
                                    <p className="text-gray-600">+91 9012536628 (Mon - Fri: 9am - 5pm)</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Column */}
                        <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl shadow-inner">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Send a Message</h3>
                            
                            {isSubmitted && (
                                <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg">
                                    <FaCheckCircle className="inline mr-2" /> Thank you! Your message has been sent successfully.
                                </div>
                            )}
                            {error && (
                                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea name="message" id="message" rows="4" required value={formData.message} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <FaPaperPlane className="mr-2" /> {isSending ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;