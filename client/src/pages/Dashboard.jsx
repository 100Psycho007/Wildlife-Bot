import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import CaseDetail from '../components/CaseDetail';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filters, setFilters] = useState({
    source: '',
    status: '',
    priority: '',
    language: ''
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/dashboard/reports?${params}`);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSourceBadge = (source) => {
    return source === 'whatsapp' 
      ? <span className="badge badge-green">WhatsApp</span>
      : <span className="badge badge-blue">Voice</span>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'badge-green',
      medium: 'badge-yellow',
      high: 'badge-red',
      critical: 'badge-red'
    };
    return <span className={`badge ${colors[priority]}`}>{priority.toUpperCase()}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge-yellow',
      accepted: 'badge-blue',
      in_progress: 'badge-blue',
      resolved: 'badge-green',
      cancelled: 'badge-red'
    };
    return <span className={`badge ${colors[status]}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Wildlife Responder Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {user.name} ({user.role})
          </span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: selectedCase ? '0 0 60%' : '1' }}>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Filters</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <select 
                value={filters.source} 
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice">Voice</option>
              </select>

              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="resolved">Resolved</option>
              </select>

              <select 
                value={filters.priority} 
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select 
                value={filters.language} 
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Cases ({reports.length})
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No cases found
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr 
                      key={report._id} 
                      onClick={() => setSelectedCase(report)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: '500' }}>{report.caseId}</td>
                      <td>{getSourceBadge(report.source)}</td>
                      <td>{report.category.replace('_', ' ')}</td>
                      <td>{getPriorityBadge(report.priority)}</td>
                      <td>{getStatusBadge(report.status)}</td>
                      <td>{report.location?.district || 'N/A'}</td>
                      <td>{format(new Date(report.updatedAt), 'MMM dd, HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedCase && (
          <div style={{ flex: '0 0 38%' }}>
            <CaseDetail 
              caseData={selectedCase} 
              onClose={() => setSelectedCase(null)}
              onUpdate={fetchReports}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
