import React, { useState, useEffect } from 'react';
import { fetchCodingQuestions } from '../services/tracker.api.js';
import '../style/coding.scss';

const DIFFICULTY_COLORS = {
  easy:   { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  hard:   { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' }
};

export default function CodingRound({ reportId }) {
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);  // active question
  const [hintsShown, setHintsShown] = useState(0);     // 0, 1, 2, 3
  const [showApproach, setShowApproach] = useState(false);
  const [filter, setFilter]         = useState('all'); // all|easy|medium|hard

  useEffect(() => {
    if (!reportId) return;
    setLoading(true);
    fetchCodingQuestions(reportId)
      .then(({ data }) => {
        const qs = data.questions || [];
        setQuestions(qs);
        setSelected(qs[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load coding round questions:', err);
        setLoading(false);
      });
  }, [reportId]);

  const openQuestion = (q) => {
    setSelected(q);
    setHintsShown(0);
    setShowApproach(false);
  };

  const filtered = filter === 'all'
    ? questions
    : questions.filter(q => String(q.difficulty).toLowerCase() === filter);

  if (loading) {
    return (
      <div className="coding-loading">
        Generating your coding round questions...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="coding-empty">Could not load questions. Try refreshing.</div>
    );
  }

  return (
    <div className="coding-round">
      {/* Left panel - question list */}
      <div className="coding-list">
        <div className="coding-filters">
          {['all','easy','medium','hard'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.map((q, i) => (
          <div
            key={q.id || i}
            className={`coding-list-item ${selected?.id === q.id ? 'active' : ''}`}
            onClick={() => openQuestion(q)}
          >
            <span className="q-number">{i + 1}</span>
            <div className="q-meta">
              <span className="q-list-title">{q.title}</span>
              <span className="q-topic-tag">{q.topic}</span>
            </div>
            <DiffBadge difficulty={q.difficulty} />
          </div>
        ))}
      </div>

      {/* Right panel - question detail */}
      {selected && (
        <div className="coding-detail">
          <div className="coding-detail-header">
            <h2>{selected.title}</h2>
            <DiffBadge difficulty={selected.difficulty} />
          </div>

          <div className="coding-topic-pill">{selected.topic}</div>

          <p className="coding-description">{selected.description}</p>

          {/* Examples */}
          <div className="coding-section-label">Examples</div>
          {selected.examples && selected.examples.map((ex, i) => (
            <div key={i} className="coding-example">
              <div><span className="ex-label">Input:</span> <code>{ex.input}</code></div>
              <div><span className="ex-label">Output:</span> <code>{ex.output}</code></div>
              {ex.explanation && (
                <div className="ex-explanation">{ex.explanation}</div>
              )}
            </div>
          ))}

          {/* Constraints */}
          {selected.constraints && selected.constraints.length > 0 && (
            <>
              <div className="coding-section-label">Constraints</div>
              <ul className="coding-constraints">
                {selected.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          )}

          {/* Progressive hints */}
          <div className="coding-section-label">Hints</div>
          <div className="hints-area">
            {selected.hints && selected.hints.slice(0, hintsShown).map((hint, i) => (
              <div key={i} className="hint-bubble">
                <span className="hint-label">Hint {i + 1}</span>
                <p>{hint}</p>
              </div>
            ))}
            {selected.hints && hintsShown < selected.hints.length && (
              <button
                className="btn-hint"
                onClick={() => setHintsShown(h => h + 1)}
              >
                {hintsShown === 0 ? 'Show first hint' : `Show hint ${hintsShown + 1}`}
              </button>
            )}
            {selected.hints && hintsShown === selected.hints.length && (
              <span className="hints-exhausted">All hints shown</span>
            )}
          </div>

          {/* Approach + complexity reveal */}
          <div className="approach-section">
            {!showApproach ? (
              <button
                className="btn-reveal"
                onClick={() => setShowApproach(true)}
              >
                Reveal approach and complexity
              </button>
            ) : (
              <div className="approach-box">
                <div className="coding-section-label">Optimal approach</div>
                <p>{selected.approach}</p>
                <div className="complexity-row">
                  <div className="complexity-chip">
                    <span className="complexity-label">Time Complexity</span>
                    <code>{selected.timeComplexity}</code>
                  </div>
                  <div className="complexity-chip">
                    <span className="complexity-label">Space Complexity</span>
                    <code>{selected.spaceComplexity}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DiffBadge({ difficulty }) {
  const cleanDiff = String(difficulty || '').toLowerCase();
  const c = DIFFICULTY_COLORS[cleanDiff] || DIFFICULTY_COLORS.medium;
  return (
    <span className="diff-badge" style={{
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`
    }}>
      {difficulty}
    </span>
  );
}
