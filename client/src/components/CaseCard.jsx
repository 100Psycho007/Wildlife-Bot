export default function CaseCard({ caseObj, onClick, onAccept }) {
  const priorityColor = 
    caseObj.priority === 'high' || caseObj.priority === 'critical' 
      ? 'var(--priority-high)' 
      : caseObj.priority === 'medium' 
        ? 'var(--priority-medium)' 
        : 'var(--priority-low)';

  return (
    <div 
      className="case-card" 
      style={{ borderLeftColor: priorityColor }}
      onClick={() => onClick(caseObj)}
    >
      <div className="priority-strip" style={{ background: priorityColor }}></div>
      <div className="meta">
        <div className="title">
          {caseObj.caseId}{' '}
          <span className={`badge ${caseObj.source === 'voice' ? 'voice' : 'whatsapp'}`}>
            {caseObj.source === 'voice' ? 'Voice' : 'WhatsApp'}
          </span>
        </div>
        <div className="preview">{caseObj.preview}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
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
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {caseObj.status === 'pending' && (
          <button 
            aria-label="Accept" 
            onClick={(e) => {
              e.stopPropagation();
              onAccept(caseObj.caseId);
            }}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✓
          </button>
        )}
        {caseObj.source === 'voice' && caseObj.audioUrl && (
          <button 
            aria-label="Preview audio" 
            onClick={(e) => {
              e.stopPropagation();
              onClick(caseObj);
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
