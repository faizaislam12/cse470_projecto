import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';

const ListingOffers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCounterModal, setShowCounterModal] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const listingRes = await api.get(`/listings/${id}`);
      const offersRes = await api.get(`/offers/listing/${id}`);
      setListing(listingRes.data.data);
      setOffers(offersRes.data);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to load offers'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAccept = async (offerId) => {
    if (!window.confirm('Accept this offer? Other pending offers will be rejected.')) return;
    try { await api.put(`/offers/${offerId}/accept`); setMsg('Offer accepted! Schedule the pickup.'); fetchData(); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed to accept offer'); }
  };

  const handleReject = async (offerId) => {
    if (!window.confirm('Reject this offer?')) return;
    try { await api.put(`/offers/${offerId}/reject`); fetchData(); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed to reject offer'); }
  };

  const handleCounter = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/offers/${showCounterModal}/counter`, {
        price: parseFloat(counterPrice),
        message: counterMessage,
      });
      setMsg('Counter offer sent to the collector.');
      setShowCounterModal(null);
      setCounterPrice('');
      setCounterMessage('');
      fetchData();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to send counter offer'); }
  };

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} style={{ background: '#6b7280', marginBottom: 16 }}>← Back</button>
      <div className="page-header"><div><h1>Offers for your listing</h1><p className="subtitle">{listing?.title} — accept, reject, or counter each bid.</p></div></div>
      {msg && <div className="success">{msg}</div>}

      {offers.length === 0 ? (
        <div className="empty-state">No offers received yet. Share your listing so collectors can bid!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {offers.map(offer => (
            <div key={offer._id} style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 4px 16px rgba(20,96,63,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <strong>{offer.collector?.name || 'Collector'}</strong>
                  <p style={{ color: '#666', fontSize: 13 }}>{offer.collector?.email}{offer.collector?.phone ? ` | ${offer.collector.phone}` : ''}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>৳{Number(offer.offerPrice || 0).toFixed(2)}</div>
                  <span className={`status-badge ${offer.status}`} style={{ position: 'static', marginTop: 4, display: 'inline-block' }}>{offer.status}</span>
                </div>
              </div>
              {offer.message && <p style={{ color: '#666', fontSize: 13, fontStyle: 'italic', marginTop: 6 }}>"{offer.message}"</p>}

              {offer.counterOffers?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                  <strong style={{ fontSize: 13 }}>Negotiation history:</strong>
                  {offer.counterOffers.map((co, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, fontSize: 14 }}>
                      <strong style={{ color: '#7c3aed' }}>৳{Number(co.price).toFixed(2)}</strong>
                      <span style={{ fontSize: 12, color: '#888' }}>by {co.offeredBy?.name || 'You'}</span>
                      <span className={`status-badge ${co.status}`} style={{ position: 'static', fontSize: 10 }}>{co.status}</span>
                      {co.message && <span style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>"{co.message}"</span>}
                    </div>
                  ))}
                </div>
              )}

              {listing?.status === 'Available' && ['pending', 'countered'].includes(offer.status) && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleAccept(offer._id)} style={{ background: '#16a34a' }}>Accept</button>
                  <button onClick={() => handleReject(offer._id)} style={{ background: '#dc2626' }}>Reject</button>
                  <button onClick={() => { setShowCounterModal(offer._id); setCounterPrice(offer.offerPrice || listing.price || ''); }} style={{ background: '#7c3aed' }}>Counter Offer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!showCounterModal} onClose={() => setShowCounterModal(null)} title="Send Counter Offer">
        <form onSubmit={handleCounter}>
          <label>Your Price (BDT)</label>
          <input type="number" step="any" min="0" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} required style={{ marginBottom: 12 }} />
          <label>Message</label>
          <textarea rows={3} value={counterMessage} onChange={e => setCounterMessage(e.target.value)} placeholder="Explain your counter..." style={{ resize: 'none', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 16 }} />
          <button type="submit">Send Counter</button>
        </form>
      </Modal>
    </div>
  );
};
export default ListingOffers;