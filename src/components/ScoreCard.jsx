import React from 'react';
import { Brain, FileText, MessageCircle, Target, ShieldAlert } from 'lucide-react';

const metricIcons = {
  logic: Brain,
  evidence: FileText,
  clarity: MessageCircle,
  relevance: Target,
  rebuttalQuality: ShieldAlert,
};

const metricLabels = {
  logic: 'Logic & Reasoning',
  evidence: 'Evidence & Examples',
  clarity: 'Clarity & Structure',
  relevance: 'Topic Relevance',
  rebuttalQuality: 'Rebuttal Quality',
};

const metricDescriptions = {
  logic: 'Evaluation of logical coherence and freedom from logical fallacies.',
  evidence: 'Use of facts, concrete examples, analogies, and grounding cases.',
  clarity: 'Structural flow, eloquence, tone, and argument readability.',
  relevance: 'Degree to which arguments address the core subject matter.',
  rebuttalQuality: 'Effectiveness in dissecting and refuting opponent arguments.',
};

export function ScoreCard({ metricKey, score = 0 }) {
  const Icon = metricIcons[metricKey] || Brain;
  const label = metricLabels[metricKey] || metricKey;
  const description = metricDescriptions[metricKey] || '';

  const getScoreColor = (val) => {
    if (val >= 85) return 'var(--accent-emerald)';
    if (val >= 70) return 'var(--accent-blue)';
    if (val >= 55) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', color: scoreColor }}>
            <Icon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</div>
          </div>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
          {score}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>

      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, score))}%`,
            background: scoreColor,
            borderRadius: '3px',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        {description}
      </div>
    </div>
  );
}

export default ScoreCard;
