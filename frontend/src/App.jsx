// frontend/src/App.jsx

import { Routes, Route } from 'react-router-dom';

// Pages Import
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonatePage from './pages/DonatePage'; 
import DashboardPage from './pages/DashboardPage'; 
import ProfilePage from './pages/ProfilePage';
import MyDonationsPage from './pages/MyDonationsPage'; 
import ContactPage from './pages/ContactPage';
import DonorDashboardPage from './pages/DonorDashboardPage'; // <-- Donor Dashboard Imported
import AboutPage from './pages/AboutPage';

// Component Import
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/donate" element={<DonatePage />} /> 
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} /> 
      
      {/* --- Protected Routes --- */}
      
      {/* 1. Admin/NGO Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRoles={['ngo', 'admin']}>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 2. Donor Dashboard (Only for Donors) */}
      <Route 
        path="/donor-dashboard" 
        element={
          <ProtectedRoute requiredRoles={['donor']}>
            <DonorDashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 3. Profile (Any Logged-in User) */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* 4. My Donations History (Donor/Admin) */}
      <Route 
        path="/my-donations" 
        element={
          <ProtectedRoute requiredRoles={['donor', 'admin']}>
            <MyDonationsPage />
          </ProtectedRoute>
        } 
      />

      {/* Wildcard Route */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;