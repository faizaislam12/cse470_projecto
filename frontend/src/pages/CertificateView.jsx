import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const CertificateView = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/certificates/${id}`);
        setCertificate(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found.');
      }
      setLoading(false);
    };
    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="page-container">
        <div className="error">{error}</div>
        <Link to="/certificates">← Back to Certificates</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="certificate-view-actions">
        <Link to="/certificates">← Back to Certificates</Link>
        <button onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
      </div>

      <div className="certificate-print">
        <div className="certificate-print-border">
          <div className="certificate-print-icon">🌿</div>
          <div className="certificate-print-brand">GreenLoop</div>
          <div className="certificate-print-heading">Certificate of Recognition</div>
          <p className="certificate-print-body">This certificate is proudly presented to</p>
          <div className="certificate-print-name">{certificate.user?.name}</div>
          <p className="certificate-print-body">
            for reaching the <strong>{certificate.milestoneKg} kg</strong> recycling milestone —
            <br />"{certificate.title}" ({certificate.tier})
          </p>

          <div className="certificate-print-stats">
            <div><strong>{certificate.impactSnapshot?.totalWeight} kg</strong><span>Total Recycled</span></div>
            <div><strong>{certificate.impactSnapshot?.co2SavedKg} kg</strong><span>CO₂ Saved</span></div>
            <div><strong>{certificate.impactSnapshot?.ecoPoints}</strong><span>EcoPoints Earned</span></div>
          </div>

          <div className="certificate-print-footer">
            <span>Issued {new Date(certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Code: {certificate.certificateCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
