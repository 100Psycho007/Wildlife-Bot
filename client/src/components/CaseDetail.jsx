import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';

function CaseDetail({ caseData, onClose, onUpdate }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState('');

  const handleAccept = async () => {
    if (!confirm('Accept this case?')) return;
    
    setLoading(true);
    try {
      await api.post(`/dashboard/reports/${caseData.caseId}/accept`);
      alert('Case accepted successfully');
      onUpdate();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept case');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter resolution details');
      return;
    }
    
    if (!confirm('Mark this case as resolved?')) return;
    
    setLoading(true);
    try {
      await api.post(`/dashboard/reports/${caseData.caseId}/resolve`, { resolution });
      alert('Case resolved successfully');
      onUpdate();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to resolve case');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (caseData.transcript?.audioClipUrl) {
      const audio = new Audio(caseData.transcript.audioClipUrl);
      audio.play().catch(err => alert('Failed to play audio: ' + err.message));
    }
  };

  return (
    <div className="card" style={{ position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Case Details</h2>
        <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 12px' }}>✕</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Case ID</div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>{caseData.caseId}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Source</div>
          <span className={`badge ${caseData.source === 'whatsapp' ? 'badge-green' : 'badge-blue'}`}>
            {caseData.source === 'whatsapp' ? 'WhatsApp' : 'Voice'}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Language</div>
          <div>{caseData.language?.toUpperCase() || 'EN'}</div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Category</div>
        <div>{caseData.category.replace('_', ' ')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Priority</div>
          <span className={`badge badge-${caseData.priority === 'critical' || caseData.priority === 'high' ? 'red' : 'yellow'}`}>
            {caseData.priority.toUpperCase()}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
          <span className={`badge badge-${caseData.status === 'resolved' ? 'green' : 'yellow'}`}>
            {caseData.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Contact</div>
        <div>{caseData.phoneMasked || caseData.phone || 'N/A'}</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
        <div>{caseData.location?.district || 'N/A'}</div>
        {caseData.location?.description && (
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {caseData.location.description}
          </div>
        )}
        {user.role === 'ADMIN' && caseData.location?.coordinates && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            GPS: {caseData.location.coordinates.latitude}, {caseData.location.coordinates.longitude}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Description</div>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{caseData.description}</div>
      </div>

      {caseData.transcript && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Voice Transcript</div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
            {caseData.transcript.final || caseData.transcript.partial}
          </div>
          {caseData.transcript.audioClipUrl && (
            <button onClick={playAudio} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              ▶ Play Audio
            </button>
          )}
        </div>
      )}

      {caseData.assignedResponder && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Assigned To</div>
          <div>{caseData.assignedResponder.name} ({caseData.assignedResponder.organization})</div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Timeline</div>
        <div style={{ fontSize: '12px' }}>
          {caseData.timeline?.slice(-3).reverse().map((entry, idx) => (
            <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: '600' }}>{entry.action}</div>
              <div style={{ color: '#6b7280' }}>{format(new Date(entry.timestamp), 'MMM dd, HH:mm')}</div>
              {entry.details && <div style={{ marginTop: '4px' }}>{entry.details}</div>}
            </div>
          ))}
        </div>
      </div>

      {(user.role === 'RESPONDER' || user.role === 'ADMIN') && caseData.status === 'pending' && (
        <button 
          onClick={handleAccept} 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '12px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Accept Case'}
        </button>
      )}

      {(user.role === 'RESPONDER' || user.role === 'ADMIN') && 
       (caseData.status === 'accepted' || caseData.status === 'in_progress') && (
        <div>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Enter resolution details..."
            style={{ 
              width: '100%', 
              minHeight: '80px', 
              marginBottom: '12px',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={handleResolve} 
            className="btn btn-success" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Resolve Case'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CaseDetail;
