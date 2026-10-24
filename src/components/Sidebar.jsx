import React from 'react';
import { PlusCircle, History, Award, Trash2, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

export function Sidebar({ currentView, setCurrentView, history = [], onSelectDebate, onClearHistory, activeDebate }) {
  return (
    <aside className="sidebar">
      {/* Quick Action */}
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCurrentView('setup')}>
        <PlusCircle size={18} />
        <span>Start New Debate</span>
      </button>

      {/* Active Debate Quick Info */}
      {activeDebate && currentView === 'debate' && (
        <div className="sidebar-section">
          <div className="sidebar-title">Current Session</div>
          <div className="card" style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {activeDebate.topic}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">User: {activeDebate.userPosition}</span>
              <span className="badge badge-violet">{activeDebate.difficulty}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Debates History */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span className="sidebar-title">Recent Debates</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({history.length})</span>
        </div>

        {history.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
            No debate history yet. Start your first debate above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectDebate(item)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.topic}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  {item.evaluation && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                      Score: {item.evaluation.overallScore}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear History Button */}
      {history.length > 0 && (
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem', color: 'var(--accent-rose)' }}
          onClick={onClearHistory}
        >
          <Trash2 size={14} />
          <span>Clear History</span>
        </button>
      )}
    </aside>
  );
}

export default Sidebar;
