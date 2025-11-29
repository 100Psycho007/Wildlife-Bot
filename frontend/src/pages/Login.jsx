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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦁</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Wildlife Emergency
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Responder Dashboard
          </p>
        </div>
        
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
            style={{ 
              width: '100%',
              background: loading ? '#94a3b8' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms',
              boxShadow: loading ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#1d4ed8')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#2563eb')}
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
