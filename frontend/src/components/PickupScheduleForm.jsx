import React, { useState } from 'react';
import { schedulePickup } from '../services/pickupService';

const initialState = {
  listingId: '',
  collectorId: '',
  acceptedOfferId: '',
  scheduledDate: '',
  timeSlot: 'morning',
  address: { line1: '', line2: '', city: '', postalCode: '' },
  contactPhone: '',
  specialInstructions: '',
};

export default function PickupScheduleForm({ listingId, collectorId, acceptedOfferId, onScheduled }) {
  const [form, setForm] = useState({ ...initialState, listingId, collectorId, acceptedOfferId });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await schedulePickup(form);
      if (onScheduled) onScheduled(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule pickup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-green-700">Schedule Pickup</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Pickup Date</label>
        <input
          type="date"
          name="scheduledDate"
          value={form.scheduledDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Time Slot</label>
        <select
          name="timeSlot"
          value={form.timeSlot}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="morning">Morning (8am - 12pm)</option>
          <option value="afternoon">Afternoon (12pm - 4pm)</option>
          <option value="evening">Evening (4pm - 7pm)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="address.line1"
          placeholder="Address line 1"
          value={form.address.line1}
          onChange={handleChange}
          required
          className="border rounded-lg px-3 py-2 col-span-2"
        />
        <input
          name="address.line2"
          placeholder="Address line 2 (optional)"
          value={form.address.line2}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 col-span-2"
        />
        <input
          name="address.city"
          placeholder="City"
          value={form.address.city}
          onChange={handleChange}
          required
          className="border rounded-lg px-3 py-2"
        />
        <input
          name="address.postalCode"
          placeholder="Postal Code"
          value={form.address.postalCode}
          onChange={handleChange}
          required
          className="border rounded-lg px-3 py-2"
        />
      </div>

      <input
        name="contactPhone"
        placeholder="Contact phone"
        value={form.contactPhone}
        onChange={handleChange}
        required
        className="w-full border rounded-lg px-3 py-2"
      />

      <textarea
        name="specialInstructions"
        placeholder="Special instructions (optional)"
        value={form.specialInstructions}
        onChange={handleChange}
        maxLength={500}
        rows={3}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
      >
        {loading ? 'Scheduling...' : 'Confirm Pickup'}
      </button>
    </form>
  );
}
