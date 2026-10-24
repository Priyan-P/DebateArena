import React from 'react';
import { MessageSquare, Shield, Award, PlusCircle, History, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export function Navbar({ currentView, setCurrentView, historyCount = 0, apiKeyConfigured = false }) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setCurrentView('dashboard')}>
        <div className="nav-logo-icon">
          <MessageSquare size={22} />
        </div>
        <div>
          <span>Debate<span className="text-gradient">Arena</span></span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--accent-violet)', marginTop: '-4px', fontWeight: 700, letterSpacing: '0.1em' }}>AI SIMULATOR</span>
        </div>
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <Shield size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-link ${currentView === 'setup' ? 'active' : ''}`}
          onClick={() => setCurrentView('setup')}
        >
          <PlusCircle size={18} />
          <span>New Debate</span>
        </button>

        <button
          className={`nav-link ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <History size={18} />
          <span>History</span>
          {historyCount > 0 && (
            <span className="badge badge-violet" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
              {historyCount}
            </span>
          )}
        </button>
      </div>

      <div className="nav-status" title={apiKeyConfigured ? "Live AI Active (Gemini API Configured)" : "Demo Mode Active (Missing GEMINI_API_KEY)"}>
        <div className={`status-dot ${apiKeyConfigured ? 'active' : 'demo'}`}></div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {apiKeyConfigured ? (
            <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Gemini Live AI
            </span>
          ) : (
            <span style={{ color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={13} /> Demo Mode
            </span>
          )}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
