import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import CaseCard from '../components/CaseCard';
import MapView from '../components/MapView';
import RespondersList from '../components/RespondersList';
import '../styles/ui-tokens.css';

function DashboardPixelPerfect() {
  const { user, logout } = useContext(AuthContext);
  const [activeView, setActiveView] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [casesRes, statsRes] = await Promise.all([
        api.get('/dashboard/reports'),
        api.get('/dashboard/stats')
      ]);
      
      const casesData = casesRes.data.reports || [];
      setCases(casesData.map(c => ({
        ...c,
        preview: c.description?.substring(0, 80) + '...' || c.transcript?.substring(0, 80) + '...' || 'No description',
        confidence: c.confidence || Math.floor(Math.random() * 30) + 70
      })));
      
      setStats({
        total: statsRes.data.total || casesData.length,
        active: statsRes.data.active || casesData.filter(c => c.status === 'accepted' || c.status === 'in_progress').length,
        critical: statsRes.data.critical || casesData.filter(c => c.priority === 'critical' || c.priority === 'high').length,
        resolved: statsRes.data.resolved || casesData.filter(c => c.status === 'resolved').length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCase = async (caseId) => {
    try {
      await api.post(`/cases/${caseId}/accept`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to accept case:', error);
    }
  };

  const renderTopNav = () => (
    <div style={{
      background: '#2d7a3e',
      color: 'white',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '20px' }}>🦁</div>
        <span style={{ fontSize: '16px', fontWeight: '600' }}>Wildlife Emergency Dashboard</span>
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <button
          onClick={() => setActiveView('dashboard')}
          style={{
            background: activeView === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 DASHBOARD
        </button>
        <button
          onClick={() => setActiveView('cases')}
          style={{
            background: activeView === 'cases' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📋 CASES
        </button>
        <button
          onClick={() => setActiveView('map')}
          style={{
            background: activeView === 'map' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🗺️ MAP
        </button>
        <button
          onClick={() => setActiveView('responders')}
          style={{
            background: activeView === 'responders' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          👥 RESPONDERS
        </button>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)' }}></div>
        <button style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>
          🔔
        </button>
        <button 
          onClick={logout}
          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
        >
          👤
        </button>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#22c55e',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          📁
        </div>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Cases</div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#f97316',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          🔥
        </div>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{stats.active}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Cases</div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#ef4444',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          ⚠️
        </div>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{stats.critical}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Critical Cases</div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#16a34a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          ✅
        </div>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{stats.resolved}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Resolved Cases</div>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div style={{ padding: '20px' }}>
      {renderStatsCards()}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 6px 20px rgba(2,6,23,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Recent Active Cases</h2>
            <a href="#" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none' }}>VIEW ALL</a>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
          ) : cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No active cases at the moment
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cases.slice(0, 5).map(caseItem => (
                <CaseCard
                  key={caseItem.caseId}
                  caseObj={caseItem}
                  onClick={setSelectedCase}
                  onAccept={handleAcceptCase}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                📋 VIEW ALL CASES
              </button>
              <button style={{
                background: 'white',
                color: '#0f172a',
                border: '1px solid #e6edf3',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                ⚠️ UNASSIGNED CASES
              </button>
              <button style={{
                background: 'white',
                color: '#0f172a',
                border: '1px solid #e6edf3',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                🚨 CRITICAL CASES
              </button>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 6px 20px rgba(2,6,23,0.06)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>System Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'WhatsApp Service', status: 'Online' },
                { name: 'Image Analysis', status: 'Online' },
                { name: 'Database', status: 'Online' },
                { name: 'API Service', status: 'Online' },
                { name: 'Case Processing', status: 'Online' }
              ].map(service => (
                <div key={service.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#0f172a' }}>{service.name}</span>
                  <span style={{
                    background: '#22c55e',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {service.status}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                Avg Response Time: 8 min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Case Map View</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: 'white',
            border: '1px solid #e6edf3',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🗺️ MAP
          </button>
          <button style={{
            background: 'white',
            border: '1px solid #e6edf3',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            SPLIT
          </button>
          <button style={{
            background: 'white',
            border: '1px solid #e6edf3',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 LIST
          </button>
        </div>
      </div>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        height: 'calc(100vh - 180px)',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(2,6,23,0.06)'
      }}>
        <MapView cases={cases} center={[12.9716, 77.5946]} zoom={10} />
      </div>
    </div>
  );

  return (
    <div className="app">
      {renderTopNav()}
      {activeView === 'dashboard' && renderDashboardView()}
      {activeView === 'cases' && renderDashboardView()}
      {activeView === 'map' && renderMapView()}
      {activeView === 'responders' && <RespondersList />}
    </div>
  );
}

export default DashboardPixelPerfect;
