import React, { useState } from 'react';
import { login, register } from '../services/authService';

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'household' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login' ? await login({ email: form.email, password: form.password }) : await register(form);

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      onAuthenticated(res.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold text-green-700">
        {mode === 'login' ? 'Log in' : 'Register'}
      </h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
              <option value="household">Household</option>
              <option value="collector">Collector</option>
              <option value="recycling_company">Recycling Company</option>
              <option value="business">Business</option>
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="text-sm text-blue-600 hover:underline w-full text-center"
      >
        {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
