import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import VolunteerRegister from './pages/VolunteerRegister';
import VolunteerLogin from './pages/VolunteerLogin';
import VolunteerDashboard from './pages/VolunteerDashboard';
import CampaignDetails from './pages/CampaignDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminVolunteers from './pages/AdminVolunteers';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminReports from './pages/AdminReports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<VolunteerRegister />} />
      <Route path="/login" element={<VolunteerLogin />} />
      
      {/* Volunteer Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="volunteer">
            <VolunteerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/campaigns/:id" 
        element={
          <ProtectedRoute requiredRole="volunteer">
            <CampaignDetails />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/volunteers" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminVolunteers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/campaigns" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminCampaigns />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminReports />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
