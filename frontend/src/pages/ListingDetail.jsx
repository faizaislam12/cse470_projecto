import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/listings/${id}`);
      setListing(data.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to load listing');
    }
    setLoading(false);
  };

  useEffect(() => { fetchListing(); }, [id]);

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/offers', {
        listingId: listing._id,
        offerPrice: parseFloat(offerPrice),
        message: offerMessage,
      });
      setMsg('Offer submitted! The owner will review it.');
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferMessage('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit offer');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;
  if (!listing) return <div className="empty-state">{msg || 'Listing not found'}</div>;

  const isOwner = user && listing.owner?._id?.toString() === user?.id?.toString();
  const canOffer = user && ['collector'].includes(user.role) && listing.status === 'Available' && !isOwner;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} style={{ background: '#6b7280', marginBottom: 16 }}>← Back</button>
      {msg && <div className={msg.includes('Offer') ? 'success' : 'error'}>{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="cat-tag">{listing.category?.name || 'Uncategorized'}</span>
          <h1>{listing.title}</h1>
          <p className="subtitle" style={{ margin: '6px 0 0' }}>Listed by {listing.owner?.name || 'User'} ({listing.owner?.role || 'unknown'})</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`status-badge ${listing.status?.toLowerCase()}`} style={{ position: 'static' }}>{listing.status}</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', marginTop: 8 }}>৳{Number(listing.price || 0).toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, background: '#fff', padding: 20, borderRadius: 14, boxShadow: '0 4px 16px rgba(20,96,63,0.06)' }}>
        <div>
          <p><strong>Weight:</strong> {listing.weight} {listing.unit}</p>
          <p><strong>Category:</strong> {listing.category?.name || '—'}</p>
          <p><strong>Price:</strong> ৳{Number(listing.price || 0).toFixed(2)}</p>
        </div>
        <div>
          <p><strong>Address:</strong> {listing.address}</p>
          <p><strong>Status:</strong> {listing.status}</p>
          {listing.image && <p><strong>Image:</strong> <a href={listing.image} target="_blank" rel="noreferrer">view</a></p>}
        </div>
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 14, marginTop: 16, boxShadow: '0 4px 16px rgba(20,96,63,0.06)' }}>
        <strong>Description</strong>
        <p style={{ color: '#555', marginTop: 6 }}>{listing.description}</p>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {canOffer && (
          <button onClick={() => setShowOfferModal(true)}>Make an Offer</button>
        )}
        {isOwner && (listing.status === 'Available' || listing.status === 'Pending') && (
          <Link to={`/marketplace/${listing._id}/offers`}><button>View Offers</button></Link>
        )}
        {isOwner && listing.status === 'Available' && (
          <Link to="/my-listings"><button style={{ background: '#6b7280' }}>Edit Listing</button></Link>
        )}
      </div>

      <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Make an Offer">
        <form onSubmit={handleMakeOffer}>
          <label>Offer Price (BDT)</label>
          <input type="number" step="any" min="0" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} required placeholder="0.00" style={{ marginBottom: 12 }} />
          <label>Message (optional)</label>
          <textarea rows={3} value={offerMessage} onChange={e => setOfferMessage(e.target.value)} placeholder="Describe your offer or pickup plan..." style={{ resize: 'none', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 16 }} />
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Offer'}</button>
        </form>
      </Modal>
    </div>
  );
};
export default ListingDetail;