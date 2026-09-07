import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TIER_COLORS = { Bronze: '#b45309', Silver: '#64748b', Gold: '#ca8a04', Platinum: '#7c3aed' };

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/certificates/mine');
        setCertificates(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificates.');
      }
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Digital Recycling Certificates</h1>
          <p className="subtitle">Earned automatically as your total recycled weight crosses each milestone.</p>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 20 }}>{error}</div>}

      {certificates.length === 0 ? (
        <div className="empty-state">
          No certificates yet. Recycle at least 10kg to earn your first one!
        </div>
      ) : (
        <div className="certificate-grid">
          {certificates.map((c) => (
            <Link key={c._id} to={`/certificates/${c._id}`} className="certificate-card">
              <div className="certificate-card-tier" style={{ background: TIER_COLORS[c.tier] || '#10b981' }}>
                {c.tier}
              </div>
              <div className="certificate-card-icon">🏆</div>
              <div className="certificate-card-title">{c.title}</div>
              <div className="certificate-card-meta">{c.milestoneKg} kg milestone</div>
              <div className="certificate-card-date">
                {new Date(c.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
