import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const ROLE_LABELS = { household: 'Household', collector: 'Collector', recycling_company: 'Recycling Company', business: 'Business', admin: 'Administrator' };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ listings: 0, categories: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [listRes, catRes] = await Promise.all([
          api.get('/listings/my').catch(() => ({ data: { data: [] } })),
          api.get('/categories').catch(() => ({ data: { data: [] } })),
        ]);
        setStats({ listings: listRes.data.data?.length || 0, categories: catRes.data.data?.length || 0 });
      } catch {}
    };
    fetchStats();
  }, []);

  const role = user?.role;

  return (
    <div className="page-container">
      <h1>Welcome, {user?.name}</h1>
      <p className="subtitle">Role: {ROLE_LABELS[role] || role} • Member since {new Date(user?.createdAt).toLocaleDateString()}</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{user?.ecoPoints || 0}</div><div className="stat-label">EcoPoints</div></div>
        <div className="stat-card"><div className="stat-value">{stats.listings}</div><div className="stat-label">My Listings</div></div>
        <div className="stat-card"><div className="stat-value">{stats.categories}</div><div className="stat-label">Categories Available</div></div>
      </div>

    </div>
  );
};
export default Dashboard;
