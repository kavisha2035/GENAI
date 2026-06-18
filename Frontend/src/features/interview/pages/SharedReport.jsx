import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { getSharedReportApi } from "../services/interview.api"
import "../style/shared-report.scss"

/**
 * SharedReport — Public page showing a shared interview report.
 * Accessible without authentication via a unique slug.
 */
export default function SharedReport() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadSharedReport()
    }, [slug])

    const loadSharedReport = async () => {
        try {
            setLoading(true)
            const data = await getSharedReportApi(slug)
            setReport(data.report)
        } catch (err) {
            setError(err?.response?.data?.message || "Report not found or has been made private.")
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "#10b981"
        if (score >= 60) return "#f59e0b"
        return "#ef4444"
    }

    if (loading) {
        return (
            <div className="shared-report-page loading-state">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading shared report...</p>
                </div>
            </div>
        )
    }

    if (error || !report) {
        return (
            <div className="shared-report-page loading-state">
                <div className="loading-container">
                    <div className="error-icon"></div>
                    <h2>Report Unavailable</h2>
                    <p>{error || "This report could not be found."}</p>
                    <button className="cta-btn" onClick={() => navigate("/")}>
                        Go to Interview Prep AI →
                    </button>
                </div>
            </div>
        )
    }

    const matchScore = report.matchScore || 0
    const circumference = 2 * Math.PI * 52

    return (
        <div className="shared-report-page">
            {/* Header */}
            <header className="shared-header">
                <div className="shared-brand" onClick={() => navigate("/")}>
                    <span className="brand-icon"></span>
                    <span>Interview Prep AI</span>
                </div>
                <span className="shared-badge">Shared Report</span>
            </header>

            <div className="shared-content">
                {/* Title + Score */}
                <div className="shared-hero">
                    <div className="hero-text">
                        <h1>{report.title}</h1>
                        <p>AI-generated interview preparation report</p>
                        <span className="shared-date">
                            Created: {new Date(report.createdAt).toLocaleDateString("en", {
                                year: "numeric", month: "long", day: "numeric"
                            })}
                        </span>
                    </div>
                    <div className="hero-score">
                        <svg viewBox="0 0 120 120" className="score-ring-svg">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#1b2046" strokeWidth="8" />
                            <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor(matchScore)}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${(matchScore / 100) * circumference} ${circumference}`}
                                transform="rotate(-90 60 60)"
                                style={{ transition: "stroke-dashoffset 0.8s ease" }}
                            />
                            <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{matchScore}</text>
                            <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">MATCH</text>
                        </svg>
                    </div>
                </div>

                {/* Skill Gaps */}
                {report.skillGaps?.length > 0 && (
                    <section className="shared-section">
                        <h2>Skill Gaps</h2>
                        <div className="skill-gaps-grid">
                            {report.skillGaps.map((g, i) => (
                                <div key={i} className={`shared-gap-pill severity-${g.severity}`}>
                                    <span>{g.skill}</span>
                                    <span className="sev-badge">{g.severity}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Technical Questions */}
                {report.technicalQuestions?.length > 0 && (
                    <section className="shared-section">
                        <h2>Technical Questions</h2>
                        <div className="shared-questions">
                            {report.technicalQuestions.map((q, i) => (
                                <div key={i} className="shared-q-card">
                                    <div className="sq-header">
                                        <span className="sq-num">Q{i + 1}</span>
                                        <span className="sq-type technical">Technical</span>
                                    </div>
                                    <h3>{q.question}</h3>
                                    <div className="sq-meta">
                                        <span className="sq-meta-label">Intent:</span> {q.intention}
                                    </div>
                                    <div className="sq-answer">
                                        <span className="sq-meta-label">Suggested Answer:</span>
                                        <p>{q.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Behavioral Questions */}
                {report.behavioralQuestions?.length > 0 && (
                    <section className="shared-section">
                        <h2>Behavioral Questions</h2>
                        <div className="shared-questions">
                            {report.behavioralQuestions.map((q, i) => (
                                <div key={i} className="shared-q-card">
                                    <div className="sq-header">
                                        <span className="sq-num">Q{i + 1}</span>
                                        <span className="sq-type behavioral">Behavioral</span>
                                    </div>
                                    <h3>{q.question}</h3>
                                    <div className="sq-meta">
                                        <span className="sq-meta-label">Intent:</span> {q.intention}
                                    </div>
                                    <div className="sq-answer">
                                        <span className="sq-meta-label">Suggested Answer:</span>
                                        <p>{q.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Preparation Plan */}
                {report.preparationPlan?.length > 0 && (
                    <section className="shared-section">
                        <h2>7-Day Preparation Plan</h2>
                        <div className="shared-prep-plan">
                            {report.preparationPlan.map((p, i) => (
                                <div key={i} className="prep-day-card">
                                    <div className="prep-day-header">
                                        <span className="day-num">Day {p.day}</span>
                                        <span className="day-focus">{p.focus}</span>
                                    </div>
                                    <ul>
                                        {(p.tasks || []).map((t, j) => <li key={j}>{t}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <div className="shared-cta">
                    <h3>Want your own AI interview report?</h3>
                    <button className="cta-btn" onClick={() => navigate("/register")}>
                        Get Started Free →
                    </button>
                </div>
            </div>
        </div>
    )
}
