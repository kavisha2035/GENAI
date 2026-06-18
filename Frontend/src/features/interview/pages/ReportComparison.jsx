import { useState, useMemo } from "react"
import "../style/comparison.scss"

/**
 * ReportComparison — Compare two interview reports side-by-side.
 * Shows differences in match scores, skill gaps, and questions.
 */
export default function ReportComparison({ reports = [], onClose }) {
    const [leftId, setLeftId] = useState(reports[0]?._id || "")
    const [rightId, setRightId] = useState(reports[1]?._id || "")

    const leftReport = useMemo(() => reports.find(r => r._id === leftId), [reports, leftId])
    const rightReport = useMemo(() => reports.find(r => r._id === rightId), [reports, rightId])

    const getScoreColor = (score) => {
        if (score >= 80) return "#10b981"
        if (score >= 60) return "#f59e0b"
        return "#ef4444"
    }

    const scoreDiff = (leftReport?.matchScore || 0) - (rightReport?.matchScore || 0)

    return (
        <div className="comparison-overlay">
            <div className="comparison-modal">
                <div className="comparison-header">
                    <h2> Report Comparison</h2>
                    <button className="comparison-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Selectors */}
                <div className="comparison-selectors">
                    <div className="selector-group">
                        <label>Report A</label>
                        <select value={leftId} onChange={(e) => setLeftId(e.target.value)}>
                            <option value="">Select report...</option>
                            {reports.map(r => (
                                <option key={r._id} value={r._id} disabled={r._id === rightId}>
                                    {r.title} — {new Date(r.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="vs-badge">VS</div>
                    <div className="selector-group">
                        <label>Report B</label>
                        <select value={rightId} onChange={(e) => setRightId(e.target.value)}>
                            <option value="">Select report...</option>
                            {reports.map(r => (
                                <option key={r._id} value={r._id} disabled={r._id === leftId}>
                                    {r.title} — {new Date(r.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Comparison Content */}
                {leftReport && rightReport ? (
                    <div className="comparison-content">
                        {/* Score Comparison */}
                        <div className="comp-section scores">
                            <h3>Match Scores</h3>
                            <div className="score-comparison-row">
                                <div className="comp-score-card">
                                    <span className="comp-score-value" style={{ color: getScoreColor(leftReport.matchScore) }}>
                                        {leftReport.matchScore || 0}
                                    </span>
                                    <span className="comp-score-label">{leftReport.title}</span>
                                </div>
                                <div className="score-diff">
                                    <span className={`diff-value ${scoreDiff > 0 ? "positive" : scoreDiff < 0 ? "negative" : ""}`}>
                                        {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                                    </span>
                                    <span className="diff-label">difference</span>
                                </div>
                                <div className="comp-score-card">
                                    <span className="comp-score-value" style={{ color: getScoreColor(rightReport.matchScore) }}>
                                        {rightReport.matchScore || 0}
                                    </span>
                                    <span className="comp-score-label">{rightReport.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Skill Gaps Comparison */}
                        <div className="comp-section">
                            <h3>Skill Gaps</h3>
                            <div className="comp-two-col">
                                <div className="comp-col">
                                    <h4>{leftReport.title}</h4>
                                    {(leftReport.skillGaps || []).length > 0 ? (
                                        <div className="comp-gap-list">
                                            {leftReport.skillGaps.map((g, i) => (
                                                <div key={i} className={`comp-gap-pill severity-${g.severity}`}>
                                                    <span>{g.skill}</span>
                                                    <span className="gap-sev">{g.severity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="comp-empty">No skill gaps</p>}
                                </div>
                                <div className="comp-col">
                                    <h4>{rightReport.title}</h4>
                                    {(rightReport.skillGaps || []).length > 0 ? (
                                        <div className="comp-gap-list">
                                            {rightReport.skillGaps.map((g, i) => (
                                                <div key={i} className={`comp-gap-pill severity-${g.severity}`}>
                                                    <span>{g.skill}</span>
                                                    <span className="gap-sev">{g.severity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="comp-empty">No skill gaps</p>}
                                </div>
                            </div>
                        </div>

                        {/* Question Count Comparison */}
                        <div className="comp-section">
                            <h3>Question Coverage</h3>
                            <div className="comp-stats-row">
                                <div className="comp-stat">
                                    <span className="stat-label">Technical Q's</span>
                                    <div className="stat-values">
                                        <span>{(leftReport.technicalQuestions || []).length}</span>
                                        <span className="stat-vs">vs</span>
                                        <span>{(rightReport.technicalQuestions || []).length}</span>
                                    </div>
                                </div>
                                <div className="comp-stat">
                                    <span className="stat-label">Behavioral Q's</span>
                                    <div className="stat-values">
                                        <span>{(leftReport.behavioralQuestions || []).length}</span>
                                        <span className="stat-vs">vs</span>
                                        <span>{(rightReport.behavioralQuestions || []).length}</span>
                                    </div>
                                </div>
                                <div className="comp-stat">
                                    <span className="stat-label">Prep Plan Days</span>
                                    <div className="stat-values">
                                        <span>{(leftReport.preparationPlan || []).length}</span>
                                        <span className="stat-vs">vs</span>
                                        <span>{(rightReport.preparationPlan || []).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="comparison-placeholder">
                        <p>Select two reports above to compare them side-by-side.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
