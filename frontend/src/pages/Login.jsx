import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage } from '../utils/getErrorMessage';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Log in to GreenLoop</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <div style={{position:'relative'}}>
            <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required style={{paddingRight:40}} />
            <span onClick={() => setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer',fontSize:14,color:'#888',userSelect:'none'}}>{showPw ? '🙈' : '👁️'}</span>
          </div>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
