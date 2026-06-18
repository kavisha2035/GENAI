import React from 'react'
import "../auth.form.scss"
import { Link, useNavigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { useState, useEffect } from 'react'

const Login = () => {
  const { loading, handleLogin, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeSlide, setActiveSlide] = useState(0)

  const testimonials = [
    {
      badge: "Hired with Kickresume Premium",
      role: "Editorial Intern at Volvo",
      quote: "Kickresume allowed me to create a gorgeous, professional CV and cover letter that set me apart from other candidates.",
      author: "Joseph Kearney"
    },
    {
      badge: "Hired at Google",
      role: "Research Intern",
      quote: "The AI cover letter matching the target job description helped me land interviews in top research divisions.",
      author: "Mr. Saiu Landsnayer"
    },
    {
      badge: "Hired at Netflix",
      role: "Senior Software Engineer",
      quote: "Clean, professional, and ATS-friendly layouts that automatically structure my key experiences.",
      author: "Ella Filmer"
    }
  ]

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin({ email, password })
  }

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-container">
          <div className="auth-spinner"></div>
          <h1>Logging in...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-split-container">
      {/* Left Visual Panel */}
      <div className="auth-visual-panel">
        <div className="panel-overlay"></div>
        <div className="visual-content">
          <div className="testimonial-slider">
            {testimonials.map((item, idx) => (
              <div key={idx} className={`testimonial-slide ${idx === activeSlide ? 'active' : ''}`}>
                <span className="success-badge">{item.badge}</span>
                <p className="quote">"{item.quote}"</p>
                <div className="author-meta">
                  <span className="author-name">{item.author}</span>
                  <span className="author-role">{item.role}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-dots">
            {testimonials.map((_, idx) => (
              <span 
                key={idx} 
                className={`dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
              ></span>
            ))}
          </div>

          <div className="partners-logo-row">
            <p className="partners-title">Trusted by successful job seekers worldwide</p>
            <div className="logos-grid">
              <span>Google</span>
              <span>Facebook</span>
              <span>NASA</span>
              <span>Apple</span>
              <span>Nike</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <header className="auth-panel-header">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-toggle-link">Sign Up</Link>
        </header>

        <div className="auth-form-wrapper">
          <div className="auth-logo-header" onClick={() => navigate('/')}>
            <span className="logo-icon"></span>
            <span>interview<span className="accent-text">Prep.ai</span></span>
          </div>

          <h2>Log in to your account.</h2>

          <div className="social-auth-buttons">
            <button type="button" className="social-btn linkedin">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              Sign in with LinkedIn
            </button>
            <div className="social-grid">
              <button type="button" className="social-btn google">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.91 2.37-1.99 3.1v2.58h3.2c1.88-1.73 2.96-4.28 2.96-7.22 0-.62-.06-1.22-.2-1.78z" fill="#4285F4"/>
                  <path d="M12 20.5c2.3 0 4.22-.76 5.63-2.07l-3.2-2.58c-.89.6-2.03.95-3.23.95-2.48 0-4.58-1.67-5.33-3.92H2.57v2.67c1.47 2.93 4.5 4.95 8.03 4.95z" fill="#34A853"/>
                  <path d="M6.67 12.88a5.1 5.1 0 0 1 0-3.16V7.05H2.57a8.96 8.96 0 0 0 0 8.5l4.1-2.67z" fill="#FBBC05"/>
                  <path d="M12 7.25c1.25 0 2.37.43 3.25 1.28l2.44-2.44C16.22 4.67 14.3 4 12 4 8.47 4 5.44 6.02 3.97 8.95l4.1 3.18c.75-2.25 2.85-3.92 5.33-3.92z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-btn facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <div className="auth-divider">
            <span>or log in with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-credentials-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter email address" 
                required 
              />
            </div>
            
            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-password-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
              </div>
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter password" 
                required 
              />
            </div>

            <button className="button primary-button" disabled={loading}>
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
