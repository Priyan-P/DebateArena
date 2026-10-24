import React, { useState, useRef, useEffect } from 'react';
import { Send, Award, AlertCircle, RefreshCw, StopCircle, Sparkles, User, Bot, AlertTriangle } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';
import DebateTimer from './DebateTimer.jsx';

export function DebateRoom({
  debateConfig,
  messages = [],
  onSubmitArgument,
  onEndDebate,
  isLoading,
  error,
  onRetry,
  apiKeyConfigured = false,
}) {
  const [draft, setDraft] = useState('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { topic, userPosition, aiPosition, roundLimit = 5, difficulty, style, isDemo } = debateConfig;

  // Calculate current round: each round is 1 user message + 1 AI message (opening argument is AI round 1)
  const userMessagesCount = messages.filter((m) => m.role === 'user').length;
  const currentRound = Math.min(roundLimit, userMessagesCount + 1);
  const isRoundLimitReached = userMessagesCount >= roundLimit;

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || isLoading || isRoundLimitReached) return;

    onSubmitArgument(text);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="debate-room">
      {/* Header Banner */}
      <div className="debate-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-violet">Round {currentRound} of {roundLimit}</span>
            <span className="badge badge-emerald">You: {userPosition}</span>
            <span className="badge badge-blue">AI: {aiPosition}</span>
            <span className="badge badge-amber">{difficulty}</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {topic}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <DebateTimer isActive={!isRoundLimitReached} />

          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            onClick={onEndDebate}
            disabled={userMessagesCount === 0 || isLoading}
            title="End debate early and request AI Judge feedback"
          >
            <Award size={16} />
            <span>Judge Debate</span>
          </button>
        </div>
      </div>

      {/* Demo Mode / Missing Key Banner */}
      {(!apiKeyConfigured || isDemo) && (
        <div style={{ padding: '0.6rem 1rem', background: 'rgba(245, 158, 11, 0.12)', borderLeft: '4px solid var(--accent-amber)', fontSize: '0.85rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>Running in Demo Mode. To enable live Gemini AI responses, add <code>GEMINI_API_KEY</code> to <code>server/.env</code>.</span>
          </div>
        </div>
      )}

      {/* Chat History Area */}
      <div className="chat-container">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg}
            roundNumber={msg.role === 'user' ? Math.floor(idx / 2) + 1 : Math.floor(idx / 2) + 1}
            userPosition={userPosition}
            aiPosition={aiPosition}
          />
        ))}

        {/* AI Typing / Thinking Indicator */}
        {isLoading && (
          <div className="chat-bubble ai">
            <div className="avatar ai">
              <Bot size={20} />
            </div>
            <div className="message-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Opponent is formulating counterargument</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner with Retry */}
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
            {onRetry && (
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }} onClick={onRetry}>
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
        )}

        {/* Round Limit Reached Alert */}
        {isRoundLimitReached && !isLoading && (
          <div className="card" style={{ background: 'var(--gradient-card)', borderColor: 'var(--accent-violet)', textAlign: 'center', padding: '1.5rem', marginTop: '1rem' }}>
            <Sparkles size={28} style={{ color: 'var(--accent-violet)', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Debate Round Limit Reached!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You have completed all {roundLimit} rounds of argument exchange. It's time for the AI Judge to evaluate your overall performance.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} onClick={onEndDebate}>
              <Award size={18} /> Proceed to Judge's Evaluation
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Footer / Input Area */}
      <div className="debate-footer">
        <form onSubmit={handleSubmit} className="input-row">
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              rows={3}
              placeholder={
                isRoundLimitReached
                  ? 'Debate round limit reached. Click "Proceed to Judge" above.'
                  : `Type your argument for ${userPosition}... (Ctrl + Enter to send)`
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isRoundLimitReached}
              maxLength={2500}
            />
            <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {draft.length}/2500
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '70px', padding: '0 1.5rem' }}
            disabled={!draft.trim() || isLoading || isRoundLimitReached}
          >
            {isLoading ? (
              <RefreshCw size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DebateRoom;
