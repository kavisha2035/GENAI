import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import '../style/home.scss'
import { useAuth } from '../../auth/hooks/useAuth'

const Pricing = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className='home landing-page-wrapper pricing-view'>
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
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/cover-letter'); }}>Cover Letter</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/tracker'); }}>Job Tracker</a>
                    <a href="#" className="nav-menu-btn link-btn active-dash-badge" onClick={(e) => { e.preventDefault(); }}>Pricing</a>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-profile">
                            <span className="username"> {user.username || user.email}</span>
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
                    <span className="ai-badge">Simple Pricing</span>
                    <h1>Pricing plans tailored to your career goals</h1>
                    <p>Get instant access to AI-driven interview preparation, customizable resume templates, and tailored cover letters.</p>
                </div>

                {/* Pricing Tiers Section */}
                <section className="pricing-grid-section">
                    <div className="pricing-cards-grid">
                        
                        {/* Starter Tier */}
                        <div className="pricing-card-tier">
                            <span className="tier-badge">STARTER</span>
                            <h2>Free</h2>
                            <p className="price-tag">$0<span>/mo</span></p>
                            <p className="tier-desc">Test the waters and practice standard questions.</p>
                            <ul className="tier-features">
                                <li><span className="check-icon">✓</span> 3 standard reports per day</li>
                                <li><span className="check-icon">✓</span> Basic interview setup form</li>
                                <li><span className="check-icon">✓</span> Access to standard questions</li>
                                <li><span className="cross-icon">✗</span> Personalized CV imports</li>
                                <li><span className="cross-icon">✗</span> AI Cover Letter Builder</li>
                                <li><span className="cross-icon">✗</span> PDF Resume Downloads</li>
                            </ul>
                            <button className="pricing-cta-btn secondary" onClick={() => navigate('/register')}>Get Started</button>
                        </div>

                        {/* Pro Tier (Featured) */}
                        <div className="pricing-card-tier featured">
                            <span className="tier-badge featured-badge">MOST POPULAR</span>
                            <h2>Pro</h2>
                            <p className="price-tag">$9<span>/mo</span></p>
                            <p className="tier-desc">Unlock full AI personalization and custom exports.</p>
                            <ul className="tier-features">
                                <li><span className="check-icon">✓</span> <strong>Unlimited</strong> AI report generations</li>
                                <li><span className="check-icon">✓</span> Personalised CV parsing</li>
                                <li><span className="check-icon">✓</span> LinkedIn sync support</li>
                                <li><span className="check-icon">✓</span> <strong>AI Cover Letter Builder</strong></li>
                                <li><span className="check-icon">✓</span> <strong>PDF Resume Downloads</strong></li>
                                <li><span className="check-icon">✓</span> Access to premium templates</li>
                                <li><span className="check-icon">✓</span> Priority customer support</li>
                            </ul>
                            <button className="pricing-cta-btn primary" onClick={() => navigate('/register')}>Upgrade to Pro</button>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="pricing-card-tier">
                            <span className="tier-badge">ENTERPRISE</span>
                            <h2>Enterprise</h2>
                            <p className="price-tag">Custom</p>
                            <p className="tier-desc">For recruitment agencies, colleges, and enterprise teams.</p>
                            <ul className="tier-features">
                                <li><span className="check-icon">✓</span> Unified team dashboards</li>
                                <li><span className="check-icon">✓</span> Custom company templates</li>
                                <li><span className="check-icon">✓</span> High-frequency API keys</li>
                                <li><span className="check-icon">✓</span> Account analytics & stats</li>
                                <li><span className="check-icon">✓</span> Dedicated success manager</li>
                            </ul>
                            <button className="pricing-cta-btn secondary" onClick={() => alert('Please contact sales at: enterprise@interviewprepai.com')}>Contact Sales</button>
                        </div>

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

export default Pricing
