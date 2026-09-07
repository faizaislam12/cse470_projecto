import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';

const STATUS_COLOR = { Pending: '#f59e0b', Approved: '#10b981', Rejected: '#ef4444', Suspended: '#8b5cf6' };

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => { if (user?.role === 'business') fetchAll(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true);
    try {
      const bizRes = await api.get(`/businesses/user/${user._id}`);
      setBusiness(bizRes.data.data);
      const [listRes, campRes] = await Promise.all([
        api.get('/listings/mine'),
        api.get('/campaigns'),
      ]);
      setListings(listRes.data.data || []);
      setCampaigns(campRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    }
    setLoading(false);
  };

  if (!user) return null;
  if (user.role !== 'business') return <div className="page-container"><h2>Access Denied</h2></div>;

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;

  if (notFound || !business) {
    return (
      <div className="eco-dark">
      <div className="page-container">
        <h1>Business Dashboard</h1>
        <div className="eco-glass" style={{ borderRadius: 14, padding: 32, marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Complete your business profile</h3>
          <p className="eco-muted">Set up your business details so the admin can verify your account and you can participate in campaigns and list recyclable materials.</p>
          <Link to="/business/profile"><button>Create Business Profile →</button></Link>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="eco-dark">
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">{business.businessName}</span></h1><p className="subtitle">{business.businessType} · {business.address || 'No address set'}</p></div>
        <Link to="/business/profile"><button>Edit Profile</button></Link>
      </div>

      <div className="stats-grid" style={{ marginTop: 0 }}>
        <div className="stat-card"><div className="stat-icon">🏢</div><div className="stat-value">{business.totalRecycled || 0} kg</div><div className="stat-label">Total Recycled</div></div>
        <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">৳ {business.totalRecycled ? (business.totalRecycled * 0.5).toFixed(0) : 0}</div><div className="stat-label">Est. Value</div></div>
        <div className="stat-card"><div className="stat-icon">🗂️</div><div className="stat-value">{listings.length}</div><div className="stat-label">My Listings</div></div>
        <div className="stat-card"><div className="stat-icon">📣</div><div className="stat-value">{campaigns.length}</div><div className="stat-label">Campaigns Available</div></div>
      </div>

      <div className="eco-glass" style={{ borderRadius: 12, padding: '14px 18px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Verification status:</span>
        <span style={{ background: `${(STATUS_COLOR[business.status] || '#999')}1A`, color: STATUS_COLOR[business.status] || '#999', padding: '3px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{business.status}</span>
        {business.status === 'Pending' && <span className="eco-muted" style={{ fontSize: 12 }}>The admin will review your registration shortly.</span>}
        {business.status === 'Rejected' && <span className="eco-muted" style={{ fontSize: 12 }}>Your registration was rejected. Contact the admin.</span>}
        {business.status === 'Suspended' && <span className="eco-muted" style={{ fontSize: 12 }}>Your business is suspended.</span>}
      </div>

      {business.status === 'Approved' && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>My Listings</h2>
          <div style={{ marginTop: 12 }}>
            <DataTable glass
              columns={[
                { key: 'title', label: 'Listing' },
                { key: 'weight', label: 'Weight', render: (l) => `${l.weight} ${l.unit}` },
                { key: 'price', label: 'Price', render: (l) => `৳ ${l.price}` },
                { key: 'status', label: 'Status', render: (l) => (
                  <span style={{ background: l.status === 'Available' ? 'rgba(16,185,129,0.12)' : l.status === 'Completed' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: l.status === 'Available' ? '#34d399' : l.status === 'Completed' ? '#60a5fa' : '#fbbf24', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{l.status}</span>
                ) },
              ]}
              rows={listings}
              empty="No listings yet. Go to My Listings to add one."
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Active Campaigns to Join</h2>
        <div className="listing-grid" style={{ marginTop: 12 }}>
          {campaigns.filter(c => c.status !== 'Ended').map(c => (
            <div key={c._id} className="listing-card">
              <div className="listing-body">
                <h3>{c.title}</h3>
                <p className="listing-desc">{c.description}</p>
                <div className="listing-meta"><span>{c.status}</span><span>🎯 {c.targetWeight || 0} kg</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default BusinessDashboard;