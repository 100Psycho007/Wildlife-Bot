export default function CaseCard({ caseObj, onClick, onAccept }) {
  const priorityColor = 
    caseObj.priority === 'high' || caseObj.priority === 'critical' 
      ? '#ef4444' 
      : caseObj.priority === 'medium' 
        ? '#f97316' 
        : '#64748b';

  return (
    <div 
      className="case-card" 
      style={{ 
        borderLeft: `4px solid ${priorityColor}`,
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}
      onClick={() => onClick && onClick(caseObj)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div className="priority-strip" style={{ background: priorityColor }}></div>
      <div className="meta">
        <div className="title">
          {caseObj.caseId}{' '}
          <span className={`badge ${caseObj.source === 'voice' ? 'voice' : 'whatsapp'}`}>
            {caseObj.source === 'voice' ? 'Voice' : 'WhatsApp'}
          </span>
        </div>
        <div className="preview">
          {caseObj.source === 'voice' && caseObj.transcript?.final 
            ? caseObj.transcript.final.substring(0, 80) + '...'
            : caseObj.preview}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div 
            className={`conf-chip ${
              caseObj.confidence >= 80 
                ? 'conf-high' 
                : caseObj.confidence >= 50 
                  ? 'conf-mid' 
                  : 'conf-low'
            }`}
          >
            {caseObj.confidence}%
          </div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>
            {caseObj.location?.district || 'Unknown'}
          </div>
          {caseObj.status && (
            <div style={{
              background: 
                caseObj.status === 'resolved' ? '#dcfce7' : 
                caseObj.status === 'in_progress' ? '#dbeafe' : 
                '#fef3c7',
              color: 
                caseObj.status === 'resolved' ? '#16a34a' : 
                caseObj.status === 'in_progress' ? '#2563eb' : 
                '#d97706',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: 11,
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {caseObj.status === 'in_progress' ? 'IN PROGRESS' : caseObj.status}
            </div>
          )}
          {caseObj.priority && (
            <div style={{
              background: caseObj.priority === 'high' || caseObj.priority === 'critical' ? '#fee2e2' : '#fef3c7',
              color: caseObj.priority === 'high' || caseObj.priority === 'critical' ? '#dc2626' : '#d97706',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: 11,
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {caseObj.priority}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {caseObj.status === 'pending' && onAccept && (
          <button 
            aria-label="Accept case" 
            title="Accept this case"
            onClick={(e) => {
              e.stopPropagation();
              onAccept(caseObj.caseId);
            }}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Accept
          </button>
        )}
        {caseObj.source === 'voice' && caseObj.audioUrl && (
          <button 
            aria-label="Preview audio" 
            title="Play audio recording"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(caseObj);
            }}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}
