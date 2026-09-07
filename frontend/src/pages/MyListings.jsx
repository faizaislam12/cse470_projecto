import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';

const MyListings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ title:'', description:'', category:'', weight:'', unit:'kg', price:'', address:'', image:'' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchMyListings(); fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
      const paramCat = searchParams.get('category');
      const paramTitle = searchParams.get('title');
      if (paramCat || paramTitle) {
        setForm(f => ({ ...f, category: paramCat || data.data[0]?._id || '', title: paramTitle || '' }));
        setShowModal(true);
        setSearchParams({}, { replace: true });
      } else if (data.data.length) {
        setForm(f => ({ ...f, category: data.data[0]._id }));
      }
    } catch {}
  };
  const fetchMyListings = async () => {
    setLoading(true);
    try { const { data } = await api.get('/listings/my'); setListings(data.data); } catch {}
    setLoading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, weight: parseFloat(form.weight), price: parseFloat(form.price) };
      if (editingId) {
        const { data } = await api.put(`/listings/${editingId}`, payload);
        setListings(listings.map(l => l._id === editingId ? data.data : l));
        setMsg('Listing updated!');
      } else {
        const { data } = await api.post('/listings', payload);
        setListings([data.data, ...listings]);
        setMsg('Listing created!');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ title:'', description:'', category: categories[0]?._id || '', weight:'', unit:'kg', price:'', address:'', image:'' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to save'); }
    setTimeout(() => setMsg(''), 4000);
  };
  const openEditModal = (l) => {
    setEditingId(l._id);
    setForm({ title: l.title, description: l.description, category: l.category?._id || '', weight: l.weight, unit: l.unit, price: l.price, address: l.address, image: l.image || '' });
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try { await api.delete(`/listings/${id}`); setListings(listings.filter(l => l._id !== id)); setMsg('Deleted.'); } catch { setMsg('Delete failed.'); }
    setTimeout(() => setMsg(''), 4000);
  };
  const STATUS_COLORS = { Available: '#10b981', Pending: '#f59e0b', Completed: '#3b82f6' };

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>My Listings</h1><p className="subtitle">Create and manage your recyclable waste listings.</p></div>
        <button onClick={() => { setEditingId(null); setForm({ title:'', description:'', category: categories[0]?._id || '', weight:'', unit:'kg', price:'', address:'', image:'' }); setShowModal(true); }}>+ New Listing</button>
      </div>
      {msg && <div className="success">{msg}</div>}
      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
        listings.length === 0 ? <div className="empty-state">You haven't listed anything yet.</div> :
        <div className="listing-grid">
          {listings.map(l => (
            <div key={l._id} className="listing-card">
              <div className="listing-body">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span className="cat-tag">{l.category?.name}</span>
                  <span style={{fontSize:12,fontWeight:600,color:STATUS_COLORS[l.status]}}>{l.status}</span>
                </div>
                <h3>{l.title}</h3>
                <p className="listing-desc">{l.description}</p>
                <div className="listing-meta"><span>Weight: {l.weight} {l.unit}</span><span>Price: ৳{l.price.toFixed(2)}</span></div>
                <div className="listing-meta"><span>Address: {l.address}</span></div>
                {l.status === 'Available' && (
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    <button onClick={() => openEditModal(l)} style={{flex:1,background:'#6b7280'}}>Edit</button>
                    <button onClick={() => handleDelete(l._id)} style={{background:'#ef4444',flex:1}}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Listing" : "Create Listing"}>
        <form onSubmit={handleSubmit}>
          <label>Title<input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. 50 plastic bottles" /></label>
          <label>Description<textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{resize:'none',padding:'11px 13px',border:'1px solid #d6dbd9',borderRadius:8,fontSize:14}} /></label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <label>Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
            <label>Weight<div style={{display:'flex',gap:4}}><input required type="number" step="any" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /><select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} style={{width:70}}><option value="kg">kg</option><option value="lbs">lbs</option><option value="items">items</option></select></div></label>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <label>Price (BDT)<input required type="number" step="any" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></label>
            <label>Image URL<input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="optional" /></label>
          </div>
          <label>Pickup Address<input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></label>
          <button type="submit">{editingId ? "Update Listing" : "Create Listing"}</button>
        </form>
      </Modal>
    </div>
  );
};
export default MyListings;
