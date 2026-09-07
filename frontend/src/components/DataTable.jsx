const dark = {
  wrapper: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(52, 211, 153, 0.16)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(14px)' },
  th: { background: 'rgba(16, 185, 129, 0.14)', color: '#86efac' },
  td: { color: 'rgba(233, 253, 245, 0.85)' },
  rowAlt: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  emptyColor: 'rgba(233, 253, 245, 0.4)',
};
const light = {
  wrapper: { overflowX: 'auto', borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px rgba(20,96,63,0.06)' },
  th: { background: '#f0fdf4', color: '#1a2e23' },
  td: { color: '#333' },
  rowAlt: '#fafcfa',
  border: '1px solid #eef2f0',
  emptyColor: '#999',
};

const DataTable = ({ columns, rows, empty = 'No records found.', rowKey = '_id', glass = false }) => {
  const s = glass ? dark : light;
  const cell = (extra = {}) => ({ textAlign: 'left', padding: '10px 12px', ...extra });

  return (
    <div className="eco-scrollbar" style={s.wrapper}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640, fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={cell({ ...s.th, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: glass ? '1px solid rgba(52,211,153,0.25)' : '2px solid #d1fae5' })}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={cell({ textAlign: 'center', color: s.emptyColor, padding: 28 })}>{empty}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row[rowKey] ?? i} style={{ background: i % 2 ? s.rowAlt : 'transparent' }}>
                {columns.map((c) => (
                  <td key={c.key} style={cell({ ...s.td, borderBottom: s.border })}>
                    {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;