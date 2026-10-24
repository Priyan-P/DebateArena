import React, { useState } from 'react';
import { Award, ArrowLeft, PlusCircle, Download, Printer, CheckCircle, AlertCircle, FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ScoreCard from './ScoreCard.jsx';
import ChatMessage from './ChatMessage.jsx';

export function DebateResults({ debateData, onReturnHome, onNewDebate }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!debateData || !debateData.evaluation) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>No Evaluation Data Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested evaluation report is unavailable or incomplete.</p>
        <button className="btn btn-primary" onClick={onReturnHome}>Return to Dashboard</button>
      </div>
    );
  }

  const { topic, userPosition, aiPosition, difficulty, style, date, messages = [], evaluation } = debateData;

  const {
    overallScore = 80,
    logic = 80,
    evidence = 75,
    clarity = 85,
    relevance = 85,
    rebuttalQuality = 75,
    strengths = [],
    improvements = [],
    strongestArgument = '',
    weakestArgument = '',
    summary = '',
  } = evaluation;

  const getScoreTitle = (score) => {
    if (score >= 90) return { title: 'Grandmaster Debater', badge: 'badge-emerald' };
    if (score >= 80) return { title: 'Master Strategist', badge: 'badge-blue' };
    if (score >= 70) return { title: 'Strong Reasoner', badge: 'badge-violet' };
    if (score >= 60) return { title: 'Promising Advocate', badge: 'badge-amber' };
    return { title: 'Developing Debater', badge: 'badge-amber' };
  };

  const scoreMeta = getScoreTitle(overallScore);

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(debateData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Debate_Report_${topic.slice(0, 25).replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="results-container">
      {/* Navigation & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={onReturnHome}>
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleDownloadJSON} title="Download JSON evaluation report">
            <Download size={16} />
            <span>Export Report</span>
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Print report">
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button className="btn btn-primary" onClick={onNewDebate}>
            <PlusCircle size={18} />
            <span>New Debate</span>
          </button>
        </div>
      </div>

      {/* Hero Score Banner */}
      <div className="hero-score-card">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className={`badge ${scoreMeta.badge}`}>{scoreMeta.title}</span>
            <span className="badge badge-violet">{new Date(date || Date.now()).toLocaleDateString()}</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Debate Evaluation Report</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1rem' }}>
            "{topic}"
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">User: {userPosition}</span>
            <span className="badge badge-blue">AI: {aiPosition}</span>
            <span className="badge badge-amber">{difficulty}</span>
            <span className="badge badge-cyan">{style} Style</span>
          </div>
        </div>

        <div className="score-circle">
          <div className="score-number">{overallScore}</div>
          <div className="score-label">OVERALL SCORE</div>
        </div>
      </div>

      {/* 5 Dimensional Score Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-violet)' }} />
          Performance Breakdown
        </h3>
        <div className="scores-grid">
          <ScoreCard metricKey="logic" score={logic} />
          <ScoreCard metricKey="evidence" score={evidence} />
          <ScoreCard metricKey="clarity" score={clarity} />
          <ScoreCard metricKey="relevance" score={relevance} />
          <ScoreCard metricKey="rebuttalQuality" score={rebuttalQuality} />
        </div>
      </div>

      {/* Judge Summary Card */}
      <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} /> AI Adjudicator Summary
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
          {summary}
        </p>
      </div>

      {/* Strengths & Improvements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Strengths */}
        <div className="card">
          <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> Observed Strengths
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {strengths.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="card">
          <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-amber)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> Areas for Growth
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {improvements.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strongest vs Weakest Arguments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.35rem' }}>
            STRONGEST ARGUMENT
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
            "{strongestArgument}"
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '0.35rem' }}>
            WEAKEST / UNADDRESSED POINT
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
            "{weakestArgument}"
          </div>
        </div>
      </div>

      {/* Toggleable Full Transcript */}
      <div className="card">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.25rem 0' }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--accent-violet)' }} />
            Full Debate Transcript ({messages.length} exchanges)
          </span>
          {showTranscript ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showTranscript && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                message={msg}
                roundNumber={Math.floor(idx / 2) + 1}
                userPosition={userPosition}
                aiPosition={aiPosition}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assessment Disclaimer */}
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
        * Note: This score is an automated AI-generated assessment designed for educational practice and skill enhancement.
      </div>
    </div>
  );
}

export default DebateResults;
