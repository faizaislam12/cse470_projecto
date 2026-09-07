import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AddBusiness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: '', businessType: 'Retail', phone: '', address: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/businesses/user/${user._id}`);
        if (data.data) {
          const b = data.data;
          setForm({ businessName: b.businessName || '', businessType: b.businessType || 'Retail', phone: b.phone || '', address: b.address || '', description: b.description || '' });
        }
      } catch {}
    })();
  }, [user]);

  if (!user) return null;
  if (user.role !== 'business') return <div className="page-container"><h2>Access Denied — this page is for business accounts.</h2></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/businesses/profile', form);
      setMsg('Business profile saved! The admin will review it.');
      setTimeout(() => navigate('/business/dashboard'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save business profile.');
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Business Profile</h1><p className="subtitle">Register your business to participate in recycling campaigns.</p></div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 12px rgba(20,96,63,0.06)', maxWidth: 560 }}>
        {msg && <div className="success">{msg}</div>}
        <form onSubmit={handleSubmit}>
          <label>Business Name
            <input required value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Green Leaf Markets" />
          </label>
          <label>Business Type
            <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}>
              <option>Retail</option><option>Manufacturing</option><option>Restaurant</option><option>Office</option><option>Other</option>
            </select>
          </label>
          <label>Phone
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+880…" />
          </label>
          <label>Address
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Business address" />
          </label>
          <label>Description
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, resize: 'vertical' }} placeholder="What does your business do?" />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Business Profile'}</button>
        </form>
      </div>
    </div>
  );
};

export default AddBusiness;