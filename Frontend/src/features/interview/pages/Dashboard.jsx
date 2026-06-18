import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../auth/hooks/useAuth'
import ReportComparison from './ReportComparison'

const Dashboard = () => {
    const { generateReport, reports, loading } = useInterview()
    const { user, handleLogout } = useAuth()
    const resumeInputRef = useRef(null)
    const navigate = useNavigate()

    // Form inputs state
    const [mode, setMode] = useState('personalized') // 'basic' | 'personalized'
    const [profileSource, setProfileSource] = useState('resume') // 'resume' | 'linkedin' | 'description'
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [isFetchingLinkedin, setIsFetchingLinkedin] = useState(false)
    const [linkedinSuccess, setLinkedinSuccess] = useState(false)
    
    const [jobTitle, setJobTitle] = useState('')
    const [seniority, setSeniority] = useState('mid') // 'junior' | 'mid' | 'senior'
    const [jobDescription, setJobDescription] = useState('')
    const [resume, setResume] = useState(null)
    const [selfDescription, setSelfDescription] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState('')
    const [showComparison, setShowComparison] = useState(false)

    // Navbar dropdown states
    const [activeDropdown, setActiveDropdown] = useState(null)

    const charLimit = 10000
    const jobDescCharCount = jobDescription.length

    // Close dropdowns on outside click
    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdown(null)
        window.addEventListener('click', handleOutsideClick)
        return () => window.removeEventListener('click', handleOutsideClick)
    }, [])

    const toggleDropdown = (e, name) => {
        e.stopPropagation()
        setActiveDropdown(activeDropdown === name ? null : name)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            const file = files[0]
            if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                setResume(file)
            } else {
                alert('Please upload a PDF or DOCX file')
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                setResume(file)
            } else {
                alert('Please upload a PDF or DOCX file')
            }
        }
    }

    const handleFetchLinkedin = (e) => {
        e.preventDefault()
        if (!linkedinUrl.trim()) return
        setIsFetchingLinkedin(true)
        setLinkedinSuccess(false)
        
        // Mocking the profile fetch delay and population
        setTimeout(() => {
            setIsFetchingLinkedin(false)
            setLinkedinSuccess(true)
            // Autofill some fields for UI experience
            if (!jobTitle) setJobTitle("Software Engineer")
            if (!jobDescription) {
                setJobDescription("We are looking for a Senior Frontend Engineer proficient in React, CSS Grid, and optimizing bundle performance. Collaborative mindset and a11y experience is a plus.")
            }
        }, 1500)
    }

    const isFormValid = () => {
        if (mode === 'basic') {
            return jobTitle.trim().length > 0;
        }
        if (!jobTitle.trim()) return false
        if (profileSource === 'resume' && !resume && !jobDescription.trim() && !selfDescription.trim()) return false
        if (profileSource === 'linkedin' && !linkedinSuccess && !jobDescription.trim()) return false
        if (profileSource === 'description' && !selfDescription.trim() && !jobDescription.trim()) return false
        return true
    }

    const handleGenerateStrategy = async () => {
        if (!isFormValid()) {
            setError(
                mode === 'basic' 
                ? 'Please provide a job position/title.' 
                : 'Please provide a job position and your profile details (resume, LinkedIn, or self description).'
            )
            return
        }

        setError('')

        try {
            const reportData = await generateReport({
                jobTitle,
                mode,
                seniority,
                jobDescription,
                selfDescription: profileSource === 'description' ? selfDescription : (profileSource === 'linkedin' ? `LinkedIn profile: ${linkedinUrl}` : ''),
                resumeFile: profileSource === 'resume' ? resume : null
            })

            if (reportData && reportData._id) {
                navigate(`/interview/${reportData._id}`)
            } else {
                setError('Failed to generate interview report. Please try again.')
            }
        } catch (err) {
            console.error('Error generating strategy:', err)
            setError(err.message || 'An error occurred while generating your interview strategy. Please try again.')
        }
    }

    return (
        <main className='home dashboard-view'>
            {/* Header / Navbar */}
            <header className="home-nav">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <div className="logo-icon-svg">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="6" fill="#613bf7" />
                            <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="logo-text">Interview Prep AI</span>
                </div>

                <nav className="nav-menu">
                    <span className="nav-menu-btn active-dash-badge">prepDashboard</span>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/resumes'); }}>Resumes</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/cover-letter'); }}>Cover Letter</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/tracker'); }}>Job Tracker</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Back to Landing</a>
                </nav>

                <div className="nav-actions">
                    {user && (
                        <div className="user-profile">
                            <span className="username">{user.username || user.email}</span>
                            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                        </div>
                    )}
                </div>
            </header>

            <div className="home-wrapper">
                {/* Generator Form Section */}
                <section id="generator-form" className="form-card-container">
                    <div className="form-card-header">
                        <h2>Configure Your Interview Setup</h2>
                        <p className="form-subtitle">Choose between instant standard reviews or deep resume-aligned reports.</p>
                        
                        <div className="mode-toggle-tabs">
                            <button 
                                className={`mode-tab ${mode === 'basic' ? 'active' : ''}`}
                                onClick={() => {
                                    setMode('basic')
                                    setError('')
                                }}
                            >
                                Basic Mode
                            </button>
                            <button 
                                className={`mode-tab ${mode === 'personalized' ? 'active' : ''}`}
                                onClick={() => {
                                    setMode('personalized')
                                    setError('')
                                }}
                            >
                                Personalized Mode
                            </button>
                        </div>
                    </div>

                    <div className="form-card-body">
                        {/* Common Top Row */}
                        <div className="common-inputs-row">
                            <div className="input-group">
                                <label htmlFor="jobTitle">Job Position / Title <span className="req">*</span></label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Front End Developer, Project Manager..."
                                    className="text-input"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Seniority Level</label>
                                <div className="seniority-pills">
                                    {['junior', 'mid', 'senior'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`seniority-pill ${seniority === level ? 'active' : ''}`}
                                            onClick={() => setSeniority(level)}
                                        >
                                            {level.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mode-specific content */}
                        {mode === 'personalized' ? (
                            <div className="personalized-inputs-grid">
                                <div className="left-section">
                                    <div className="section-header">
                                        <span className="section-icon"></span>
                                        <h3>Target Job Description</h3>
                                        <span className="badge required">RECOMMENDED</span>
                                    </div>

                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value.slice(0, charLimit))}
                                        placeholder="Paste the full job description here to align the questions and score with requirements..."
                                        className="job-textarea"
                                    />

                                    <div className="char-counter">
                                        <span>{jobDescCharCount} / {charLimit} chars</span>
                                    </div>
                                </div>

                                <div className="right-section">
                                    <div className="section-header">
                                        <span className="section-icon"></span>
                                        <h3>Your Profile Sources</h3>
                                    </div>

                                    <div className="profile-source-tabs">
                                        <button 
                                            type="button"
                                            className={`profile-src-tab ${profileSource === 'resume' ? 'active' : ''}`}
                                            onClick={() => setProfileSource('resume')}
                                        >
                                            Upload CV
                                        </button>
                                        <button 
                                            type="button"
                                            className={`profile-src-tab ${profileSource === 'linkedin' ? 'active' : ''}`}
                                            onClick={() => setProfileSource('linkedin')}
                                        >
                                            LinkedIn
                                        </button>
                                        <button 
                                            type="button"
                                            className={`profile-src-tab ${profileSource === 'description' ? 'active' : ''}`}
                                            onClick={() => setProfileSource('description')}
                                        >
                                            Text Bio
                                        </button>
                                    </div>

                                    <div className="profile-input-content">
                                        {profileSource === 'resume' && (
                                            <div className="input-group">
                                                <label>Upload Resume PDF/DOCX</label>
                                                <div
                                                    className={`file-upload ${dragActive ? 'active' : ''} ${resume ? 'has-file' : ''}`}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    onClick={() => !resume && resumeInputRef.current?.click()}
                                                >
                                                    <input ref={resumeInputRef}
                                                        type="file"
                                                        id="resume"
                                                        name="resume"
                                                        accept=".pdf,.docx"
                                                        onChange={handleFileChange}
                                                        hidden
                                                    />
                                                    {resume ? (
                                                        <div className="file-info" onClick={(e) => e.stopPropagation()}>
                                                            <span className="file-icon"></span>
                                                            <div className="file-meta">
                                                                <p className="file-name">{resume.name}</p>
                                                                <p className="file-size">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="remove-file"
                                                                onClick={() => setResume(null)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="upload-label">
                                                            <span className="upload-icon"></span>
                                                            <p>Click to upload or drag & drop</p>
                                                            <p className="file-hint">PDF or DOCX (Max 5MB)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {profileSource === 'linkedin' && (
                                            <div className="linkedin-import-group">
                                                <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                                                <div className="linkedin-input-row">
                                                    <input
                                                        type="url"
                                                        id="linkedinUrl"
                                                        value={linkedinUrl}
                                                        onChange={(e) => {
                                                            setLinkedinUrl(e.target.value)
                                                            setLinkedinSuccess(false)
                                                        }}
                                                        placeholder="e.g. https://linkedin.com/in/username"
                                                        className="text-input"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="fetch-btn"
                                                        disabled={isFetchingLinkedin || !linkedinUrl}
                                                        onClick={handleFetchLinkedin}
                                                    >
                                                        {isFetchingLinkedin ? 'Syncing...' : 'Sync Profile'}
                                                    </button>
                                                </div>
                                                {linkedinSuccess && (
                                                    <div className="success-banner">
                                                        <span>✓</span> LinkedIn Profile Synced Successfully! Job details populated.
                                                    </div>
                                                )}
                                                <p className="helper-text">Imports your experience directly from your LinkedIn profile to customize questions.</p>
                                            </div>
                                        )}

                                        {profileSource === 'description' && (
                                            <div className="input-group">
                                                <label htmlFor="selfDescription">Quick Self-Description / Bio</label>
                                                <textarea
                                                    value={selfDescription}
                                                    onChange={(e) => setSelfDescription(e.target.value)}
                                                    placeholder="Describe your background, core tech stack, and experience if you don't have a resume file..."
                                                    id="selfDescription"
                                                    className="self-description-textarea"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="basic-info-box">
                                <p><strong>Basic Mode</strong> lets you generate immediate, standard interview questions for this role and seniority instantly. Real AI report generation is fully active!</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <span></span>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="form-action-footer">
                            <div className="ai-note">
                                Secure server-side processing enabled. All data remains private.
                            </div>
                            <button
                                className="generate-btn"
                                onClick={handleGenerateStrategy}
                                disabled={!isFormValid() || loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon"></span>
                                        Generate Interview Questions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="quick-actions-bar">
                    <button className="quick-action-btn" onClick={() => navigate('/voice-interview')}>
                        Mock Interview
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
                        Analytics
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => setShowComparison(true)}
                        disabled={!reports || reports.length < 2}
                        title={(!reports || reports.length < 2) ? "Need at least 2 reports to compare" : "Compare reports"}
                    >
                        Compare Reports
                    </button>
                </div>

                {/* Recent Reports List */}
                <div className="recent-reports-section">
                    <h2>Recent Preparation Plans</h2>
                    <div className="reports-grid">
                        {reports && reports.length > 0 ? (
                            reports.map((rep) => (
                                <div key={rep._id} className="report-item-card" onClick={() => navigate(`/interview/${rep._id}`)}>
                                    <div className="report-item-header">
                                        <h3>{rep.title || "Interview Plan"}</h3>
                                        <span className="report-item-date">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="report-item-body">
                                        <span className="match-score-badge">
                                            {rep.matchScore ? `Match: ${rep.matchScore}%` : "Basic Mode"}
                                        </span>
                                        <span className="view-link">Open Plan &rarr;</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-reports-text">No reports generated yet. Use the tool above to generate your first plan!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Comparison Modal */}
            {showComparison && (
                <ReportComparison
                    reports={reports}
                    onClose={() => setShowComparison(false)}
                />
            )}
        </main>
    )
}

export default Dashboard
