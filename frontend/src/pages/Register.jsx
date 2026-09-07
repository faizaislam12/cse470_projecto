import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage } from '../utils/getErrorMessage';

const ROLE_OPTIONS = [
  { value: 'household', label: 'Household' },
  { value: 'collector', label: 'Collector' },
  { value: 'recycling_company', label: 'Recycling Company' },
  { value: 'business', label: 'Business' },
  { value: 'admin', label: 'Administrator' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'household' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Create your GreenLoop account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <div style={{position:'relative'}}>
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
              style={{paddingRight:40}}
            />
            <span onClick={() => setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer',fontSize:14,color:'#888',userSelect:'none'}}>{showPw ? '🙈' : '👁️'}</span>
          </div>
        </label>
        <label>
          I am a...
          <select name="role" value={form.role} onChange={handleChange}>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
