import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      login(response.data.user, {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
          Wildlife Responder Dashboard
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
              placeholder="admin@wildlife-demo.local"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
              placeholder="demo123"
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fee2e2', 
              color: '#991b1b', 
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          padding: '12px', 
          background: '#f9fafb', 
          borderRadius: '4px',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <strong>Demo Login Credentials:</strong><br />
          <div style={{ marginTop: '8px' }}>
            <strong>Admin:</strong><br />
            admin@wildlife-demo.local / demo123
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Responders:</strong><br />
            amit.patel@wildlifengo.in / responder123<br />
            rajesh.kumar@rescue.in / responder123<br />
            priya.sharma@forest.gov.in / responder123
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
