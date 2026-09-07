import React, { useEffect, useState, useCallback } from 'react';
import { getMarketplaceListings, getMarketplaceCategories } from '../services/marketplaceService';

export default function CollectorMarketplace({ onViewListing }) {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    minQuantity: '',
    search: '',
    sort: 'newest',
    page: 1,
    limit: 12,
  });
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMarketplaceListings(filters);
      setListings(res.data);
      setMeta({ total: res.total, totalPages: res.totalPages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marketplace.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getMarketplaceCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const goToPage = (page) => {
    if (page < 1 || page > meta.totalPages) return;
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-green-700">Collector Marketplace</h2>
        <p className="text-sm text-gray-500">{meta.total} listings available</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
        <input
          name="search"
          placeholder="Search listings..."
          value={filters.search}
          onChange={handleFilterChange}
          className="border rounded-lg px-3 py-2 sm:col-span-2"
        />

        <select name="category" value={filters.category} onChange={handleFilterChange} className="border rounded-lg px-3 py-2">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleFilterChange}
          className="border rounded-lg px-3 py-2"
        />

        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="border rounded-lg px-3 py-2">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="quantity_high">Quantity: High to Low</option>
          <option value="quantity_low">Quantity: Low to High</option>
        </select>

        <input
          type="number"
          name="minQuantity"
          placeholder="Min qty"
          value={filters.minQuantity}
          onChange={handleFilterChange}
          className="border rounded-lg px-3 py-2"
        />

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 sm:col-span-1">
          Search
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Listings grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-500">No listings match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div
              key={listing._id}
              onClick={() => onViewListing && onViewListing(listing._id)}
              className="bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{listing.category}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
              <div className="flex justify-between items-center text-sm pt-2 border-t">
                <span className="text-gray-600">{listing.quantity} kg</span>
                <span className="text-gray-500">{listing.address?.city}</span>
              </div>
              <div className="text-xs text-gray-400">Posted by {listing.household?.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => goToPage(filters.page - 1)}
            disabled={filters.page <= 1}
            className="px-3 py-1 rounded-lg border disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {filters.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => goToPage(filters.page + 1)}
            disabled={filters.page >= meta.totalPages}
            className="px-3 py-1 rounded-lg border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
