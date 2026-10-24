import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function DebateTimer({ isActive = true }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        color: 'var(--accent-cyan)',
        fontWeight: 600,
      }}
    >
      <Clock size={14} style={{ animation: isActive ? 'pulseGlow 1.5s infinite' : 'none' }} />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}

export default DebateTimer;
