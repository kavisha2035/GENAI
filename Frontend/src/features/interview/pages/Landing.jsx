import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import '../style/home.scss'
import { useAuth } from '../../auth/hooks/useAuth'
import { mockReports } from '../services/mockReports'

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

const boldKeyPhrases = (text) => {
    if (!text) return '';
    let formatted = text;
    KEY_PHRASES.forEach(phrase => {
        const regex = new RegExp(`\\b(${phrase})\\b`, 'gi');
        formatted = formatted.replace(regex, '<strong>$1</strong>');
    });
    return formatted;
};

const sliderRoles = ["Copywriter", "Project Manager", "Front End Developer"];
const sliderQuestions = [
    "How do you adapt the brand tone and voice when writing for a technical whitepaper vs an Instagram ad campaign?",
    "How do you define and manage the critical path of a project with multiple shifting dependencies?",
    "Can you explain the difference between useMemo and useCallback in React, and when you would use each?"
];

const Landing = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    // Showcase state
    const [showcaseRole, setShowcaseRole] = useState('Consultant')
    const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0)

    // Interactive slider graphic state
    const [sliderVal, setSliderVal] = useState(1)

    // Interactive accordion FAQ state
    const [showInteractiveAnswer, setShowInteractiveAnswer] = useState(false)

    // Navbar dropdown states
    const [activeDropdown, setActiveDropdown] = useState(null)

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

    const handleCtaClick = () => {
        if (user) {
            navigate('/dashboard')
        } else {
            navigate('/register')
        }
    }

    const showcaseData = mockReports[showcaseRole] || mockReports['Consultant']
    const activeShowcaseQs = showcaseData.technicalQuestions.slice(0, 3)

    return (
        <main className='home landing-page-wrapper'>
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
                    <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/resumes'); }}>Resumes</a>
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
                {/* Hero Section */}
                <div className="home-header">
                    <span className="ai-badge">AI Interview Prep Assistant</span>
                    <h1>Get ready for your next job with AI.</h1>
                    <p>
                        Prepare for any job interview with personalized questions tailored to your resume or target role
                        — Our AI generates realistic questions you might be asked, and smart ones you can ask.
                    </p>
                    <button className="cta-generate-btn" onClick={handleCtaClick}>
                        Generate Interview Questions &rarr;
                    </button>
                </div>

                {/* Section A: Fine-tuned and trained AI. (White Background) */}
                <section className="landing-section-alt white-bg">
                    <div className="section-content-container grid-two-cols">
                        <div className="graphic-block openai-theme-card">
                            <div className="openai-badge-container">
                                <svg viewBox="0 0 24 24" className="openai-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.5 10.5C21.9 9.8 22 9 21.8 8.2C21.6 7.4 21.1 6.7 20.4 6.3C20.1 6.1 19.8 6 19.5 6C19.3 6 19.1 6 19 6.1C18.6 5.2 17.9 4.5 17 4.1C16.1 3.7 15.1 3.7 14.2 4.1C14 4.2 13.8 4.4 13.6 4.5C13 3.9 12.1 3.5 11.2 3.5C10.3 3.5 9.4 3.9 8.8 4.5C8.6 4.4 8.4 4.2 8.2 4.1C7.3 3.7 6.3 3.7 5.4 4.1C4.5 4.5 3.8 5.2 3.4 6.1C3.3 6 3.1 6 2.9 6C2.6 6 2.3 6.1 2 6.3C1.3 6.7 0.8 7.4 0.6 8.2C0.4 9 0.5 9.8 0.9 10.5C0.7 10.8 0.6 11.2 0.6 11.5C0.6 11.8 0.7 12.2 0.9 12.5C0.5 13.2 0.4 14 0.6 14.8C0.8 15.6 1.3 16.3 2 16.7C2.3 16.9 2.6 17 2.9 17C3.1 17 3.3 17 3.4 16.9C3.8 17.8 4.5 18.5 5.4 18.9C5.9 19.1 6.4 19.2 6.9 19.2C7.4 19.2 7.8 19.1 8.2 18.9C8.4 19 8.6 19.2 8.8 19.3C9.4 19.9 10.3 20.3 11.2 20.3C12.1 20.3 13 19.9 13.6 19.3C13.8 19.4 14 19.6 14.2 19.7C14.7 19.9 15.2 20 15.7 20C16.2 20 16.7 19.9 17.1 19.7C18 19.3 18.7 18.6 19.1 17.7C19.2 17.8 19.4 17.9 19.6 18C19.9 18.1 20.2 18.1 20.5 18.1C21.2 18.1 21.9 17.6 22.3 16.9C22.7 16.2 22.8 15.4 22.6 14.6C22.8 14.3 22.9 13.9 22.9 13.6C22.9 13.2 22.8 12.8 22.6 12.5C23 11.8 23.1 11 22.9 10.2C22.7 9.4 22.2 8.7 21.5 8.3C21.5 8.5 21.5 8.7 21.5 8.9L21.5 10.5Z" fill="white"/>
                                    <path d="M12 9.5L12 14.5M9.5 12L14.5 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span className="openai-title">OpenAI</span>
                            </div>
                            <div className="floating-rockets">
                                <span className="rocket r1"></span>
                                <span className="rocket r2"></span>
                            </div>
                        </div>
                        <div className="text-block text-dark">
                            <h2>Fine-tuned and trained AI.</h2>
                            <p>
                                To generate personalized, highly relevant, and job-specific interview questions, we use the latest GPT model, fine tuned in-house by us.
                            </p>
                            <p>
                                We train our AI continuously on thousands of resumes, cover letters, job descriptions, and recruiter feedback. This extensive training allows it to understand the key skills and expertise employers seek, enabling us to provide you with the most position-oriented and professional interview questions tailored precisely to your job and experience.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section B: Free Premium for students and teachers. (Dark Blue Background) */}
                <section className="landing-section-alt dark-bg">
                    <div className="section-content-container grid-two-cols">
                        <div className="text-block text-light">
                            <h2>Free Premium for students and teachers.</h2>
                            <p>
                                All students and teachers can get up to 180 days of Premium for free by simply verifying their student status with ISIC, ITIC, or UNiDAYS. Click below to get started and see what you can get.
                            </p>
                            <button className="cta-premium-btn" onClick={handleCtaClick}>
                                Get Free Premium
                            </button>
                        </div>
                        <div className="image-block student-photo-wrapper">
                            <img src="/student_premium.png" alt="Student holding books" className="student-photo" />
                        </div>
                    </div>
                </section>

                {/* Steps Section: How to generate interview questions with AI (White background) */}
                <section className="steps-section">
                    <h2>How to generate interview questions with AI</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-num-circle">1</div>
                            <h3>Generate questions</h3>
                            <p>Start the process by entering a job position you'd like our AI to generate interview questions for.</p>
                            <div className="step-mock-graphic graphic-step1">
                                <div className="mock-input-row">
                                    <div className="mock-input-label">Job Title</div>
                                    <div className="mock-input-field blinking-caret">Front End Developer</div>
                                </div>
                            </div>
                        </div>
                        <div className="step-card">
                            <div className="step-num-circle">2</div>
                            <h3>Basic or Personalized</h3>
                            <p>You can generate either basic interview questions using just a job title, or personalized ones tailored to your resume.</p>
                            <div className="step-mock-graphic graphic-step2">
                                <div className="mock-tabs">
                                    <div className="mock-tab">Basic</div>
                                    <div className="mock-tab mock-tab-active">Personalized</div>
                                </div>
                                <div className="mock-upload-zone">
                                    <div className="mock-file-pill"> cv_john_doe.pdf</div>
                                </div>
                            </div>
                        </div>
                        <div className="step-card">
                            <div className="step-num-circle">3</div>
                            <h3>10 Generated Questions</h3>
                            <p>We'll generate detailed questions with answers to help you prepare, along with smart questions you can ask them.</p>
                            <div className="step-mock-graphic graphic-step3">
                                <div className="mock-card-deck-visual">
                                    <div className="mock-card-mini mini-card3"></div>
                                    <div className="mock-card-mini mini-card2"></div>
                                    <div className="mock-card-mini mini-card1">
                                        <div className="mini-card-text">Q: Describe useMemo...</div>
                                        <div className="mini-card-line"></div>
                                        <div className="mini-card-line-short"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="cta-generate-btn" onClick={handleCtaClick}>
                        Generate Interview Questions
                    </button>
                </section>

                {/* Don't have a resume yet? Section (White background) */}
                <section className="no-resume-section">
                    <h2>Don't have a resume yet?</h2>
                    <p className="no-resume-subtitle">You can create one quickly and easily with our best resume-building tools.</p>
                    
                    <div className="no-resume-grid">
                        <div className="builder-card resume-builder">
                            <div className="builder-icon yellow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </div>
                            <h3>Resume Builder</h3>
                            <p>Simply pick a template, add your information, and your CV will be ready in no time. All of our templates are functional, optimized, and well-structured.</p>
                            <button className="builder-btn-link" onClick={() => navigate('/resumes')}>Build Resume &rarr;</button>
                        </div>
                        
                        <div className="builder-card linkedin-builder">
                            <div className="builder-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                    <rect x="2" y="9" width="4" height="12"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </div>
                            <h3>LinkedIn Resume Import</h3>
                            <p>If you already have your career story written on LinkedIn, just import it and we'll turn your profile into a stunning, job-ready, and professionally formatted CV.</p>
                            <button className="builder-btn-link" onClick={() => navigate('/dashboard')}>Import LinkedIn &rarr;</button>
                        </div>
                        
                        <div className="builder-card resume-examples">
                            <div className="builder-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <h3>Resume Examples</h3>
                            <p>You can also browse through our extensive collection of successful resume examples for inspiration and turn them into your own resume with just a few clicks.</p>
                            <button className="builder-btn-link" onClick={() => navigate('/resumes')}>Browse Examples &rarr;</button>
                        </div>
                    </div>
                </section>

                {/* FAQ / Interview mockup section (White background) */}
                <section className="faq-interactive-section">
                    <div className="faq-grid">
                        <div className="faq-text-content">
                            <h2>Prepare for interviews with job-specific questions and answers.</h2>
                            <p>
                                Our AI generates interview questions tailored to your role — and each one comes with a suggested answer, so you'll always know what to say. You also have the option to show or hide the answers, allowing you to answer the questions on your own or get a little help from us.
                            </p>
                        </div>
                        
                        <div className="faq-graphic-content">
                            <div className="faq-mockup-card">
                                <div className="faq-question-label">Question:</div>
                                <h3 className="faq-question-text">Can you describe a project where you used Python for back-end development? What challenges did you face and how did you overcome them?</h3>
                                
                                <div className={`faq-answer-block ${showInteractiveAnswer ? 'expanded' : ''}`}>
                                    <div className="faq-answer-label">Answer:</div>
                                    <p className="faq-answer-text">
                                        "In my previous project, we built a high-throughput financial calculation engine using Python and Django. The main challenge was <strong>memory usage</strong> and <strong>processing latency</strong> when handling huge CSV datasets. I resolved this by migrating data parsing to <strong>Pandas</strong>, chunking inputs, and introducing <strong>Celery tasks</strong> for async processing."
                                    </p>
                                </div>
                                
                                <div className="faq-card-footer">
                                    <button 
                                        className="faq-toggle-btn" 
                                        onClick={() => setShowInteractiveAnswer(!showInteractiveAnswer)}
                                    >
                                        {showInteractiveAnswer ? 'Hide Answer' : 'Show Answer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Custom Interactive Slider Graphic Section (White background) */}
                <section className="landing-section-alt white-bg tailored-slider-section">
                    <div className="section-content-container grid-two-cols">
                        
                        {/* Interactive Slider Graphic */}
                        <div className="slider-card-visual-container">
                            <div className="slider-interactive-card">
                                <div className="card-header-accent">
                                    <div className="role-info-title">
                                        <span className="role-icon-purple">👤</span>
                                        <span className="role-title-text">{sliderRoles[sliderVal]}</span>
                                    </div>
                                    <span className="q-badge">Interactive Sample</span>
                                </div>
                                <div className="card-body">
                                    <div className="question-block">
                                        <span className="section-label">Sample Question:</span>
                                        <p className="question-text">"{sliderQuestions[sliderVal]}"</p>
                                    </div>
                                </div>
                                <div className="card-slider-controls">
                                    <div className="slider-labels">
                                        <span onClick={() => setSliderVal(0)} className={sliderVal === 0 ? 'active' : ''}>Copywriter</span>
                                        <span onClick={() => setSliderVal(1)} className={sliderVal === 1 ? 'active' : ''}>Project Manager</span>
                                        <span onClick={() => setSliderVal(2)} className={sliderVal === 2 ? 'active' : ''}>Front End Dev</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="2" 
                                        value={sliderVal} 
                                        onChange={(e) => setSliderVal(parseInt(e.target.value))}
                                        className="role-range-slider"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-block text-dark">
                            <h2>Get interview questions tailored to your job title and experience.</h2>
                            <p>
                                Tailor your interview prep to your needs — pick questions based on a job title and level of seniority, or get personalized ones that reflect your previous work experience by manually inputting your job history.
                            </p>
                            <p>
                                Use the interactive range slider on the left to see how questions change instantly depending on target roles!
                            </p>
                        </div>

                    </div>
                </section>

                {/* Showcase Section */}
                <section className="showcase-section">
                    <h2 className="showcase-header">Explore job-specific question structures</h2>
                    <div className="role-pills-container">
                        <div className="role-pills-capsule">
                            {Object.keys(mockReports).map((role) => (
                                <button
                                    key={role}
                                    className={`role-pill ${showcaseRole === role ? 'active' : ''}`}
                                    onClick={() => {
                                        setShowcaseRole(role)
                                        setActiveShowcaseIndex(0)
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="showcase-display">
                        <div className="card-deck">
                            {activeShowcaseQs.map((q, idx) => {
                                const offset = idx - activeShowcaseIndex;
                                let cardClass = "showcase-card";
                                if (offset === 0) cardClass += " active-front";
                                else if (offset === 1) cardClass += " card-second";
                                else if (offset === 2) cardClass += " card-third";
                                else cardClass += " card-hidden";

                                return (
                                    <div key={idx} className={cardClass}>
                                        <div className="card-header-accent">
                                            <div className="role-info-title">
                                                <span className="role-icon-purple">👤</span>
                                                <span className="role-title-text">{showcaseRole}</span>
                                            </div>
                                            <span className="q-badge">Question {idx + 1} of 3</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="question-block">
                                                <span className="section-label">Question:</span>
                                                <p className="question-text">{q.question}</p>
                                            </div>
                                            <div className="answer-block">
                                                <span className="section-label">Answer:</span>
                                                <p 
                                                    className="answer-text" 
                                                    dangerouslySetInnerHTML={{ __html: boldKeyPhrases(q.answer) }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="deck-controls">
                            <button 
                                className="control-btn" 
                                disabled={activeShowcaseIndex === 0}
                                onClick={() => setActiveShowcaseIndex(prev => Math.max(0, prev - 1))}
                            >
                                <span className="arrow-icon">←</span> Previous
                            </button>
                            
                            <div className="deck-dots">
                                {activeShowcaseQs.map((_, idx) => (
                                    <span 
                                        key={idx} 
                                        className={`dot ${activeShowcaseIndex === idx ? 'active' : ''}`}
                                        onClick={() => setActiveShowcaseIndex(idx)}
                                    />
                                ))}
                            </div>
                            
                            <button 
                                className="control-btn" 
                                disabled={activeShowcaseIndex === activeShowcaseQs.length - 1}
                                onClick={() => setActiveShowcaseIndex(prev => Math.min(activeShowcaseQs.length - 1, prev + 1))}
                            >
                                Next <span className="arrow-icon">→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Ratings Section */}
                <section className="ratings-section">
                    <div className="ratings-grid">
                        <div className="rating-card trustpilot">
                            <span className="rating-brand">★ Trustpilot</span>
                            <div className="rating-stars">★★★★★</div>
                            <span className="rating-desc">TrustScore <strong>4.8</strong> | 4,212 reviews</span>
                        </div>
                        <div className="rating-card google">
                            <span className="rating-brand"><span className="g-blue">G</span><span className="g-red">o</span><span className="g-yellow">o</span><span className="g-blue">g</span><span className="g-green">l</span><span className="g-red">e</span></span>
                            <div className="rating-stars">★★★★★</div>
                            <span className="rating-desc"><strong>4.9 / 5</strong> score</span>
                        </div>
                        <div className="rating-card appstore">
                            <span className="rating-brand"> App Store</span>
                            <div className="rating-stars">★★★★★</div>
                            <span className="rating-desc"><strong>4.8 / 5</strong> score</span>
                        </div>
                    </div>
                </section>

                {/* Section C: Why we built this AI Interview Questions Generator (White Background) */}
                <section className="landing-section-alt white-bg text-center-section">
                    <div className="section-content-container max-width-content">
                        <h2>Why we built this AI Interview Questions Generator</h2>
                        <p className="large-paragraph text-dark">
                            Let's be honest — most job interview questions you find online are... kinda average.
                        </p>
                        <p className="body-paragraph text-dark">
                            Of course, they can help you prepare for some general and personal questions, suggest optimal answers, but our AI Interview Questions Generator will get you ready for more in-depth and job-specific questions the interviewers are likely to ask.
                        </p>
                        <p className="body-paragraph text-dark">
                            That's exactly why we created our AI-powered tool — to help you prepare for interviews that feel real. And relevant. Whether you're a job seeker or a recruiter, this tool will help you skip generic advice and get straight to what matters.
                        </p>
                    </div>
                </section>

                {/* Section D: Why Choose Interview Prep AI? (White Background) */}
                <section className="landing-section-alt white-bg bullets-section">
                    <div className="section-content-container max-width-content text-left">
                        <h2 className="text-center-heading">Why Choose Interview Prep AI?</h2>
                        <p className="section-desc text-center-heading">
                            There are lots of AI tools out there. But here's what makes Interview Prep AI stand out:
                        </p>
                        
                        <div className="bullets-grid">
                            <div className="bullet-item">
                                <span className="bullet-emoji"></span>
                                <div className="bullet-content">
                                    <h3>It's built on thousands of real resumes, cover letters, and job listings.</h3>
                                    <p>Our tool doesn't just guess — it knows what employers are looking for because it's trained on real-world data from successful applications and recruiter feedback.</p>
                                </div>
                            </div>
                            <div className="bullet-item">
                                <span className="bullet-emoji"></span>
                                <div className="bullet-content">
                                    <h3>Powered by the latest GPT model.</h3>
                                    <p>This advanced AI model delivers smarter, more accurate, and more relevant questions than most generic generators, as we customized and fine-tuned it ourselves.</p>
                                </div>
                            </div>
                            <div className="bullet-item">
                                <span className="bullet-emoji"></span>
                                <div className="bullet-content">
                                    <h3>Designed for job seekers and recruiters.</h3>
                                    <p>Most tools focus only on the applicant's side. Ours helps both candidates and hiring professionals prepare better interviews — tailored, structured, and grounded in real roles.</p>
                                </div>
                            </div>
                            <div className="bullet-item">
                                <span className="bullet-emoji"></span>
                                <div className="bullet-content">
                                    <h3>All-in-one experience with Interview Prep AI.</h3>
                                    <p>Go beyond questions. Generate complete preparation roadmaps, track matching scores, save preparation histories, and compile clean PDFs inside a single platform.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section E: The only career toolbox you'll ever need. (Dark Blue Background) */}
                <section className="landing-section-alt dark-bg toolbox-section">
                    <div className="section-content-container text-center">
                        <h2>The only career toolbox you'll ever need.</h2>
                        <p className="section-subtitle">Accelerate your job preparation with our AI-driven modular systems.</p>
                        
                        <div className="toolbox-grid">
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>AI Resume Builder</h3>
                                <p>Our AI-powered resume builder will help you create an impressive professional resume in seconds. Simply pick a template and let AI do the rest.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>AI Cover Letter Builder</h3>
                                <p>Try our AI Cover Letter Writer and produce a rock-solid cover letter in seconds. Let AI find the right words for you.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>40+ Professional Templates</h3>
                                <p>All resume and cover letter templates are highly customizable, and designed by a team of skilled typographers and recruiters.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>AI Resignation Letter</h3>
                                <p>Our AI Writer will help you find the right words to quit your job while leaving all bridges unburned.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>Interview Prep AI for Mobile</h3>
                                <p>Access your resumes, cover letters, and preparation plans directly from your smartphone. Available for iOS and Android.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>1,500+ Resume Examples</h3>
                                <p>Get inspired by resume and cover letter examples that helped real people land jobs with the world's top companies.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>Resumes Catalog</h3>
                                <p>Browse multiple professional examples and ATS-friendly layouts to structure your profile correctly before applying.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>Website Builder</h3>
                                <p>Turn your resume into a personal website with a single click and let your future employer find you online.</p>
                            </div>
                            <div className="toolbox-card">
                                <span className="toolbox-icon"></span>
                                <h3>Proofreading</h3>
                                <p>Our human proofreaders will ensure that your resume or cover letter has impeccable grammar.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Marta Testimonial Section */}
                <section className="testimonial-section">
                    <div className="testimonial-wrapper">
                        <div className="testimonial-card">
                            <div className="recruiter-img-container">
                                <img src="/marta.png" alt="Marta Říhová" className="recruiter-img" />
                            </div>
                            <div className="recruiter-content">
                                <span className="recruiter-tag">HR Consultant on the Project</span>
                                <h2>Marta Říhová</h2>
                                <p className="recruiter-text">
                                    "Marta Říhová is a passionate HR enthusiast with over 10 years of experience in IT recruitment, working with both startups and major companies like SAP Signavio and MANN+HUMMEL. She founded Limetee to bring a fresh perspective to recruitment, leveraging her IT background and unique approach to hiring. Marta excels in using hard data, making her a strategic partner in HR."
                                </p>
                                <div className="recruiter-social-row">
                                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="linkedin-icon-link">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                        <span>LinkedIn Profile</span>
                                    </a>
                                </div>
                            </div>
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

export default Landing
