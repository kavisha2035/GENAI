import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth'
import { generateSkillRoadmapApi, getShareLinkApi } from '../services/interview.api'
import CodingRound from './CodingRound'

const KEY_PHRASES = [
    "deadline urgency", "project impact", "track progress", "transparency with clients and team members",
    "manage expectations", "negotiate deadlines", "organized", "deliver quality work on time",
    "performance optimization", "rendering behavior", "Core Web Vitals", "bundle optimization",
    "user experience engineering", "critical CSS", "CSS Grid", "Flexbox", "Server-Side Rendering",
    "Next.js", "closures", "lexical environment", "conflict resolution", "production bug",
    "continuous learning", "critical path", "shifting dependencies", "Agile", "Waterfall",
    "Hybrid", "Earned Value Management", "scope changes", "whitepaper", "Instagram ad",
    "usability testing", "design system", "Mixpanel/Amplitude", "MECE", "financial modeling",
    "STAR method", "STAR structure", "active listening", "workflow automation", "data analytics"
];

// Helper function to bold key phrases
const boldKeyPhrases = (text) => {
    if (!text) return '';
    let formatted = text;
    KEY_PHRASES.forEach(phrase => {
        const regex = new RegExp(`\\b(${phrase})\\b`, 'gi');
        formatted = formatted.replace(regex, '<strong>$1</strong>');
    });
    return formatted;
};

const Interview = () => {
    const navigate = useNavigate()
    const { report, reports, getResumePdf, loading } = useInterview()
    const { user, handleLogout } = useAuth()
    const [activeTab, setActiveTab] = useState('roadmap') // 'roadmap' | 'questions_they_ask' | 'questions_you_ask' | 'skill_roadmap' | 'coding'
    const [questionFilter, setQuestionFilter] = useState('all') // 'all' | 'technical' | 'behavioral'
    const [skillRoadmap, setSkillRoadmap] = useState(null)
    const [roadmapLoading, setRoadmapLoading] = useState(false)
    const [shareLink, setShareLink] = useState(null)
    const [shareLoading, setShareLoading] = useState(false)

    if (!report && loading) {
        return (
            <main className="interview-loading-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Generating your AI preparation report...</p>
                </div>
            </main>
        )
    }

    if (!report) {
        return (
            <main className="interview-loading-page">
                <div className="loading-container error-state">
                    <p>No interview report found.</p>
                    <button className="back-btn" onClick={() => navigate('/')}>&larr; Create New Report</button>
                </div>
            </main>
        )
    }

    const getScoreColor = (score) => {
        if (score >= 80) return '#613bf7' // Purple / Accent
        if (score >= 60) return '#f59e0b' // Yellow
        return '#ef4444' // Red
    }

    const getScoreText = (score) => {
        if (score >= 80) return 'Strong match for this role'
        if (score >= 60) return 'Moderate match for this role'
        return 'Weak match for this role'
    }

    // Helper to calculate SVG dash offsets
    const radius = 42
    const strokeWidth = 7
    const circumference = 2 * Math.PI * radius
    const score = report.matchScore || 0
    const strokeDashoffset = circumference - (score / 100) * circumference

    // Combine and label questions for "Questions they might ask you"
    const technicalQs = (report.technicalQuestions || []).map(q => ({ ...q, type: 'technical' }));
    const behavioralQs = (report.behavioralQuestions || []).map(q => ({ ...q, type: 'behavioral' }));
    const allQuestionsTheyAsk = [...technicalQs, ...behavioralQs];

    const filteredQuestionsTheyAsk = allQuestionsTheyAsk.filter(q => {
        if (questionFilter === 'technical') return q.type === 'technical';
        if (questionFilter === 'behavioral') return q.type === 'behavioral';
        return true;
    });

    const isMock = report._id?.startsWith("mock-");

    return (
        <div className="interview-dashboard">
            {/* Left Sidebar */}
            <aside className="interview-sidebar">
                <div className="sidebar-header" onClick={() => navigate('/')}>
                    <div className="logo-icon-svg">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="6" fill="#613bf7" />
                            <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2>prepDashboard</h2>
                </div>
                
                <div className="sidebar-menu-section">
                    <h3>SECTIONS</h3>
                    <nav className="sidebar-nav">
                        <button 
                            className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                            onClick={() => setActiveTab('roadmap')}
                        >
                            <span className="nav-icon"></span>
                            <span className="nav-label">Road Map</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'questions_they_ask' ? 'active' : ''}`}
                            onClick={() => setActiveTab('questions_they_ask')}
                        >
                            <span className="nav-icon"></span>
                            <span className="nav-label">Questions They Ask</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'questions_you_ask' ? 'active' : ''}`}
                            onClick={() => setActiveTab('questions_you_ask')}
                        >
                            <span className="nav-icon"></span>
                            <span className="nav-label">Questions to Ask</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'skill_roadmap' ? 'active' : ''}`}
                            onClick={async () => {
                                setActiveTab('skill_roadmap')
                                if (!skillRoadmap && !roadmapLoading && !isMock) {
                                    setRoadmapLoading(true)
                                    try {
                                        const data = await generateSkillRoadmapApi(report._id)
                                        setSkillRoadmap(data.roadmap || [])
                                    } catch (err) {
                                        console.error('Roadmap error:', err)
                                    } finally {
                                        setRoadmapLoading(false)
                                    }
                                }
                            }}
                        >
                            <span className="nav-icon"></span>
                            <span className="nav-label">Skill Roadmap</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'coding' ? 'active' : ''}`}
                            onClick={() => setActiveTab('coding')}
                        >
                            <span className="nav-icon"></span>
                            <span className="nav-label">Coding Round</span>
                        </button>
                    </nav>
                </div>

                <div className="sidebar-menu-section recent-reports-nav">
                    <h3>RECENT PLANS</h3>
                    <div className="sidebar-reports-list">
                        {reports && reports.length > 0 ? (
                            reports.map((rep) => (
                                <button 
                                    key={rep._id} 
                                    className={`sidebar-report-item ${report._id === rep._id ? 'active' : ''}`}
                                    onClick={() => navigate(`/interview/${rep._id}`)}
                                >
                                    <span className="report-icon"></span>
                                    <div className="report-info">
                                        <span className="report-title">{rep.title || "Interview Plan"}</span>
                                        <span className="report-meta">
                                            {rep._id.startsWith("mock-") ? "Showcase / Basic" : `${rep.matchScore}% Match`}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="no-reports-sidebar">No plans generated</p>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button 
                        className={`sidebar-btn primary ${isMock ? 'disabled' : ''}`} 
                        onClick={() => getResumePdf(report._id)} 
                        disabled={loading || isMock}
                        title={isMock ? "Only available in Personalized Mode" : "Download Resume PDF"}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ display: 'inline-block', marginRight: '8px', animation: 'spin 1s linear infinite' }}>⟳</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                 AI Resume PDF
                            </>
                        )}
                    </button>
                    <button className="sidebar-btn secondary" onClick={() => window.print()} disabled={loading}>
                         Print Report
                    </button>
                    <button className="sidebar-btn secondary" onClick={() => navigate('/')} disabled={loading}>
                        &larr; Create New
                    </button>
                    <button 
                        className="sidebar-btn secondary" 
                        onClick={() => navigate(`/voice-interview/${report._id}`)}
                        disabled={isMock}
                        title={isMock ? "Only available for real reports" : "Practice with voice"}
                    >
                         Practice
                    </button>
                    <button 
                        className="sidebar-btn secondary" 
                        onClick={async () => {
                            if (shareLink) {
                                navigator.clipboard.writeText(window.location.origin + shareLink)
                                alert('Share link copied!')
                                return
                            }
                            setShareLoading(true)
                            try {
                                const data = await getShareLinkApi(report._id)
                                setShareLink(data.shareUrl)
                                navigator.clipboard.writeText(window.location.origin + data.shareUrl)
                                alert('Share link copied to clipboard!')
                            } catch (err) {
                                console.error('Share error:', err)
                            } finally {
                                setShareLoading(false)
                            }
                        }}
                        disabled={isMock || shareLoading}
                    >
                        {shareLoading ? 'Generating...' : shareLink ? 'Copy Link' : 'Share Report'}
                    </button>
                </div>
            </aside>

            {/* Center Main Content */}
            <main className="interview-main-content">
                <div className="tab-content">
                    {activeTab === 'roadmap' && (
                        <div className="roadmap-section">
                            <div className="section-title-bar">
                                <div className="title-left">
                                    <h2>Preparation Road Map</h2>
                                    <p className="subtitle">Your customized step-by-step 7-day milestone guide.</p>
                                </div>
                                <span className="badge-pill">7-day plan</span>
                            </div>
                            
                            <div className="timeline-container">
                                <div className="timeline-line"></div>
                                {report.preparationPlan && report.preparationPlan.length > 0 ? (
                                    report.preparationPlan.map((day, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-badge-container">
                                                <div className="timeline-dot"></div>
                                                <span className="timeline-day-pill">Day {day.day}</span>
                                                <h3 className="timeline-day-title">{day.focus}</h3>
                                            </div>
                                            <div className="timeline-content-details">
                                                <ul>
                                                    {Array.isArray(day.tasks) ? (
                                                        day.tasks.map((task, taskIdx) => (
                                                            <li key={taskIdx}>{task}</li>
                                                        ))
                                                    ) : (
                                                        <li>{day.tasks}</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">No preparation plan available</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions_they_ask' && (
                        <div className="questions-section">
                            <div className="section-title-bar">
                                <div className="title-left">
                                    <h2>Questions They Might Ask You</h2>
                                    <p className="subtitle">Common technical and behavioral inquiries tailored to this role.</p>
                                </div>
                                <div className="filter-buttons">
                                    <button 
                                        className={`filter-btn ${questionFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setQuestionFilter('all')}
                                    >
                                        All ({allQuestionsTheyAsk.length})
                                    </button>
                                    <button 
                                        className={`filter-btn ${questionFilter === 'technical' ? 'active' : ''}`}
                                        onClick={() => setQuestionFilter('technical')}
                                    >
                                        Technical ({technicalQs.length})
                                    </button>
                                    <button 
                                        className={`filter-btn ${questionFilter === 'behavioral' ? 'active' : ''}`}
                                        onClick={() => setQuestionFilter('behavioral')}
                                    >
                                        Behavioral ({behavioralQs.length})
                                    </button>
                                </div>
                            </div>

                            <div className="questions-list">
                                {filteredQuestionsTheyAsk.length > 0 ? (
                                    filteredQuestionsTheyAsk.map((item, idx) => (
                                        <div key={idx} className="question-card">
                                            <div className="question-card-header">
                                                <div className="card-header-meta">
                                                    <span className="question-index">Q{idx + 1}</span>
                                                    <span className={`type-badge badge-${item.type}`}>
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="question-intention">
                                                    <h4>Why recruiters ask this:</h4>
                                                    <p>{item.intention}</p>
                                                </div>
                                            </div>
                                            <div className="question-body">
                                                <div className="question-text">
                                                    <h4>Question:</h4>
                                                    <p className="actual-q-text">"{item.question}"</p>
                                                </div>
                                                <div className="suggested-answer">
                                                    <h4>Suggested Answer / Approach:</h4>
                                                    <p 
                                                        className="actual-ans-text"
                                                        dangerouslySetInnerHTML={{ __html: boldKeyPhrases(item.answer) }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">No questions match this filter</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions_you_ask' && (
                        <div className="questions-section">
                            <div className="section-title-bar">
                                <div className="title-left">
                                    <h2>Smart Questions You Can Ask Them</h2>
                                    <p className="subtitle">Show interest, intelligence, and project confidence by asking these questions.</p>
                                </div>
                                <span className="badge-pill">Reverse Interviewing</span>
                            </div>

                            <div className="questions-list">
                                {report.questionsToAsk && report.questionsToAsk.length > 0 ? (
                                    report.questionsToAsk.map((item, idx) => (
                                        <div key={idx} className="question-card ask-card">
                                            <div className="question-card-header">
                                                <div className="card-header-meta">
                                                    <span className="question-index">Q{idx + 1}</span>
                                                    <span className="type-badge badge-reverse">REVERSE</span>
                                                </div>
                                                <div className="question-intention">
                                                    <h4>Why ask this question:</h4>
                                                    <p>{item.intention}</p>
                                                </div>
                                            </div>
                                            <div className="question-body">
                                                <div className="question-text">
                                                    <h4>What to ask:</h4>
                                                    <p className="actual-q-text highlight-q">"{item.question}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">No reverse interview questions available</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'skill_roadmap' && (
                        <div className="roadmap-section">
                            <div className="section-title-bar">
                                <div className="title-left">
                                    <h2>Skill Development Roadmap</h2>
                                    <p className="subtitle">Personalized learning path based on your skill gaps for this role.</p>
                                </div>
                                <span className="badge-pill">AI Generated</span>
                            </div>

                            {roadmapLoading ? (
                                <div className="roadmap-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Generating your personalized roadmap...</p>
                                </div>
                            ) : skillRoadmap && skillRoadmap.length > 0 ? (
                                <div className="skill-roadmap-list">
                                    {skillRoadmap.map((item, idx) => (
                                        <div key={idx} className={`skill-roadmap-card priority-${item.priority}`}>
                                            <div className="sr-card-header">
                                                <h3>{item.skill}</h3>
                                                <span className={`sr-priority priority-${item.priority}`}>{item.priority}</span>
                                            </div>
                                            <div className="sr-levels">
                                                <span className="sr-level current">{item.currentLevel}</span>
                                                <span className="sr-arrow">→</span>
                                                <span className="sr-level target">{item.targetLevel}</span>
                                            </div>
                                            <div className="sr-time">
                                                ~{item.estimatedWeeks} weeks
                                            </div>
                                            <div className="sr-resources">
                                                <h4>Resources & Actions</h4>
                                                <ul>
                                                    {(item.resources || []).map((r, j) => <li key={j}>{r}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : isMock ? (
                                <p className="empty-state">Skill roadmap is only available for personalized reports. Generate a report with your resume to get a custom roadmap.</p>
                            ) : (
                                <p className="empty-state">No roadmap data available. Click the tab again to regenerate.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'coding' && (
                        <div className="roadmap-section">
                            <div className="section-title-bar">
                                <div className="title-left">
                                    <h2>Coding Round Simulator</h2>
                                    <p className="subtitle">Practice job description aligned coding questions with progressive hints.</p>
                                </div>
                                <span className="badge-pill">DSA Simulation</span>
                            </div>
                            <CodingRound reportId={report._id} />
                        </div>
                    )}
                </div>
            </main>

            {/* Right Status Bar */}
            <aside className="interview-status-bar">
                {/* Score Section */}
                <div className="status-section score-section">
                    <h3>MATCH SCORE</h3>
                    <div className="score-ring-container">
                        {isMock ? (
                            <div className="basic-score-display">
                                <span className="basic-icon"></span>
                                <span className="basic-tag">Basic Mode</span>
                                <p className="basic-desc">No resume was uploaded to compute match score.</p>
                            </div>
                        ) : (
                            <>
                                <svg className="score-ring-svg" width="120" height="120" viewBox="0 0 120 120">
                                    <circle
                                        className="score-ring-bg"
                                        cx="60"
                                        cy="60"
                                        r={radius}
                                        stroke="#1e2554"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                    />
                                    <circle
                                        className="score-ring-progress"
                                        cx="60"
                                        cy="60"
                                        r={radius}
                                        stroke={getScoreColor(score)}
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                    />
                                    <text
                                        className="score-ring-text"
                                        x="60"
                                        y="67"
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="22"
                                        fontWeight="bold"
                                    >
                                        {score}%
                                    </text>
                                </svg>
                                <p className="score-descriptor" style={{ color: getScoreColor(score) }}>
                                    {getScoreText(score)}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Skill Gaps Section */}
                <div className="status-section skill-gaps-section">
                    <h3>KEY SKILL GAPS</h3>
                    <div className="skill-gaps-container">
                        {report.skillGaps && report.skillGaps.length > 0 ? (
                            report.skillGaps.map((gap, idx) => (
                                <div key={idx} className={`skill-gap-pill severity-${gap.severity?.toLowerCase()}`}>
                                    <span className="gap-name">{gap.skill}</span>
                                    <span className="gap-severity-badge">{gap.severity}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No skill gaps identified</p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default Interview
