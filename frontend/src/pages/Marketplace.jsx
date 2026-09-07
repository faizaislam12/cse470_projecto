import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CAT_COLORS = { 'Plastic': '#10b981', 'Paper & Cardboard': '#f59e0b', 'Metal': '#06b6d4', 'Glass': '#3b82f6', 'E-Waste': '#8b5cf6' };

const Marketplace = () => {
  const { user, reloadUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchListings(); }, [catFilter, statusFilter]);

  const fetchCategories = async () => {
    try { const { data } = await api.get('/categories'); setCategories(data.data); } catch {}
  };
  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = '/listings';
      url += `?status=${statusFilter}`;
      if (catFilter) url += `${url.includes('?') ? '&' : '?'}category=${catFilter}`;
      if (search) url += `${url.includes('?') ? '&' : '?'}search=${encodeURIComponent(search)}`;
      const { data } = await api.get(url);
      setListings(data.data);
    } catch { setMsg('Failed to load listings'); }
    setLoading(false);
  };
  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };
  const handleClaim = async (id) => {
    if (claimingId) return;
    setClaimingId(id);
    try {
      await api.post('/transactions', { listingId: id });
      setMsg('Claimed! Check History tab.');
      setListings(listings.map(l => l._id === id ? { ...l, status: 'Pending' } : l));
      reloadUser();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to claim'); }
    setClaimingId(null);
    setTimeout(() => setMsg(''), 4000);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing from the marketplace?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(l => l._id !== id));
      setMsg('Listing deleted successfully.');
    } catch (err) {
      setMsg('Failed to delete listing.');
    }
    setTimeout(() => setMsg(''), 4000);
  };
  const isBuyer = user && ['collector','recycling_company','admin','business'].includes(user.role);

  return (
    <div className="page-container">
      <h1>Recyclable Waste Marketplace</h1>
      <p className="subtitle">Browse available items from households and businesses.</p>
      {msg && <div className="success">{msg}</div>}
      <form onSubmit={handleSearch} className="filter-bar">
        <input placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Search</button>
        <button type="button" onClick={() => { setSearch(''); setCatFilter(''); setStatusFilter('All'); setTimeout(fetchListings, 0); }} style={{background:'#6b7280'}}>Reset</button>
      </form>
      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
        listings.length === 0 ? <div className="empty-state">No listings found.</div> :
        <div className="listing-grid">
          {listings.map(l => (
            <div key={l._id} className="listing-card">
              <div className="listing-header" style={{background: CAT_COLORS[l.category?.name] || '#1f8a5f'}}>
                <span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span>
              </div>
              <div className="listing-body">
                <span className="cat-tag">{l.category?.name || 'Uncategorized'}</span>
                <h3>{l.title}</h3>
                <p className="listing-desc">{l.description}</p>
                <div className="listing-meta">
                  <span>Address: {l.address}</span>
                  <span>Weight: {l.weight} {l.unit}</span>
                </div>
                <div className="listing-footer">
                  <div><small>Price</small><strong>৳{l.price.toFixed(2)}</strong></div>
                  <div><small>Listed by</small><strong>{l.owner?.name || 'User'} ({l.owner?.role || 'unknown'})</strong></div>
                </div>
                {isBuyer && l.status === 'Available' && l.owner?._id?.toString() !== user?.id?.toString() && (
                  <button onClick={() => handleClaim(l._id)} className="btn-claim" disabled={claimingId === l._id}>
                    {claimingId === l._id ? 'Claiming...' : 'Claim Pickup'}
                  </button>
                )}
                {user && l.owner?._id?.toString() === user?.id?.toString() && l.status === 'Available' && (
                  <button onClick={() => handleDelete(l._id)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: '600'}}>
                    Delete Listing
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};
export default Marketplace;
