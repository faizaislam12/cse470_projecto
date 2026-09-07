import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';

const CollectorPerformance = () => {
  const { user } = useAuth();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCollectors(); }, []);

  const fetchCollectors = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/collectors'); setCollectors(data.data); } catch {}
    setLoading(false);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">Collector Performance</span></h1><p className="subtitle">Track pickup completion and collection stats for every collector.</p></div>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : (
        <DataTable glass
          columns={[
            { key: 'name', label: 'Collector', render: (c) => <strong>{c.user.name}</strong> },
            { key: 'email', label: 'Email', render: (c) => c.user.email },
            { key: 'totalPickups', label: 'Total', render: (c) => c.totalPickups },
            { key: 'completed', label: 'Completed', render: (c) => c.completedPickups },
            { key: 'successRate', label: 'Success %', render: (c) => (
              <div style={{ minWidth: 110 }}>
                <div className="eco-progress-bar"><div className="eco-progress-fill" style={{ width: `${c.successRate}%` }}></div></div>
                <span style={{ fontSize: 11, color: '#888' }}>{c.successRate}%</span>
              </div>
            ) },
            { key: 'thisMonthPickups', label: 'This Month', render: (c) => c.thisMonthPickups },
            { key: 'totalWeight', label: 'Weight (kg)', render: (c) => c.totalWeight },
            { key: 'totalEarnings', label: 'Earnings', render: (c) => `৳ ${c.totalEarnings}` },
            { key: 'pts', label: 'EcoPoints', render: (c) => c.user.ecoPoints || 0 },
          ]}
          rows={collectors}
          empty="No collectors registered yet."
        />
      )}
    </div>
  );
};

export default CollectorPerformance;
