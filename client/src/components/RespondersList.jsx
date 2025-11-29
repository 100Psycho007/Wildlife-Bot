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
      if (filters.status) params.append('status', filters.status.toLowerCase());
      if (filters.role) params.append('role', filters.role);
      
      const response = await api.get(`/dashboard/responders?${params}`);
      const respondersData = response.data.responders || response.data || [];
      setResponders(Array.isArray(respondersData) ? respondersData : []);
    } catch (error) {
      console.error('Failed to fetch responders:', error);
      setResponders([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (categories) => {
    if (!categories || categories.length === 0) return 'General';
    return categories.map(cat => cat.replace('_', ' ').toUpperCase()).join(', ');
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || 'offline').toUpperCase();
    return (
      <span 
        style={{
          color: status === 'online' ? '#22c55e' : status === 'busy' ? '#f97316' : '#6b7280',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        {statusUpper}
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
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
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
            <option value="">Category</option>
            <option value="injured_animal">Injured Animal</option>
            <option value="animal_sighting">Animal Sighting</option>
            <option value="abandoned_pet">Abandoned Pet</option>
            <option value="human_wildlife_conflict">Wildlife Conflict</option>
            <option value="predator_sighting">Predator Sighting</option>
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
                  Contact
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Categories
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
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {responder.whatsappNumber || responder.contactInfo?.phone || 'N/A'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getStatusBadge(responder.status)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {getRoleBadge(responder.categoriesHandled)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>
                    {responder.currentCases?.length || 0}
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
