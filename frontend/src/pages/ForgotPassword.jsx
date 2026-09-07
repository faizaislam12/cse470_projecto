import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage } from '../utils/getErrorMessage';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setPreviewUrl('');
    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Reset your password</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {message && <p className="success">{message}</p>}
        {previewUrl && <p className="success"><a href={previewUrl} target="_blank" rel="noreferrer">Open Reset Email</a></p>}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p>
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
