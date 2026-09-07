const cellStyle = { textAlign: 'left', padding: '10px 12px' };

const DataTable = ({ columns, rows, empty = 'No records found.', rowKey = '_id' }) => (
  <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(20,96,63,0.06)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640, fontSize: 13 }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{ ...cellStyle, background: '#f0fdf4', color: '#1a2e23', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #d1fae5' }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ ...cellStyle, textAlign: 'center', color: '#999', padding: 28 }}>{empty}</td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={row[rowKey] ?? i} style={{ background: i % 2 ? '#fafcfa' : '#fff' }}>
              {columns.map((c) => (
                <td key={c.key} style={{ ...cellStyle, borderBottom: '1px solid #eef2f0', color: c.color || '#333', ...(c.render ? {} : {}) }}>
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

export default DataTable;