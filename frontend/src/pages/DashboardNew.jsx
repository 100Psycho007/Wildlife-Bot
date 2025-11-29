import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import '../styles/dashboard.css';

function DashboardNew() {
  const { user, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalOpen: 0, new24h: 0, highPriority: 0, avgAcceptTime: 0 });
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.get('/dashboard/reports?limit=50'),
        api.get('/dashboard/stats')
      ]);
      setReports(reportsRes.data.reports);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCase = async (caseId) => {
    try {
      await api.post(`/dashboard/reports/${caseId}/accept`);
      fetchData();
      alert('Case accepted successfully');
    } catch (error) {
      alert('Failed to accept case: ' + error.message);
    }
  };

  const handleResolveCase = async (caseId) => {
    try {
      await api.post(`/dashboard/reports/${caseId}/resolve`, {
        resolution: 'Case resolved via dashboard'
      });
      fetchData();
      setSelectedCase(null);
      alert('Case resolved successfully');
    } catch (error) {
      alert('Failed to resolve case: ' + error.message);
    }
  };

  const seedDemo = async () => {
    try {
      await api.post('/seed/demo-voice-cases');
      fetchData();
      alert('Demo data seeded successfully');
    } catch (error) {
      alert('Failed to seed demo: ' + error.message);
    }
  };

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: '24px' }}>🦁</span>
          <h1>Wildlife Emergency</h1>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveView('cases')}
          >
            <span>📋</span>
            <span>All Cases</span>
          </div>
          <div className="nav-item">
            <span>🗺️</span>
            <span>Map</span>
          </div>
          <div className="nav-item">
            <span>👥</span>
            <span>Responders</span>
          </div>
          {user.role === 'ADMIN' && (
            <div className="nav-item">
              <span>⚙️</span>
              <span>Admin</span>
            </div>
          )}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="nav-item" onClick={logout}>
            <span>🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search cases..." />
          </div>
          <div className="top-bar-actions">
            <button className="btn btn-success" onClick={seedDemo}>
              🌱 Seed Demo
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div style={{ fontSize: '14px' }}>
                <div style={{ fontWeight: '500' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '24px' }}>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">📊</div>
              <div className="stat-value">{stats.totalOpen}</div>
              <div className="stat-label">Total Cases</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🔥</div>
              <div className="stat-value">{stats.new24h}</div>
              <div className="stat-label">Active Cases</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">⚠️</div>
              <div className="stat-value">{stats.highPriority}</div>
              <div className="stat-label">Critical Cases</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">✅</div>
              <div className="stat-value">{stats.avgAcceptTime}m</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          </div>

          {/* Case List and Detail */}
          <div className="case-list-container">
            <div className="case-list">
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Recent Active Cases
              </h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No active cases at the moment
                </div>
              ) : (
                reports.map(report => (
                  <div 
                    key={report._id}
                    className={`case-card priority-${report.priority}`}
                    onClick={() => setSelectedCase(report)}
                  >
                    <div className="case-card-header">
                      <span className="case-id">{report.caseId}</span>
                      <div className="case-badges">
                        <span className={`badge ${report.source}`}>
                          {report.source === 'whatsapp' ? 'WhatsApp' : 'Voice'}
                        </span>
                        {report.language && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {report.language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="case-preview">
                      {report.description?.substring(0, 80)}...
                    </div>
                    <div className="case-meta">
                      <span>📍 {report.location?.district || 'Unknown'}</span>
                      {report.aiClassification?.confidence && (
                        <span className={`confidence-chip ${getConfidenceClass(report.aiClassification.confidence)}`}>
                          {Math.round(report.aiClassification.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Case Detail Panel */}
            {selectedCase && (
              <div className="case-detail-panel">
                <div className="case-detail-header">
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                      {selectedCase.caseId}
                    </h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${selectedCase.source}`}>
                        {selectedCase.source === 'whatsapp' ? 'WhatsApp' : 'Voice'}
                      </span>
                      <span className={`badge priority-${selectedCase.priority}`}>
                        {selectedCase.priority}
                      </span>
                      <span className={`badge status-${selectedCase.status}`}>
                        {selectedCase.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSelectedCase(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="case-detail-body">
                  {/* Overview */}
                  <div className="detail-section">
                    <h3>Overview</h3>
                    <div className="detail-row">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">{selectedCase.category?.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{selectedCase.location?.district || 'Unknown'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Reported</span>
                      <span className="detail-value">
                        {format(new Date(selectedCase.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedCase.phoneMasked || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Transcript */}
                  {selectedCase.transcript && (
                    <div className="detail-section">
                      <h3>Transcript</h3>
                      <div className="transcript-panel">
                        {selectedCase.transcript.segments?.map((seg, idx) => (
                          <div key={idx} className="transcript-segment">
                            <div className="segment-meta">
                              {Math.floor(seg.timestamp / 1000)}s • {Math.round(seg.confidence * 100)}% confidence
                            </div>
                            <div className="segment-text">{seg.text}</div>
                          </div>
                        ))}
                        {selectedCase.transcript.final && !selectedCase.transcript.segments && (
                          <div className="transcript-segment">
                            <div className="segment-text">{selectedCase.transcript.final}</div>
                          </div>
                        )}
                      </div>
                      {selectedCase.transcript.audioClipUrl && (
                        <audio controls style={{ width: '100%', marginTop: '12px' }}>
                          <source src={selectedCase.transcript.audioClipUrl} type="audio/mpeg" />
                        </audio>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  {selectedCase.timeline && selectedCase.timeline.length > 0 && (
                    <div className="detail-section">
                      <h3>Timeline</h3>
                      <div className="timeline">
                        {selectedCase.timeline.map((event, idx) => (
                          <div key={idx} className="timeline-item">
                            <div className="timeline-time">
                              {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                            </div>
                            <div className="timeline-content">
                              <strong>{event.action}</strong> by {event.performedBy}
                              {event.details && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                {event.details}
                              </div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="detail-section">
                    <h3>Actions</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {selectedCase.status === 'pending' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => handleAcceptCase(selectedCase.caseId)}
                        >
                          ✓ Accept Case
                        </button>
                      )}
                      {(selectedCase.status === 'accepted' || selectedCase.status === 'in_progress') && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleResolveCase(selectedCase.caseId)}
                        >
                          ✓ Resolve Case
                        </button>
                      )}
                      <button className="btn btn-outline">
                        📞 Request More Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardNew;
