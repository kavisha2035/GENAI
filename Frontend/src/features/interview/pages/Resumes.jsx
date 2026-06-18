import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import '../style/home.scss'
import { useAuth } from '../../auth/hooks/useAuth'

const RESUME_TEMPLATES = [
    { id: 'newsweek', name: 'Newsweek', desc: 'Professional design highlighting skills and strengths. Clean margins with bold branding.', color: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' },
    { id: 'blurred', name: 'Blurred', desc: 'Elegant layout that makes your resume stand out. Soft glowing gradients for modern highlights.', color: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
    { id: 'doodle', name: 'Doodle', desc: 'Creative design with unique line-art illustrations. Fun, creative and perfect for agencies.', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { id: 'sharp', name: 'Sharp', desc: 'Clean layout with subtle, standout design elements. Strictly grid margins and structured lines.', color: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }
]

const RESUME_EXAMPLES = [
    { role: 'Software Engineer', exp: '3+ Years', stack: 'React, Node.js, MongoDB, AWS', summary: 'Passionate MERN developer with experience building high-throughput REST APIs and optimizing DB queries.' },
    { role: 'Product Manager', exp: '5+ Years', stack: 'Jira, Figma, Amplitude, MECE', summary: 'Driven PM with a track record of implementing scalable features and streamlining development workflows.' },
    { role: 'UX Designer', exp: '4+ Years', stack: 'Figma, prototyping, user-research', summary: 'Creative user experience designer focused on building scalable design systems and usability testing.' },
    { role: 'Consultant', exp: '2+ Years', stack: 'Financial modeling, slide deck, Agile', summary: 'Analytical management consultant experienced in cost-reduction strategies and data visualization.' }
]

const Resumes = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [selectedExample, setSelectedExample] = useState(null)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className='home landing-page-wrapper resumes-view-wrapper'>
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
                    <a href="#" className="nav-menu-btn link-btn active-dash-badge" onClick={(e) => { e.preventDefault(); }}>Resumes</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/cover-letter'); }}>Cover Letter</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/tracker'); }}>Job Tracker</a>
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>Pricing</a>
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
                    <span className="ai-badge">Templates & Examples</span>
                    <h1>Browse professional resume configurations</h1>
                    <p>Select an ATS-optimized, high-converting layout or view resume content examples written for top tech roles.</p>
                </div>

                {/* Templates Grid Section */}
                <section className="resumes-section-block">
                    <h2 className="block-title">Interactive Resume Templates</h2>
                    <div className="templates-grid">
                        {RESUME_TEMPLATES.map((tmpl) => (
                            <div key={tmpl.id} className="template-card">
                                <div className="template-preview-canvas" style={{ background: tmpl.color }}>
                                    <div className="resume-sheet-mock">
                                        {/* Mock layout design within grid card */}
                                        {tmpl.id === 'newsweek' && (
                                            <div className="tmpl-mock-newsweek">
                                                <div className="mock-top-header"></div>
                                                <div className="mock-body-split">
                                                    <div className="mock-left"></div>
                                                    <div className="mock-right"></div>
                                                </div>
                                            </div>
                                        )}
                                        {tmpl.id === 'blurred' && (
                                            <div className="tmpl-mock-blurred">
                                                <div className="mock-blur-header"></div>
                                                <div className="mock-body-full"></div>
                                            </div>
                                        )}
                                        {tmpl.id === 'doodle' && (
                                            <div className="tmpl-mock-doodle">
                                                <div className="mock-body-full"></div>
                                            </div>
                                        )}
                                        {tmpl.id === 'sharp' && (
                                            <div className="tmpl-mock-sharp">
                                                <div className="mock-body-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="template-hover-overlay">
                                        <button className="hover-action-btn preview-btn" onClick={() => setSelectedTemplate(tmpl)}>Preview</button>
                                        <button className="hover-action-btn use-btn" onClick={() => navigate('/dashboard')}>Use Template</button>
                                    </div>
                                </div>
                                <div className="template-info">
                                    <h3>{tmpl.name}</h3>
                                    <p>{tmpl.desc}</p>
                                    <span className="use-badge" onClick={() => setSelectedTemplate(tmpl)}>Preview Template &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Resume Examples Section */}
                <section className="resumes-section-block examples-section">
                    <h2 className="block-title">Industry Resume Examples</h2>
                    <div className="examples-grid-container">
                        {RESUME_EXAMPLES.map((ex, idx) => (
                            <div key={idx} className="example-block-card" onClick={() => setSelectedExample(ex)}>
                                <div className="example-header">
                                    <h3>{ex.role}</h3>
                                    <span className="exp-tag">{ex.exp} Exp</span>
                                </div>
                                <div className="example-body">
                                    <p className="example-summary">"{ex.summary}"</p>
                                    <div className="example-stack">
                                        <strong>Skills:</strong> {ex.stack}
                                    </div>
                                </div>
                                <button className="view-example-btn">View Full Content <span>&rarr;</span></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Template Preview Overlay */}
            {selectedTemplate && (
                <div className="preview-overlay" onClick={() => setSelectedTemplate(null)}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedTemplate.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedTemplate(null)}>&times;</button>
                        </div>
                        <div className="modal-body-preview-img" style={{ background: selectedTemplate.color }}>
                            <div className="resume-sheet-mock large">
                                {/* newsweek layout */}
                                {selectedTemplate.id === 'newsweek' && (
                                    <div className="newsweek-preview-content">
                                        <div className="newsweek-sidebar-accent">
                                            <div className="preview-avatar-circle">JD</div>
                                            <h4>SKILLS</h4>
                                            <div className="tag-mock-pill">React</div>
                                            <div className="tag-mock-pill">Node.js</div>
                                            <div className="tag-mock-pill">MongoDB</div>
                                            <h4 style={{ marginTop: '20px' }}>EDUCATION</h4>
                                            <p style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>B.S. Computer Science</p>
                                        </div>
                                        <div className="newsweek-main-content">
                                            <div className="preview-header-title">John Doe</div>
                                            <div className="preview-sub-text">Software Engineer | john.doe@email.com</div>
                                            <h4 className="section-title">EXPERIENCE</h4>
                                            <div className="exp-mock-item">
                                                <strong>Senior Developer</strong> &bull; Acme Corp
                                                <p>Designed scalable event-driven backend architectures and secure JWT auth systems.</p>
                                            </div>
                                            <div className="exp-mock-item">
                                                <strong>Frontend Engineer</strong> &bull; Beta Tech
                                                <p>Built responsive modular frontend architectures and optimized rendering path latency.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* blurred layout */}
                                {selectedTemplate.id === 'blurred' && (
                                    <div className="blurred-preview-content">
                                        <div className="blurred-header-accent-band">
                                            <div className="header-info">
                                                <div className="preview-header-title">John Doe</div>
                                                <div className="preview-sub-text">Software Engineer | john.doe@email.com</div>
                                            </div>
                                            <div className="preview-avatar-circle blurred-circle">JD</div>
                                        </div>
                                        <div className="blurred-body-columns">
                                            <div className="col-left">
                                                <h4>SKILLS</h4>
                                                <div className="tag-mock-pill">React</div>
                                                <div className="tag-mock-pill">Node.js</div>
                                                <div className="tag-mock-pill">MongoDB</div>
                                            </div>
                                            <div className="col-right">
                                                <h4>EXPERIENCE</h4>
                                                <div className="exp-mock-item">
                                                    <strong>Senior Developer</strong> &bull; Acme Corp
                                                    <p>Designed scalable event-driven architectures and secure JWT auth protocols.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* doodle layout */}
                                {selectedTemplate.id === 'doodle' && (
                                    <div className="doodle-preview-content">
                                        <div className="doodle-line-art-decoration"> Doodle Layout</div>
                                        <div className="doodle-header">
                                            <div className="preview-header-title handwriting">John Doe</div>
                                            <div className="preview-sub-text">Software Engineer | john.doe@email.com</div>
                                        </div>
                                        <div className="doodle-body">
                                            <h4>MY SKILLS</h4>
                                            <p className="skills-line">React &bull; Node.js &bull; MongoDB &bull; Tailwind</p>
                                            <h4 style={{ marginTop: '15px' }}>EXPERIENCE</h4>
                                            <div className="exp-mock-item">
                                                <strong>Senior Developer</strong> - Acme Corp
                                                <p>Created next-generation client platforms and optimized application render speed.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* sharp layout */}
                                {selectedTemplate.id === 'sharp' && (
                                    <div className="sharp-preview-content">
                                        <div className="sharp-top-line"></div>
                                        <div className="sharp-header">
                                            <div className="preview-header-title">JOHN DOE</div>
                                            <div className="preview-sub-text">Software Engineer &bull; john.doe@email.com</div>
                                        </div>
                                        <div className="sharp-grid-body">
                                            <div className="col-full">
                                                <h4>PROFESSIONAL SUMMARY</h4>
                                                <p className="summary-p">Results-oriented developer with a record of building clean API pipelines and scalable architecture.</p>
                                                <h4 style={{ marginTop: '15px' }}>EXPERIENCE</h4>
                                                <div className="exp-mock-item">
                                                    <strong>Senior Developer</strong> &bull; Acme Corp
                                                    <p>Responsible for deployment orchestration, microservice creation, and backend testing.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <p>To use this template with your own parsed details, navigate to the Dashboard and click generate!</p>
                            <button className="pricing-cta-btn primary" onClick={() => { setSelectedTemplate(null); navigate('/dashboard'); }}>Use Template</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Example Preview Overlay */}
            {selectedExample && (
                <div className="preview-overlay" onClick={() => setSelectedExample(null)}>
                    <div className="preview-modal text-left-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedExample.role} Example</h2>
                            <button className="close-btn" onClick={() => setSelectedExample(null)}>&times;</button>
                        </div>
                        <div className="modal-body-content">
                            <div className="resume-full-mock-text">
                                <h3>Professional Summary</h3>
                                <p>{selectedExample.summary} Focused on delivering clean, maintainable, and high-performance solutions aligned with organizational goals.</p>

                                <h3>Core Tech Stack & Skills</h3>
                                <p>{selectedExample.stack}</p>

                                <h3>Professional Experience</h3>
                                <div className="exp-item-text">
                                    <strong>Lead Specialist</strong> &bull; Top Tech Company (2023 - Present)
                                    <ul>
                                        <li>Led a team of engineers to optimize web performance bottlenecks, improving LCP by 40%.</li>
                                        <li>Architected microservices using Node.js and Redis, lowering query latency to sub-50ms levels.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="pricing-cta-btn secondary" onClick={() => setSelectedExample(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

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

export default Resumes
