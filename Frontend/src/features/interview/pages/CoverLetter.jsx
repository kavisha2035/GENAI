import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import '../style/home.scss'
import { useAuth } from '../../auth/hooks/useAuth'
import { generateCoverLetterApi, getAllCoverLettersApi } from '../services/interview.api'

const CoverLetter = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()

    // Form inputs state
    const [jobTitle, setJobTitle] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [skills, setSkills] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Output and editor state
    const [generatedLetter, setGeneratedLetter] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [copied, setCopied] = useState(false)

    // History state
    const [history, setHistory] = useState([])

    const fetchHistory = async () => {
        try {
            const data = await getAllCoverLettersApi()
            setHistory(data?.coverLetters || [])
        } catch (err) {
            console.error("Failed to load cover letter history:", err)
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchHistory()
    }, [])

    const handleGenerate = async (e) => {
        e.preventDefault()
        if (!jobTitle.trim() || !companyName.trim()) {
            setError("Job title and company name are required.")
            return
        }

        setError('')
        setLoading(true)
        setGeneratedLetter('')

        try {
            const data = await generateCoverLetterApi({
                jobTitle,
                companyName,
                jobDescription,
                skills
            })
            if (data?.coverLetter) {
                setGeneratedLetter(data.coverLetter.content)
                fetchHistory()
            } else {
                setError("Failed to generate cover letter. Please try again.")
            }
        } catch (err) {
            console.error(err)
            setError(err.message || "An error occurred while calling the cover letter builder.")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <html>
                <head>
                    <title>Cover Letter - ${jobTitle} at ${companyName}</title>
                    <style>
                        body {
                            font-family: 'Times New Roman', Times, serif;
                            line-height: 1.6;
                            padding: 40px;
                            color: #000;
                            white-space: pre-wrap;
                        }
                    </style>
                </head>
                <body>
                    ${generatedLetter}
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    return (
        <main className='home landing-page-wrapper cover-letter-view-wrapper'>
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
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/resumes'); }}>Resumes</a>
                    <a href="#" className="nav-menu-btn link-btn active-dash-badge" onClick={(e) => { e.preventDefault(); }}>Cover Letter</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/tracker'); }}>Job Tracker</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>Pricing</a>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-profile">
                            <span className="username">{user.username || user.email}</span>
                            <button className="login-redirect-btn dashboard-link" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                        </div>
                    ) : (
                        <>
                            <button className="login-redirect-btn" onClick={() => navigate('/login')}>Log In</button>
                            <button className="register-btn" onClick={() => navigate('/register')}>Get Started Free</button>
                        </>
                    )}
                </div>
            </header>

            <div className="home-wrapper">
                <div className="home-header">
                    <span className="ai-badge">AI Writing Tool</span>
                    <h1>AI Cover Letter Builder</h1>
                    <p>Build a tailored, job-aligned cover letter matching your target position requirements in a few clicks.</p>
                </div>

                <div className="cover-letter-grid">
                    
                    {/* Left: Input Form */}
                    <div className="cover-letter-form-column">
                        <div className="form-card-container builder-form-card">
                            <div className="form-card-header">
                                <h2>Generator Parameters</h2>
                            </div>
                            <form onSubmit={handleGenerate} className="form-card-body">
                                <div className="input-group">
                                    <label htmlFor="jobTitle">Job Title <span className="req">*</span></label>
                                    <input 
                                        type="text" 
                                        id="jobTitle" 
                                        value={jobTitle} 
                                        onChange={(e) => setJobTitle(e.target.value)} 
                                        placeholder="e.g. Front End Developer" 
                                        required 
                                        className="text-input"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="companyName">Company Name <span className="req">*</span></label>
                                    <input 
                                        type="text" 
                                        id="companyName" 
                                        value={companyName} 
                                        onChange={(e) => setCompanyName(e.target.value)} 
                                        placeholder="e.g. Google" 
                                        required 
                                        className="text-input"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="jobDesc">Target Job Description</label>
                                    <textarea 
                                        id="jobDesc" 
                                        value={jobDescription} 
                                        onChange={(e) => setJobDescription(e.target.value)} 
                                        placeholder="Paste target job description to match key requirements..." 
                                        className="self-description-textarea"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="skills">Your Skills / Bio</label>
                                    <textarea 
                                        id="skills" 
                                        value={skills} 
                                        onChange={(e) => setSkills(e.target.value)} 
                                        placeholder="Outline your background or copy-paste resume experience..." 
                                        className="self-description-textarea"
                                    />
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span>❌</span>
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button type="submit" className="pricing-cta-btn primary full-width-btn" disabled={loading}>
                                    {loading ? 'Generating Writer...' : 'Generate Cover Letter'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Preview Canvas */}
                    <div className="cover-letter-preview-column">
                        {loading ? (
                            <div className="preview-canvas-loader">
                                <div className="spinner-medium"></div>
                                <p>Writing your tailored cover letter...</p>
                            </div>
                        ) : generatedLetter ? (
                            <div className="cover-letter-output-card">
                                <div className="output-actions-bar">
                                    <div className="actions-left">
                                        <button className="action-pill" onClick={handleCopy}>
                                            {copied ? '✓ Copied!' : 'Copy Text'}
                                        </button>
                                        <button className="action-pill" onClick={handlePrint}>
                                            Print / Save PDF
                                        </button>
                                    </div>
                                    <button className="action-pill edit-pill" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? '✓ Done Editing' : 'Edit Content'}
                                    </button>
                                </div>
                                
                                <div className="paper-canvas">
                                    {isEditing ? (
                                        <textarea
                                            value={generatedLetter}
                                            onChange={(e) => setGeneratedLetter(e.target.value)}
                                            className="paper-textarea-editor"
                                        />
                                    ) : (
                                        <div className="paper-letter-text">{generatedLetter}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="preview-placeholder">
                                <span className="placeholder-icon"></span>
                                <h3>Generated Output Canvas</h3>
                                <p>Fill out the parameters on the left and click generate to build your professional cover letter.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cover Letter History */}
                <section className="recent-reports-section history-section">
                    <h2>Your Writing History</h2>
                    <div className="reports-grid">
                        {history && history.length > 0 ? (
                            history.map((letter) => (
                                <div key={letter._id} className="report-item-card history-card" onClick={() => {
                                    setGeneratedLetter(letter.content);
                                    setJobTitle(letter.jobTitle);
                                    setCompanyName(letter.companyName);
                                    setJobDescription(letter.jobDescription || '');
                                    setSkills(letter.skills || '');
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}>
                                    <div className="report-item-header">
                                        <h3>{letter.jobTitle} at {letter.companyName}</h3>
                                        <span className="report-item-date">{new Date(letter.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="report-item-body">
                                        <span className="match-score-badge text-green">Generated</span>
                                        <span className="view-link">Load to Canvas &rarr;</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-reports-text">No cover letters generated yet.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <div className="logo-icon-svg">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="6" fill="#613bf7" />
                                <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span>Interview Prep AI</span>
                    </div>
                    <p className="copyright-text">&copy; 2026 Interview Prep AI. All rights reserved. Designed for excellence in interview preparation.</p>
                </div>
            </footer>
        </main>
    )
}

export default CoverLetter
