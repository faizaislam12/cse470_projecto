import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const ALLOWED_NEXT = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['en_route', 'cancelled'],
  en_route: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
};

const STATUS_ORDER = ['scheduled', 'confirmed', 'en_route', 'in_progress', 'completed', 'cancelled', 'rescheduled'];
const badWordStyle = { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' };
const BADGE_COLORS = {
  scheduled: { bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  confirmed: { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  en_route: { bg: 'rgba(6,182,212,0.15)', fg: '#22d3ee' },
  in_progress: { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  completed: { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', fg: '#f87171' },
  rescheduled: { bg: 'rgba(139,92,246,0.15)', fg: '#a78bfa' },
};

const MyPickups = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [expandId, setExpandId] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [reschedule, setReschedule] = useState(null);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pickups', { params: statusFilter ? { status: statusFilter } : {} });
      setPickups(data.data);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to load pickups'); }
    setLoading(false);
  };

  useEffect(() => { fetchPickups(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatus = async (pickupId, status) => {
    try {
      await api.patch(`/pickups/${pickupId}/status`, { status, note: statusNote || undefined });
      setMsg(status === 'completed' ? 'Pickup completed!' : `Pickup marked ${status}.`);
      setConfirmStatus(null);
      setStatusNote('');
      fetchPickups();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to update status'); }
  };

  const doReschedule = async () => {
    if (!reschedule) return;
    try {
      await api.patch(`/pickups/${reschedule.pickupId}/reschedule`, {
        scheduledDate: reschedule.scheduledDate,
        timeSlot: reschedule.timeSlot,
      });
      setMsg('Pickup rescheduled.');
      setReschedule(null);
      fetchPickups();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to reschedule'); }
  };

  const isCollector = user?.role === 'collector';

  const iAmOwner = (pickup) =>
    [String(pickup.household?._id), String(pickup.collector?._id)].includes(String(user?.id)) ||
    String(pickup.household?._id) === String(user?._id) ||
    String(pickup.collector?._id) === String(user?._id);

  return (
    <div className="eco-dark">
      <div className="page-container">
        <div className="page-header"><div><h1>My Pickups</h1><p className="subtitle">Scheduled collections and live status tracking.</p></div></div>
        {msg && <div className="success">{msg}</div>}
        <div className="filter-bar">
          <select className="eco-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
          pickups.length === 0 ? <div className="empty-state">No pickups yet. Schedule one from an accepted offer.</div> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pickups.map(pickup => {
              const badge = BADGE_COLORS[pickup.status] || BADGE_COLORS.scheduled;
              const nextSteps = isCollector && pickup.status !== 'completed' && pickup.status !== 'cancelled' ? (ALLOWED_NEXT[pickup.status] || []) : [];
              const iAmCollector = isCollector && pickup.collector?._id?.toString() === user?.id?.toString();
              return (
                <div key={pickup._id} className="eco-glass" style={{ borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <strong>{pickup.listing?.title || 'Listing'}</strong>
                      <p className="eco-muted" style={{ fontSize: 13 }}>{pickup.listing?.weight} {pickup.listing?.unit} | {isCollector ? `Household: ${pickup.household?.name}` : `Collector: ${pickup.collector?.name}`}</p>
                      <p style={{ color: 'rgba(233,253,245,0.55)', fontSize: 12 }}>{new Date(pickup.scheduledDate).toLocaleDateString()} | {pickup.timeSlot} | {pickup.address}</p>
                      {pickup.specialInstructions && <p className="eco-muted" style={{ fontSize: 12, fontStyle: 'italic' }}>Note: {pickup.specialInstructions}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ ...badWordStyle, background: badge.bg, color: badge.fg }}>{pickup.status.replace('_', ' ')}</span>
                      <div><button className="eco-ghost-btn" onClick={() => setExpandId(expandId === pickup._id ? null : pickup._id)}>{expandId === pickup._id ? 'Hide tracking ▲' : 'Track pickup ▾'}</button></div>
                    </div>
                  </div>

                  {expandId === pickup._id && (
                    <div style={{ marginTop: 12, padding: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <strong style={{ fontSize: 13, color: '#86efac' }}>Status history</strong>
                      {pickup.statusHistory?.length ? (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {pickup.statusHistory.map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(233,253,245,0.8)' }}>
                              <span style={{ fontWeight: 700, color: BADGE_COLORS[h.status]?.fg || '#34d399', minWidth: 90, textTransform: 'capitalize' }}>{h.status.replace('_', ' ')}</span>
                              <span>{new Date(h.changedAt).toLocaleString()}</span>
                              {h.note && <span className="eco-muted" style={{ fontStyle: 'italic' }}>"{h.note}"</span>}
                            </div>
                          ))}
                        </div>
                      ) : <p className="eco-muted" style={{ fontSize: 13 }}>No history.</p>}
                    </div>
                  )}

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {iAmOwner(pickup) && !['completed', 'cancelled'].includes(pickup.status) && (
                      <button className="eco-ghost-btn" onClick={() => setReschedule({ pickupId: pickup._id, scheduledDate: new Date(pickup.scheduledDate).toISOString().slice(0, 10), timeSlot: pickup.timeSlot })}>⟳ Reschedule</button>
                    )}
                    {iAmCollector && nextSteps.length > 0 && pickup.status !== 'completed' && (
                      nextSteps.map(s => (
                        <button key={s} onClick={() => setConfirmStatus({ pickupId: pickup._id, status: s })} className={s === 'cancelled' ? 'eco-danger-btn' : 'eco-gradient-btn'} style={{ padding: '10px 14px', fontSize: 13 }}>
                          Mark {s.replace('_', ' ')}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        }

        <Modal isOpen={!!confirmStatus} onClose={() => { setConfirmStatus(null); setStatusNote(''); }} title={`Mark pickup ${confirmStatus?.status?.replace('_', ' ')}?`}>
          <label>Note (optional)</label>
          <textarea rows={3} value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="Add a note..." style={{ resize: 'none', padding: '11px 13px', borderRadius: 8, fontSize: 14, width: '100%', margin: '8px 0 16px' }} />
          <button className={confirmStatus?.status === 'cancelled' ? 'eco-danger-btn' : 'eco-gradient-btn'} onClick={() => confirmStatus && handleStatus(confirmStatus.pickupId, confirmStatus.status)}>Confirm</button>
        </Modal>

        <Modal isOpen={!!reschedule} onClose={() => setReschedule(null)} title="Reschedule Pickup">
          <label>New Date<input type="date" value={reschedule?.scheduledDate || ''} onChange={e => setReschedule({ ...reschedule, scheduledDate: e.target.value })} /></label>
          <label>Time Slot
            <select value={reschedule?.timeSlot || 'morning'} onChange={e => setReschedule({ ...reschedule, timeSlot: e.target.value })}>
              <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option>
            </select>
          </label>
          <button className="eco-gradient-btn" onClick={doReschedule} disabled={!reschedule?.scheduledDate}>Save Reschedule</button>
        </Modal>
      </div>
    </div>
  );
};
export default MyPickups;