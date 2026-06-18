import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { getAnalyticsApi } from "../services/interview.api"
import "../style/analytics.scss"

/**
 * Analytics — Dashboard showing user activity stats, score history,
 * weekly activity, and practice performance.
 * Uses Canvas 2D API for charts (no external chart library required).
 */
export default function Analytics() {
    const navigate = useNavigate()
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const scoreChartRef = useRef(null)
    const activityChartRef = useRef(null)

    useEffect(() => {
        loadAnalytics()
    }, [])

    useEffect(() => {
        if (analytics) {
            drawScoreChart()
            drawActivityChart()
        }
    }, [analytics])

    const loadAnalytics = async () => {
        try {
            setLoading(true)
            const data = await getAnalyticsApi()
            setAnalytics(data.analytics)
        } catch (err) {
            console.error("Failed to load analytics:", err)
            setError("Unable to load analytics. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const drawScoreChart = () => {
        const canvas = scoreChartRef.current
        if (!canvas || !analytics?.scoreHistory?.length) return

        const ctx = canvas.getContext("2d")
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const w = rect.width
        const h = rect.height
        const padding = { top: 20, right: 20, bottom: 40, left: 45 }
        const chartW = w - padding.left - padding.right
        const chartH = h - padding.top - padding.bottom

        const scores = analytics.scoreHistory
        const maxScore = 100
        const minScore = 0

        // Clear
        ctx.clearRect(0, 0, w, h)

        // Grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.04)"
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(w - padding.right, y)
            ctx.stroke()

            // Y-axis labels
            ctx.fillStyle = "#64748b"
            ctx.font = "11px Outfit"
            ctx.textAlign = "right"
            ctx.fillText(Math.round(maxScore - (maxScore / 4) * i), padding.left - 8, y + 4)
        }

        if (scores.length < 2) {
            ctx.fillStyle = "#64748b"
            ctx.font = "13px Outfit"
            ctx.textAlign = "center"
            ctx.fillText("Generate more reports to see trends", w / 2, h / 2)
            return
        }

        // Draw gradient area + line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
        gradient.addColorStop(0, "rgba(97, 59, 247, 0.15)")
        gradient.addColorStop(1, "rgba(97, 59, 247, 0)")

        ctx.beginPath()
        scores.forEach((s, i) => {
            const x = padding.left + (i / (scores.length - 1)) * chartW
            const y = padding.top + (1 - (s.score - minScore) / (maxScore - minScore)) * chartH
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })
        // Close area
        const pathEnd = padding.left + chartW
        ctx.lineTo(pathEnd, padding.top + chartH)
        ctx.lineTo(padding.left, padding.top + chartH)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line
        ctx.beginPath()
        scores.forEach((s, i) => {
            const x = padding.left + (i / (scores.length - 1)) * chartW
            const y = padding.top + (1 - (s.score - minScore) / (maxScore - minScore)) * chartH
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })
        ctx.strokeStyle = "#613bf7"
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Draw dots
        scores.forEach((s, i) => {
            const x = padding.left + (i / (scores.length - 1)) * chartW
            const y = padding.top + (1 - (s.score - minScore) / (maxScore - minScore)) * chartH
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fillStyle = "#613bf7"
            ctx.fill()
            ctx.strokeStyle = "#0c102b"
            ctx.lineWidth = 2
            ctx.stroke()
        })

        // X-axis labels
        ctx.fillStyle = "#64748b"
        ctx.font = "10px Outfit"
        ctx.textAlign = "center"
        scores.forEach((s, i) => {
            if (scores.length <= 8 || i % Math.ceil(scores.length / 8) === 0) {
                const x = padding.left + (i / (scores.length - 1)) * chartW
                const label = new Date(s.date).toLocaleDateString("en", { month: "short", day: "numeric" })
                ctx.fillText(label, x, h - padding.bottom + 20)
            }
        })
    }

    const drawActivityChart = () => {
        const canvas = activityChartRef.current
        if (!canvas || !analytics?.weeklyActivity?.length) return

        const ctx = canvas.getContext("2d")
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const w = rect.width
        const h = rect.height
        const padding = { top: 15, right: 15, bottom: 35, left: 15 }

        ctx.clearRect(0, 0, w, h)

        const data = analytics.weeklyActivity
        const maxCount = Math.max(...data.map(d => d.count), 1)
        const barWidth = Math.min(40, (w - padding.left - padding.right) / data.length - 8)

        data.forEach((d, i) => {
            const x = padding.left + (i / data.length) * (w - padding.left - padding.right) + barWidth / 2
            const barH = (d.count / maxCount) * (h - padding.top - padding.bottom - 10)
            const y = h - padding.bottom - barH

            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, h - padding.bottom)
            grad.addColorStop(0, "#a855f7")
            grad.addColorStop(1, "#613bf7")

            ctx.fillStyle = grad
            ctx.beginPath()
            // Safari-safe rounded rectangle
            const r = 4
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + barWidth - r, y)
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r)
            ctx.lineTo(x + barWidth, y + barH)
            ctx.lineTo(x, y + barH)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
            ctx.fill()

            // Count label
            ctx.fillStyle = "#e2e8f0"
            ctx.font = "bold 11px Outfit"
            ctx.textAlign = "center"
            ctx.fillText(d.count, x + barWidth / 2, y - 6)

            // Day label
            ctx.fillStyle = "#64748b"
            ctx.font = "10px Outfit"
            const dayLabel = new Date(d._id).toLocaleDateString("en", { weekday: "short" })
            ctx.fillText(dayLabel, x + barWidth / 2, h - padding.bottom + 18)
        })
    }

    if (loading) {
        return (
            <div className="analytics-page loading-state">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading analytics...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="analytics-page loading-state">
                <div className="loading-container">
                    <p>{error}</p>
                    <button className="retry-btn" onClick={loadAnalytics}>Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="analytics-page">
            {/* Header */}
            <header className="analytics-header">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
                <div>
                    <h1>Analytics</h1>
                    <p className="header-subtitle">Track your interview preparation progress</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.totalReports || 0}</span>
                    <span className="stat-label">Reports</span>
                </div>
                <div className="stat-card highlight">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.avgMatchScore || 0}%</span>
                    <span className="stat-label">Avg Match Score</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.totalEvaluations || 0}</span>
                    <span className="stat-label">Mock Answers</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.totalResumes || 0}</span>
                    <span className="stat-label">Resumes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.totalCoverLetters || 0}</span>
                    <span className="stat-label">Cover Letters</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon"></span>
                    <span className="stat-value">{analytics?.totalMockSessions || 0}</span>
                    <span className="stat-label">Mock Sessions</span>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Match Score Trend</h3>
                    <canvas ref={scoreChartRef} className="chart-canvas" />
                </div>
                <div className="chart-card small">
                    <h3>Weekly Activity</h3>
                    <canvas ref={activityChartRef} className="chart-canvas" />
                </div>
            </div>

            {/* Practice Score History */}
            {analytics?.practiceScores?.length > 0 && (
                <div className="practice-section">
                    <h3>Practice Answer Scores</h3>
                    <div className="practice-scores-list">
                        {analytics.practiceScores.slice(-10).reverse().map((s, i) => (
                            <div key={i} className="practice-score-row">
                                <span className="ps-type">{s.type}</span>
                                <div className="ps-bar-track">
                                    <div className="ps-bar-fill" style={{
                                        width: `${s.score}%`,
                                        background: s.score >= 80 ? "#10b981" : s.score >= 60 ? "#f59e0b" : "#ef4444"
                                    }} />
                                </div>
                                <span className="ps-score" style={{
                                    color: s.score >= 80 ? "#10b981" : s.score >= 60 ? "#f59e0b" : "#ef4444"
                                }}>{s.score}</span>
                                <span className="ps-date">{new Date(s.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {analytics?.recentActivity?.length > 0 && (
                <div className="recent-activity-section">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {analytics.recentActivity.slice(0, 10).map((a, i) => (
                            <div key={i} className="activity-item">
                                <span className="activity-icon">
                                    {a.event === "report_generated" ? "" :
                                     a.event === "resume_downloaded" ? "" :
                                     a.event === "cover_letter_generated" ? "" :
                                     a.event === "answer_evaluated" ? "" :
                                     a.event === "mock_session_started" ? "" :
                                     a.event === "roadmap_generated" ? "" :
                                     a.event === "report_shared" ? "" : ""}
                                </span>
                                <span className="activity-text">{a.event.replace(/_/g, " ")}</span>
                                <span className="activity-time">{new Date(a.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
