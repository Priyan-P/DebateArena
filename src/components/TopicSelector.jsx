import React, { useState } from 'react';
import { Sparkles, Shield, Compass, Swords, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Is artificial intelligence replacing human jobs?',
  'Should college attendance be compulsory?',
  'Is social media beneficial for students?',
  'Should coding be taught in every school?',
  'Should online education replace traditional classrooms?',
  'Is remote work better than office work?',
  'Should AI-generated content be labelled?',
  'Is technology making people less social?',
];

export function TopicSelector({ onStartDebate, isLoading }) {
  const [topic, setTopic] = useState(SUGGESTED_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [userPosition, setUserPosition] = useState('FOR');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [roundLimit, setRoundLimit] = useState(5);
  const [style, setStyle] = useState('Formal');
  const [errorMsg, setErrorMsg] = useState('');

  const activeTopic = isCustomMode ? customTopic : topic;
  const aiPosition = userPosition === 'FOR' ? 'AGAINST' : 'FOR';

  const handleSelectSuggested = (t) => {
    setIsCustomMode(false);
    setTopic(t);
    setErrorMsg('');
  };

  const handleCustomChange = (e) => {
    setCustomTopic(e.target.value);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTopic = activeTopic.trim();

    if (!finalTopic) {
      setErrorMsg('Please select or enter a debate topic.');
      return;
    }
    if (finalTopic.length < 3) {
      setErrorMsg('Topic must be at least 3 characters long.');
      return;
    }
    if (finalTopic.length > 200) {
      setErrorMsg('Topic must not exceed 200 characters.');
      return;
    }

    onStartDebate({
      topic: finalTopic,
      userPosition,
      difficulty,
      roundLimit,
      style,
    });
  };

  return (
    <div className="topic-selector-container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div className="hero-badge">
          <Sparkles size={16} /> Setup Your AI Debate Session
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Choose a Topic & Position
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Select from our curated list of compelling topics or craft your own motion. Configure your position, difficulty, and debate style.
        </p>
      </div>

      {/* Suggested Topics Grid */}
      <div className="config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Select Motion / Topic</h3>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setErrorMsg('');
            }}
          >
            {isCustomMode ? 'Choose Suggested Topic' : '+ Write Custom Motion'}
          </button>
        </div>

        {!isCustomMode ? (
          <div className="topic-grid">
            {SUGGESTED_TOPICS.map((t) => (
              <div
                key={t}
                className={`topic-card ${topic === t ? 'selected' : ''}`}
                onClick={() => handleSelectSuggested(t)}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {t}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span className="badge badge-blue">Suggested</span>
                  {topic === t && <CheckCircle2 size={18} style={{ color: 'var(--accent-violet)' }} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              ENTER CUSTOM DEBATE MOTION
            </label>
            <input
              type="text"
              placeholder="e.g. Should space exploration receive more government funding?"
              value={customTopic}
              onChange={handleCustomChange}
              maxLength={200}
              autoFocus
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
              {customTopic.length}/200 characters
            </div>
          </div>
        )}
      </div>

      {/* Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Your Position */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Swords size={18} style={{ color: 'var(--accent-violet)' }} />
            Your Position
          </h4>
          <div className="option-group">
            <button
              type="button"
              className={`option-btn ${userPosition === 'FOR' ? 'selected' : ''}`}
              onClick={() => setUserPosition('FOR')}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>FOR (Pro)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Support the topic</span>
            </button>
            <button
              type="button"
              className={`option-btn ${userPosition === 'AGAINST' ? 'selected' : ''}`}
              onClick={() => setUserPosition('AGAINST')}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)' }}>AGAINST (Con)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oppose the topic</span>
            </button>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
            🤖 AI Opponent stance: <strong style={{ color: 'var(--accent-violet)' }}>{aiPosition}</strong>
          </div>
        </div>

        {/* Difficulty */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} style={{ color: 'var(--accent-amber)' }} />
            Difficulty Level
          </h4>
          <div className="option-group">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`option-btn ${difficulty === lvl ? 'selected' : ''}`}
                onClick={() => setDifficulty(lvl)}
              >
                <span>{lvl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Debate Length */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} style={{ color: 'var(--accent-cyan)' }} />
            Debate Length
          </h4>
          <div className="option-group">
            {[3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                className={`option-btn ${roundLimit === num ? 'selected' : ''}`}
                onClick={() => setRoundLimit(num)}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{num} Rounds</span>
              </button>
            ))}
          </div>
        </div>

        {/* Debate Style */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
            Debate Tone / Style
          </h4>
          <div className="option-group">
            {['Formal', 'Friendly', 'Socratic'].map((st) => (
              <button
                key={st}
                type="button"
                className={`option-btn ${style === st ? 'selected' : ''}`}
                onClick={() => setStyle(st)}
              >
                <span>{st}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Card & Start CTA */}
      <div className="card" style={{ background: 'var(--gradient-card)', borderColor: 'rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-violet)', fontWeight: 700 }}>
            READY TO DEBATE
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-primary)' }}>
            "{activeTopic}"
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">You: {userPosition}</span>
            <span className="badge badge-violet">AI: {aiPosition}</span>
            <span className="badge badge-blue">{difficulty}</span>
            <span className="badge badge-amber">{roundLimit} Rounds</span>
            <span className="badge badge-cyan">{style} Tone</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: '1rem 2rem', fontSize: '1.05rem', minWidth: '200px' }}
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <span className="typing-dot"></span>
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <Swords size={20} />
              <span>Begin Debate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default TopicSelector;
