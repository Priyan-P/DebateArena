import React, { useState } from 'react';
import { User, Bot, Copy, Check, MessageSquare } from 'lucide-react';

export function ChatMessage({ message, roundNumber, userPosition, aiPosition }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
      <div className={`avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      <div className="message-card" style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isUser ? 'var(--accent-blue)' : 'var(--accent-violet)' }}>
              {isUser ? 'YOU' : 'AI OPPONENT'}
            </span>
            <span className={`badge ${isUser ? 'badge-blue' : 'badge-violet'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
              {isUser ? userPosition : aiPosition}
            </span>
            {roundNumber && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Round {roundNumber}
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            title="Copy message text"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
