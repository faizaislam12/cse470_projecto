import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import ListingOffers from './pages/ListingOffers';
import MyOffers from './pages/MyOffers';
import MyPickups from './pages/MyPickups';
import MyListings from './pages/MyListings';
import AdminCategories from './pages/AdminCategories';
import MaterialGuide from './pages/MaterialGuide';
import Transactions from './pages/Transactions';
import EcoPoints from './pages/EcoPoints';
import RewardRedemption from './pages/RewardRedemption';
import AdminRewards from './pages/AdminRewards';
import ImpactDashboard from './pages/ImpactDashboard';
import Goals from './pages/Goals';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';

const RedirectIfLoggedIn = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<p style={{padding:40,textAlign:'center'}}>You are not authorized to view this page.</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ListingDetail />} />
            <Route path="/marketplace/:id/offers" element={<ListingOffers />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-offers" element={<MyOffers />} />
            <Route path="/my-pickups" element={<MyPickups />} />
            <Route path="/history" element={<Transactions />} />
            <Route path="/material-guide" element={<MaterialGuide />} />
            <Route path="/ecopoints" element={<EcoPoints />} />
            <Route path="/rewards" element={<RewardRedemption />} />
            <Route path="/impact" element={<ImpactDashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/certificates/:id" element={<CertificateView />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;