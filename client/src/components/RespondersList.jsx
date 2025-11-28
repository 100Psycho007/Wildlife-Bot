import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function RespondersList() {
  const [responders, setResponders] = useState([]);
  const [filters, setFilters] = useState({ status: '', role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponders();
  }, [filters]);

  const fetchResponders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      
      const response = await api.get(`/responders?${params}`);
      setResponders(response.data.responders || []);
    } catch (error) {
      console.error('Failed to fetch responders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'NGO': '#2563eb',
      'RESPONDER': '#22c55e',
      'FOREST_OFFICIAL': '#f97316',
      'ADMIN': '#ef4444'
    };
    return (
      <span 
        style={{
          background: colors[role] || '#6b7280',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <span 
        style={{
          color: status === 'AVAILABLE' ? '#22c55e' : '#6b7280',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({ status: '', role: '' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
        Responders
      </h1>

      <div style={{ 
        background: 'white', 
        borderRadius: '10px', 
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search responders..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #e6edf3',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #e6edf3',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
          </select>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #e6edf3',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">Role</option>
            <option value="NGO">NGO</option>
            <option value="RESPONDER">Responder</option>
            <option value="FOREST_OFFICIAL">Forest Official</option>
          </select>
          <button
            onClick={clearFilters}
            style={{
              padding: '10px 16px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ CLEAR FILTERS
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '10px', 
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e6edf3' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Name ↑
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Organization
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Role
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Expertise
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Active Cases
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Last Seen
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {responders.map((responder, index) => (
                <tr 
                  key={responder._id} 
                  style={{ 
                    borderBottom: index < responders.length - 1 ? '1px solid #e6edf3' : 'none'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: ['#22c55e', '#2563eb', '#f97316', '#ef4444'][index % 4],
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        {responder.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>
                        {responder.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {responder.organization}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getRoleBadge(responder.role)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getStatusBadge(responder.status || 'AVAILABLE')}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {responder.expertise?.join(', ').toUpperCase() || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>
                    {responder.activeCases || 0}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {responder.lastSeen ? new Date(responder.lastSeen).toLocaleString('en-IN', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Oct 01, 02:26'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                      aria-label="View responder details"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
