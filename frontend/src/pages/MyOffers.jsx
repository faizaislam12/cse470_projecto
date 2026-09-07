import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const MyOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [pag, setPag] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ scheduledDate: '', timeSlot: 'morning', address: '', contactPhone: '', specialInstructions: '' });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = { page: pag.page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/offers/my', { params });
      setOffers(data.offers);
      setPag(data.pagination);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to load offers'); }
    setLoading(false);
  };

  useEffect(() => { setPag(p => ({ ...p, page: 1 })); }, [statusFilter]);
  useEffect(() => { fetchOffers(); }, [pag.page, statusFilter]);

  const handleWithdraw = async (offerId) => {
    if (!window.confirm('Withdraw this offer?')) return;
    try { await api.put(`/offers/${offerId}/withdraw`); fetchOffers(); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed to withdraw'); }
  };

  const respondCounter = async (offerId, idx, decision) => {
    try { await api.put(`/offers/${offerId}/counter/${idx}/${decision}`); setMsg(decision === 'accept' ? 'Counter offer accepted!' : 'Counter offer rejected.'); fetchOffers(); }
    catch (err) { setMsg(err.response?.data?.message || 'Action failed'); }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pickups', { offerId: showScheduleModal, ...scheduleForm });
      setMsg('Pickup scheduled! Track it under Pickups.');
      setShowScheduleModal(null);
      setScheduleForm({ scheduledDate: '', timeSlot: 'morning', address: '', contactPhone: '', specialInstructions: '' });
      fetchOffers();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to schedule pickup'); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>My Offers</h1><p className="subtitle">Your bids on marketplace listings.</p></div></div>
      {msg && <div className="success">{msg}</div>}
      <div className="filter-bar">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'accepted', 'rejected', 'countered', 'withdrawn'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
        offers.length === 0 ? <div className="empty-state">No offers yet. <Link to="/marketplace">Browse Marketplace</Link></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {offers.map(offer => (
            <div key={offer._id} style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 4px 16px rgba(20,96,63,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <strong>{offer.listing?.title || 'Listing'}</strong>
                  <p style={{ color: '#666', fontSize: 13 }}>{offer.listing?.weight} {offer.listing?.unit}{offer.listing?.address ? ` | ${offer.listing.address}` : ''}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>৳{Number(offer.offerPrice || 0).toFixed(2)}</div>
                  <span className={`status-badge ${offer.status}`} style={{ position: 'static', marginTop: 4, display: 'inline-block' }}>{offer.status}</span>
                </div>
              </div>
              {offer.message && <p style={{ color: '#666', fontSize: 13, fontStyle: 'italic', marginTop: 6 }}>"{offer.message}"</p>}

              {offer.counterOffers?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                  <strong style={{ fontSize: 13 }}>Counter offers:</strong>
                  {offer.counterOffers.map((co, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                      <strong style={{ color: '#7c3aed' }}>৳{Number(co.price).toFixed(2)}</strong>
                      <span className={`status-badge ${co.status}`} style={{ position: 'static', fontSize: 10 }}>{co.status}</span>
                      {co.message && <span style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>"{co.message}"</span>}
                      {co.status === 'pending' && (
                        <span style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => respondCounter(offer._id, idx, 'accept')} style={{ background: '#16a34a', padding: '4px 12px', fontSize: 13 }}>Accept</button>
                          <button onClick={() => respondCounter(offer._id, idx, 'reject')} style={{ background: '#dc2626', padding: '4px 12px', fontSize: 13 }}>Reject</button>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pending', 'countered'].includes(offer.status) && (
                  <button onClick={() => handleWithdraw(offer._id)} style={{ background: '#6b7280' }}>Withdraw</button>
                )}
                {offer.listing?._id && <Link to={`/marketplace/${offer.listing._id}`}><button style={{ background: '#0d9488' }}>View Listing</button></Link>}
                {offer.status === 'accepted' && (
                  <button onClick={() => setShowScheduleModal(offer._id)} style={{ background: '#0284c7' }}>Schedule Pickup</button>
                )}
              </div>
            </div>
          ))}
          {pag.pages > 1 && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {Array.from({ length: pag.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPag({ ...pag, page: p })} style={{ background: pag.page === p ? '#15803d' : '#e5e7eb', color: pag.page === p ? '#fff' : '#333', padding: '6px 12px', fontWeight: 600 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      }

      <Modal isOpen={!!showScheduleModal} onClose={() => setShowScheduleModal(null)} title="Schedule Pickup">
        <form onSubmit={handleSchedule}>
          <label>Date</label>
          <input type="date" required value={scheduleForm.scheduledDate} min={new Date().toISOString().split('T')[0]} onChange={e => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })} style={{ marginBottom: 12 }} />
          <label>Time Slot</label>
          <select value={scheduleForm.timeSlot} onChange={e => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })} style={{ marginBottom: 12 }}>
            <option value="morning">Morning (8 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
            <option value="evening">Evening (5 PM - 8 PM)</option>
          </select>
          <label>Address</label>
          <input required value={scheduleForm.address} onChange={e => setScheduleForm({ ...scheduleForm, address: e.target.value })} placeholder="Pickup address" style={{ marginBottom: 12 }} />
          <label>Contact Phone</label>
          <input required value={scheduleForm.contactPhone} onChange={e => setScheduleForm({ ...scheduleForm, contactPhone: e.target.value })} placeholder="Phone number" style={{ marginBottom: 12 }} />
          <label>Special Instructions</label>
          <textarea rows={2} value={scheduleForm.specialInstructions} onChange={e => setScheduleForm({ ...scheduleForm, specialInstructions: e.target.value })} style={{ resize: 'none', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 16 }} />
          <button type="submit">Schedule</button>
        </form>
      </Modal>
    </div>
  );
};
export default MyOffers;