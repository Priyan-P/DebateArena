import React, { useState, useEffect } from 'react';
import { checkHealth, startDebateApi, submitArgumentApi, judgeDebateApi } from './services/api.js';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopicSelector from './components/TopicSelector.jsx';
import DebateRoom from './components/DebateRoom.jsx';
import DebateResults from './components/DebateResults.jsx';
import { Sparkles, Swords, Award, Shield, PlusCircle, History, Trash2, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import './App.css';

const LOCAL_STORAGE_KEY = 'debate_arena_history';

// Helper to safely load history from localStorage
const loadHistoryFromStorage = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Storage] Error loading debate history:', err);
    return [];
  }
};

// Helper to save history to localStorage
const saveHistoryToStorage = (historyArray) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(historyArray));
  } catch (err) {
    console.warn('[Storage] Error saving debate history:', err);
  }
};

export function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'setup' | 'debate' | 'results' | 'history'
  const [history, setHistory] = useState(loadHistoryFromStorage);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  
  // Active debate session state
  const [activeDebate, setActiveDebate] = useState(null); // { debateId, topic, userPosition, aiPosition, difficulty, roundLimit, style, date, messages, evaluation }
  const [selectedDebateReport, setSelectedDebateReport] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedArgument, setLastFailedArgument] = useState('');

  // Initial Health Check
  useEffect(() => {
    async function verifyHealth() {
      const health = await checkHealth();
      setApiKeyConfigured(Boolean(health.apiKeyConfigured));
    }
    verifyHealth();
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  // Handler: Start a new debate
  const handleStartDebate = async (config) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await startDebateApi(config);

      const initialSession = {
        debateId: response.debateId || `debate_${Date.now()}`,
        topic: response.topic,
        userPosition: response.userPosition,
        aiPosition: response.aiPosition,
        difficulty: response.difficulty,
        roundLimit: response.roundLimit,
        style: response.style,
        date: new Date().toISOString(),
        isDemo: response.isDemo,
        messages: [
          {
            role: 'ai',
            content: response.openingArgument,
            timestamp: new Date().toISOString(),
          },
        ],
        evaluation: null,
      };

      setActiveDebate(initialSession);
      setCurrentView('debate');
    } catch (err) {
      console.error('Failed to start debate:', err);
      setError(err.message || 'Failed to initialize debate session with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Submit user argument during live debate
  const handleSubmitArgument = async (userArgumentText) => {
    if (!activeDebate) return;
    setIsLoading(true);
    setError(null);
    setLastFailedArgument(userArgumentText);

    // Append user message immediately
    const userMsg = { role: 'user', content: userArgumentText, timestamp: new Date().toISOString() };
    const updatedMessages = [...activeDebate.messages, userMsg];

    setActiveDebate((prev) => ({
      ...prev,
      messages: updatedMessages,
    }));

    try {
      const response = await submitArgumentApi({
        topic: activeDebate.topic,
        userPosition: activeDebate.userPosition,
        aiPosition: activeDebate.aiPosition,
        difficulty: activeDebate.difficulty,
        style: activeDebate.style,
        history: updatedMessages,
        userArgument: userArgumentText,
      });

      const aiMsg = { role: 'ai', content: response.aiResponse, timestamp: new Date().toISOString() };

      setActiveDebate((prev) => ({
        ...prev,
        messages: [...updatedMessages, aiMsg],
      }));
      setLastFailedArgument('');
    } catch (err) {
      console.error('Failed to submit argument:', err);
      setError(err.message || 'Failed to fetch AI counterargument. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Retry submitting last failed argument
  const handleRetryArgument = () => {
    if (lastFailedArgument) {
      handleSubmitArgument(lastFailedArgument);
    }
  };

  // Handler: End debate and trigger AI Judge Adjudication
  const handleEndDebate = async () => {
    if (!activeDebate || activeDebate.messages.length < 2) return;
    setIsLoading(true);
    setError(null);

    try {
      const judgeRes = await judgeDebateApi({
        topic: activeDebate.topic,
        userPosition: activeDebate.userPosition,
        history: activeDebate.messages,
      });

      const finalDebateRecord = {
        ...activeDebate,
        id: activeDebate.debateId,
        date: new Date().toISOString(),
        evaluation: judgeRes.evaluation,
      };

      // Update local storage history
      setHistory((prev) => [finalDebateRecord, ...prev.filter((item) => item.id !== finalDebateRecord.id)]);

      setSelectedDebateReport(finalDebateRecord);
      setCurrentView('results');
    } catch (err) {
      console.error('Failed to judge debate:', err);
      setError(err.message || 'Failed to generate evaluation report from AI Judge.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Select a saved debate to view its report
  const handleSelectSavedDebate = (item) => {
    setSelectedDebateReport(item);
    setCurrentView('results');
  };

  // Handler: Delete individual item from history
  const handleDeleteHistoryItem = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this debate record?')) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedDebateReport && selectedDebateReport.id === id) {
        setSelectedDebateReport(null);
        setCurrentView('dashboard');
      }
    }
  };

  // Handler: Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire debate history? This action cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Dashboard Stats Calculations
  const totalDebates = history.length;
  const avgScore = totalDebates > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.evaluation?.overallScore || 0), 0) / totalDebates)
    : 0;

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        historyCount={totalDebates}
        apiKeyConfigured={apiKeyConfigured}
      />

      <div className="app-body">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          history={history}
          onSelectDebate={handleSelectSavedDebate}
          onClearHistory={handleClearHistory}
          activeDebate={activeDebate}
        />

        {/* Main Content Body */}
        <main className="main-content">

          {/* VIEW: DASHBOARD / LANDING */}
          {currentView === 'dashboard' && (
            <div>
              {/* Hero Banner */}
              <div className="hero-section">
                <div className="hero-badge">
                  <Sparkles size={16} /> Interactive AI Debate Simulator
                </div>
                <h1 className="hero-title">
                  Challenge Your Mind. <br />
                  <span className="text-gradient">Defend Your Ideas.</span>
                </h1>
                <p className="hero-subtitle">
                  Engage in structured, multi-round debates against an AI opponent tailored to your skill level. Receive objective scoring and detailed feedback from an AI Judge.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ padding: '1rem 2.25rem', fontSize: '1.1rem' }}
                  onClick={() => setCurrentView('setup')}
                >
                  <Swords size={20} />
                  <span>Start a Debate</span>
                </button>
              </div>

              {/* Stats Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ color: 'var(--accent-blue)' }}>
                    <Swords size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{totalDebates}</div>
                    <div className="stat-label">Total Debates Completed</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ color: 'var(--accent-violet)' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{avgScore > 0 ? `${avgScore}/100` : 'N/A'}</div>
                    <div className="stat-label">Average Mastery Score</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ color: 'var(--accent-emerald)' }}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{apiKeyConfigured ? 'Live AI' : 'Demo Mode'}</div>
                    <div className="stat-label">Engine Configuration</div>
                  </div>
                </div>
              </div>

              {/* Quick Setup Topic Suggestions */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Hot Debate Topics</h3>
                  <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setCurrentView('setup')}>
                    View All & Custom Topics <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {[
                    'Is artificial intelligence replacing human jobs?',
                    'Should college attendance be compulsory?',
                    'Is social media beneficial for students?',
                    'Should AI-generated content be labelled?',
                  ].map((t) => (
                    <div
                      key={t}
                      className="topic-card"
                      onClick={() => setCurrentView('setup')}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-violet)', fontSize: '0.8rem', fontWeight: 700 }}>
                        <span>Challenge AI</span> <ArrowRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Recent Debate History</h3>
                  {history.length > 0 && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setCurrentView('history')}>
                      View Full History ({history.length})
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <p>No debate records yet. Start your first debate to build your history!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '1rem',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {item.topic}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                            <span className="badge badge-blue">Position: {item.userPosition}</span>
                            <span className="badge badge-violet">{item.difficulty}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {item.evaluation && (
                            <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                              Score: {item.evaluation.overallScore}/100
                            </span>
                          )}
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            onClick={() => handleSelectSavedDebate(item)}
                          >
                            View Report
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SETUP DEBATE */}
          {currentView === 'setup' && (
            <TopicSelector
              onStartDebate={handleStartDebate}
              isLoading={isLoading}
            />
          )}

          {/* VIEW: LIVE DEBATE ROOM */}
          {currentView === 'debate' && activeDebate && (
            <DebateRoom
              debateConfig={activeDebate}
              messages={activeDebate.messages}
              onSubmitArgument={handleSubmitArgument}
              onEndDebate={handleEndDebate}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetryArgument}
              apiKeyConfigured={apiKeyConfigured}
            />
          )}

          {/* VIEW: RESULTS & EVALUATION */}
          {currentView === 'results' && selectedDebateReport && (
            <DebateResults
              debateData={selectedDebateReport}
              onReturnHome={() => setCurrentView('dashboard')}
              onNewDebate={() => setCurrentView('setup')}
            />
          )}

          {/* VIEW: FULL HISTORY LIST */}
          {currentView === 'history' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem' }}>Debate History</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Review all past completed debates and AI evaluation reports.</p>
                </div>
                {history.length > 0 && (
                  <button className="btn btn-danger" onClick={handleClearHistory}>
                    <Trash2 size={16} /> Clear All History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <History size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h2>No Debate History Yet</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start your first debate to see your results here.</p>
                  <button className="btn btn-primary" onClick={() => setCurrentView('setup')}>
                    <PlusCircle size={18} /> Start a Debate
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-emerald">User: {item.userPosition}</span>
                          <span className="badge badge-blue">AI: {item.aiPosition}</span>
                          <span className="badge badge-violet">{item.difficulty}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(item.date).toLocaleString()}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.topic}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.messages ? `${item.messages.length} message exchanges` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {item.evaluation && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)' }}>
                              {item.evaluation.overallScore}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/100</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OVERALL SCORE</div>
                          </div>
                        )}

                        <button className="btn btn-secondary" onClick={() => handleSelectSavedDebate(item)}>
                          View Report
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          title="Delete history item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
