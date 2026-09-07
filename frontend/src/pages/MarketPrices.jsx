import { useState, useEffect } from 'react';
import api from '../api/axios';

const MarketPrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => { fetchPrices(); }, []);
  const fetchPrices = async () => { setLoading(true); try { const {data} = await api.get('/prices'); setPrices(data.data); } catch {} setLoading(false); };
  const simulate = async () => {
    setSimulating(true);
    try { const {data} = await api.post('/prices/simulate'); setPrices(data.data); } catch {}
    setSimulating(false);
  };

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>Market Price Dashboard</h1><p className="subtitle">Current recyclable material rates and trends.</p></div>
        <div style={{display:'flex',gap:8}}><button onClick={fetchPrices} style={{background:'#6b7280'}}>Refresh</button><button onClick={simulate} disabled={simulating}>{simulating ? 'Simulating...' : '▶ Simulate Trends'}</button></div>
      </div>
      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
        prices.length === 0 ? <div className="empty-state">No pricing data. Run seed script first.</div> :
        <div className="price-grid">
          {prices.map(p => (
            <div key={p._id} className="price-card">
              <div className="price-card-top"><h3>{p.category?.name}</h3><span className={`trend trend-${p.trend.toLowerCase()}`}>{p.trend === 'Up' ? '📈' : p.trend === 'Down' ? '📉' : '➖'} {p.trend}</span></div>
              <div className="price-main"><span className="price-big">${p.currentPrice.toFixed(2)}</span><span className="price-unit">/ {p.unit}</span></div>
              <div className="price-reward">🌱 +{p.category?.defaultPointsPerKg || 10} pts / {p.unit}</div>
              {p.priceHistory?.length > 0 && (
                <div className="price-history">
                  <small>Recent trend:</small>
                  <div className="sparkline">
                    {p.priceHistory.slice(-5).map((h, i) => {
                      const vals = p.priceHistory.map(x=>x.price);
                      const mn = Math.min(...vals)*0.9, mx = Math.max(...vals)*1.1;
                      const pct = ((h.price - mn) / (mx - mn || 1)) * 100;
                      return <div key={i} className="spark-col"><span>${h.price.toFixed(2)}</span><div className="spark-bar" style={{height: Math.max(8, Math.min(32, pct))+'px', background: p.trend === 'Up' ? '#10b981' : p.trend === 'Down' ? '#ef4444' : '#06b6d4'}}></div></div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
};
export default MarketPrices;
