import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MATERIAL_ITEMS = [
  { name: 'Plastic Bottle (PET)', category: 'Plastic', recyclable: true, disposal: 'Rinse, remove cap, flatten and place in recycling bin.', tip: 'PET bottles are the most commonly recycled plastic.' },
  { name: 'Plastic Bag', category: 'Plastic', recyclable: false, disposal: 'Return to grocery store collection bins. Do NOT put in curbside recycling.', tip: 'Plastic bags jam sorting machines at recycling facilities.' },
  { name: 'HDPE Container', category: 'Plastic', recyclable: true, disposal: 'Rinse out residue, place in recycling bin with lid on.', tip: 'Milk jugs, detergent bottles, and shampoo bottles are HDPE.' },
  { name: 'Plastic Wrapper', category: 'Plastic', recyclable: false, disposal: 'Dispose in general waste. Some soft plastic collection points may accept them.', tip: 'Chip bags, candy wrappers, and cling wrap are not recyclable.' },
  { name: 'Newspaper', category: 'Paper & Cardboard', recyclable: true, disposal: 'Keep dry, stack neatly and place in recycling bin.', tip: 'Newspaper is one of the easiest materials to recycle.' },
  { name: 'Cardboard Box', category: 'Paper & Cardboard', recyclable: true, disposal: 'Remove tape and staples, flatten and place in recycling bin.', tip: 'Flatten boxes to save space and make collection easier.' },
  { name: 'Office Paper', category: 'Paper & Cardboard', recyclable: true, disposal: 'Remove staples and paper clips, place in recycling bin.', tip: 'Shredded paper can be recycled but may need to be bagged.' },
  { name: 'Pizza Box (greasy)', category: 'Paper & Cardboard', recyclable: false, disposal: 'Compost if available, otherwise dispose in general waste.', tip: 'Grease contamination prevents paper fibers from being recycled.' },
  { name: 'Aluminum Can', category: 'Metal', recyclable: true, disposal: 'Rinse briefly, crush if possible, place in recycling bin.', tip: 'Aluminum can be recycled indefinitely without quality loss.' },
  { name: 'Tin Can', category: 'Metal', recyclable: true, disposal: 'Rinse, remove label if possible, place in recycling bin.', tip: 'Steel/tin cans are magnetically separated at recycling plants.' },
  { name: 'Copper Wire', category: 'Metal', recyclable: true, disposal: 'Collect and bring to a scrap metal dealer or recycling center.', tip: 'Copper is one of the most valuable recyclable metals.' },
  { name: 'Iron Scrap', category: 'Metal', recyclable: true, disposal: 'Collect and bring to a scrap metal dealer or recycling center.', tip: 'Iron and steel are the most recycled materials in the world.' },
  { name: 'Glass Jar', category: 'Glass', recyclable: true, disposal: 'Rinse, remove lid, place in glass recycling bin. Sort by color if required.', tip: 'Glass can be recycled endlessly without losing purity.' },
  { name: 'Glass Bottle', category: 'Glass', recyclable: true, disposal: 'Rinse and place in glass recycling bin.', tip: 'Remove corks and caps before recycling.' },
  { name: 'Broken Glassware', category: 'Glass', recyclable: false, disposal: 'Wrap in newspaper, label as "sharp", dispose in general waste.', tip: 'Tempered glass, mirrors, and ceramics cannot go in glass recycling.' },
  { name: 'Old Smartphone', category: 'E-Waste', recyclable: true, disposal: 'Take to an authorized e-waste collection point or electronics recycler.', tip: 'Wipe personal data before recycling. Contains recoverable precious metals.' },
  { name: 'Battery', category: 'E-Waste', recyclable: true, disposal: 'Never throw in regular trash. Take to a battery collection point.', tip: 'Batteries contain heavy metals that are hazardous in landfills.' },
  { name: 'Charger / Cable', category: 'E-Waste', recyclable: true, disposal: 'Bring to an e-waste recycler or electronics store drop-off.', tip: 'Cables contain copper and plastic that can both be recovered.' },
  { name: 'CRT Monitor', category: 'E-Waste', recyclable: true, disposal: 'Must be handled by certified e-waste recyclers due to lead content.', tip: 'CRT monitors contain lead and require special processing.' },
];

const CAT_COLORS = {
  'Plastic': { bg: '#eef6ff', border: '#3b82f6', text: '#1e40af' },
  'Paper & Cardboard': { bg: '#fef9ee', border: '#f59e0b', text: '#92400e' },
  'Metal': { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
  'Glass': { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d' },
  'E-Waste': { bg: '#faf5ff', border: '#8b5cf6', text: '#5b21b6' },
};

const MaterialGuide = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const filtered = MATERIAL_ITEMS.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const uniqueCats = [...new Set(MATERIAL_ITEMS.map(i => i.category))];

  const handleListItem = (item) => {
    const matchedCat = categories.find(c => c.name === item.category);
    const params = new URLSearchParams();
    if (matchedCat) params.set('category', matchedCat._id);
    params.set('title', item.name);
    navigate(`/my-listings?${params.toString()}`);
  };

  return (
    <div className="page-container">
      <div className="page-hero">
        <h1>Material Guide</h1>
        <p className="subtitle">Search any item to check if it's recyclable and learn how to dispose of it properly.</p>
      </div>

      <form className="filter-bar" onSubmit={e => e.preventDefault()}>
        <input
          placeholder="Search items (e.g. plastic bottle, battery, glass jar)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || catFilter) && (
          <button type="button" onClick={() => { setSearch(''); setCatFilter(''); }} style={{background:'#6b7280'}}>Reset</button>
        )}
      </form>

      {filtered.length === 0 ? (
        <div className="empty-state">No items found matching your search.</div>
      ) : (
        <div className="material-grid">
          {filtered.map((item, i) => {
            const colors = CAT_COLORS[item.category] || { bg: '#f9fafb', border: '#9ca3af', text: '#374151' };
            return (
              <div
                key={i}
                className={`material-card ${selectedItem === i ? 'expanded' : ''}`}
                style={{ borderLeft: `4px solid ${colors.border}` }}
                onClick={() => setSelectedItem(selectedItem === i ? null : i)}
              >
                <div className="material-card-top">
                  <div>
                    <span className="material-cat" style={{ background: colors.bg, color: colors.text }}>{item.category}</span>
                    <h3>{item.name}</h3>
                  </div>
                  <span className={`recyclable-badge ${item.recyclable ? 'yes' : 'no'}`}>
                    {item.recyclable ? 'Recyclable' : 'Not Recyclable'}
                  </span>
                </div>

                {selectedItem === i && (
                  <div className="material-details">
                    <div className="detail-row">
                      <strong>How to dispose:</strong>
                      <p>{item.disposal}</p>
                    </div>
                    <div className="detail-row">
                      <strong>Did you know?</strong>
                      <p>{item.tip}</p>
                    </div>
                    {item.recyclable && (
                      <button onClick={(e) => { e.stopPropagation(); handleListItem(item); }} className="btn-list-item">
                        List This Item in Marketplace
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaterialGuide;
