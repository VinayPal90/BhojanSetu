// frontend/src/components/ChatModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes, FaSpinner, FaLock, FaTrash } from 'react-icons/fa'; // FaTrash import kiya
import io from 'socket.io-client'; 
import BASE_BACKEND_URL from '../config/apiConfig';

const ENDPOINT = BASE_BACKEND_URL.replace('/api/v1', ''); 
let socket; 
// ... (Global socket variable remains the same)

const ChatModal = ({ donationId, participantName, onClose, isAssigned }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const currentUserId = user?._id;

    // --- 1. Fetch Old Messages ---
    const fetchMessages = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${BASE_BACKEND_URL}/messages/${donationId}`, config);
            setMessages(data.data);
            setLoading(false);
            socket.emit('join_chat_room', donationId); 
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setLoading(false);
        }
    };
    
    // --- 2. Socket.io Setup ---
    useEffect(() => {
        socket = io(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });
        
        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        
        socket.on('message_received', (newMsgReceived) => {
            if (newMsgReceived.donation === donationId) {
                setMessages((prevMessages) => [...prevMessages, newMsgReceived]);
            }
        });

        fetchMessages(); 
        
        return () => {
            socket.off('message_received');
            socket.disconnect();
        };
    }, [donationId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. Send Message API & Socket Emit ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content) return;
        
        try {
            setNewMessage(''); 
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            
            const { data } = await axios.post(`${BASE_BACKEND_URL}/messages`, { donationId, content }, config);
            const savedMessage = data.data;

            socket.emit('new_message', savedMessage);
            
            setMessages((prevMessages) => [...prevMessages, savedMessage]);

        } catch (error) {
            console.error("Failed to send message:", error);
            alert('Failed to send message.');
            setNewMessage(content); 
        }
    };

    // --- 4. Clear Chat Handler ---
    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear all messages for this chat? This cannot be undone.")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Backend DELETE API call
            const { data } = await axios.delete(`${BASE_BACKEND_URL}/messages/${donationId}`, config);
            
            alert(data.message);
            setMessages([]); // Frontend messages clear karo

        } catch (error) {
            alert('Failed to clear chat history.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center z-50 p-4"> {/* FIX 1: Background color changed */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-full max-h-[80vh]">
                
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-green-600 text-white rounded-t-xl">
                    <h3 className="text-lg font-bold">Chat with {participantName}</h3>
                    <div className='flex items-center space-x-3'>
                        {/* FIX 2: Clear Chat Button */}
                        <button onClick={handleClearChat} className="text-sm hover:text-red-300 flex items-center">
                            <FaTrash className='mr-1' /> Clear
                        </button>
                        <button onClick={onClose} className="text-xl hover:text-red-300">
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                    {loading ? (
                        <div className="text-center text-gray-500"><FaSpinner className="animate-spin inline mr-2"/> Loading messages...</div>
                    ) : (
                        messages.length === 0 ? (
                            <div className="text-center text-gray-500 p-10 border rounded-lg">Start a conversation!</div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg shadow-md ${msg.sender._id === currentUserId ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}> {/* FIX 3: Chat bubble colors changed */}
                                        <div className="text-xs font-bold mb-1 opacity-80">
                                            {msg.sender._id === currentUserId ? 'You' : msg.sender.name}
                                        </div>
                                        <p>{msg.content}</p>
                                        <div className="text-[10px] text-right mt-1 opacity-60">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll target */}
                </div>
                
                {/* Footer (Input) */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    {!isAssigned && user.role !== 'donor' ? (
                         <div className="text-center p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-center">
                            <FaLock className='mr-2' /> Chat is locked until the donation is assigned to you.
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow border p-3 rounded-full focus:ring-green-500 focus:border-green-500"
                                disabled={!isAssigned && user.role === 'donor'}
                            />
                            <button 
                                type="submit"
                                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition"
                                disabled={!newMessage.trim()}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    )}
                </form>

            </div>
        </div>
    );
};

export default ChatModal;