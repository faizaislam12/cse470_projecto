import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const AdminCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', description: '', icon: 'recycle', defaultPointsPerKg: 10, defaultPricePerKg: 0.5 });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try { const { data } = await api.get('/categories'); setCategories(data.data); } catch {}
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/categories', form);
      setCategories([...categories, data.data]);
      setShowModal(false);
      setForm({ name: '', description: '', icon: 'recycle', defaultPointsPerKg: 10, defaultPricePerKg: 0.5 });
      setMsg('Category created successfully!');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to create category'); }
    setTimeout(() => setMsg(''), 4000);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Manage Categories</h1><p className="subtitle">Administer recyclable material categories.</p></div>
        <button onClick={() => setShowModal(true)}>+ New Category</button>
      </div>
      {msg && <div className="success">{msg}</div>}
      
      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
        <div className="listing-grid">
          {categories.map(c => (
            <div key={c._id} className="listing-card">
              <div className="listing-body">
                <h3>{c.name}</h3>
                <p className="listing-desc">{c.description}</p>
                <div className="listing-meta"><span>{c.defaultPointsPerKg} pts/kg</span><span>৳ {c.defaultPricePerKg.toFixed(2)}/kg</span></div>
              </div>
            </div>
          ))}
        </div>
      }

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Category">
        <form onSubmit={handleCreate}>
          <label>Category Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Cardboard" /></label>
          <label>Description<textarea required rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{resize:'none',padding:'11px 13px',border:'1px solid #d6dbd9',borderRadius:8,fontSize:14}} /></label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <label>Default Points / Kg<input required type="number" step="any" value={form.defaultPointsPerKg} onChange={e => setForm({...form, defaultPointsPerKg: e.target.value})} /></label>
            <label>Default Price / Kg (BDT)<input required type="number" step="any" value={form.defaultPricePerKg} onChange={e => setForm({...form, defaultPricePerKg: e.target.value})} /></label>
          </div>
          <button type="submit">Create Category</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
