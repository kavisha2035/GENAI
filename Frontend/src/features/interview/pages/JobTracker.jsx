import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchJobs, createJob, updateJob, deleteJob, fetchDeadlines } from '../services/tracker.api.js';
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../../auth/hooks/useAuth';
import '../style/tracker.scss';

const STATUSES = [
  { key: 'saved',               label: 'Saved' },
  { key: 'applied',             label: 'Applied' },
  { key: 'interview_scheduled', label: 'Interview Scheduled' },
  { key: 'offer',               label: 'Offer' },
  { key: 'rejected',            label: 'Rejected' },
];

export default function JobTracker() {
  const [jobs, setJobs]             = useState([]);
  const [deadlines, setDeadlines]   = useState([]);
  const [modal, setModal]           = useState(null); // null | 'add' | job object
  const [loading, setLoading]       = useState(true);
  const [draggedOverCol, setDraggedOverCol] = useState(null);
  
  const { reports } = useInterview();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchJobs(), fetchDeadlines()])
      .then(([j, d]) => {
        setJobs(j.data);
        setDeadlines(d.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load job tracker data:', err);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (formData) => {
    try {
      const { data } = await createJob(formData);
      setJobs(prev => [data, ...prev]);
      setModal(null);
      // Refresh deadlines
      const d = await fetchDeadlines();
      setDeadlines(d.data);
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  const handleUpdate = async (id, patch) => {
    try {
      const { data } = await updateJob(id, patch);
      setJobs(prev => prev.map(j => j._id === id ? data : j));
      setModal(null);
      // Refresh deadlines
      const d = await fetchDeadlines();
      setDeadlines(d.data);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      setModal(null);
      // Refresh deadlines
      const d = await fetchDeadlines();
      setDeadlines(d.data);
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleStatusDrop = (jobId, newStatus) => {
    setDraggedOverCol(null);
    handleUpdate(jobId, { status: newStatus });
  };

  if (loading) {
    return (
      <main className="home dashboard-view">
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
        </header>
        <div className="tracker-loading">Loading tracker...</div>
      </main>
    );
  }

  return (
    <main className="home dashboard-view">
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
          <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
          <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/resumes'); }}>Resumes</a>
          <a href="#" className="nav-menu-btn link-btn" onClick={(e) => { e.preventDefault(); navigate('/cover-letter'); }}>Cover Letter</a>
          <span className="nav-menu-btn active-dash-badge">Job Tracker</span>
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

      <div className="tracker-page">
        <div className="tracker-hero-section">
          {/* Deadline reminder banner */}
          {deadlines.length > 0 && (
            <div className="deadline-banner">
              <span className="deadline-title">Upcoming deadlines:</span>
              {deadlines.map(d => (
                <span key={d._id} className="deadline-chip">
                  {d.companyName} - {new Date(d.deadline).toLocaleDateString()}
                </span>
              ))}
            </div>
          )}

          <div className="tracker-header">
            <h1>Job Application Tracker</h1>
            <button className="btn-primary" onClick={() => setModal('add')}>
              Add Job
            </button>
          </div>
        </div>

        {/* White section: Kanban board */}
        <section className="tracker-board-section">
          <div className="tracker-board-container">
            <div className="kanban-board">
              {STATUSES.map(({ key, label }) => (
                <KanbanColumn
                  key={key}
                  status={key}
                  label={label}
                  jobs={jobs.filter(j => j.status === key)}
                  onDrop={handleStatusDrop}
                  onEdit={job => setModal(job)}
                  draggedOverCol={draggedOverCol}
                  setDraggedOverCol={setDraggedOverCol}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Add / Edit modal */}
        {modal && (
          <JobModal
            job={modal === 'add' ? null : modal}
            reports={reports || []}
            onSave={modal === 'add' ? handleCreate : (data) => handleUpdate(modal._id, data)}
            onDelete={modal !== 'add' ? () => handleDelete(modal._id) : null}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </main>
  );
}

// Kanban column
function KanbanColumn({ status, label, jobs, onDrop, onEdit, draggedOverCol, setDraggedOverCol }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    if (draggedOverCol !== status) {
      setDraggedOverCol(status);
    }
  };
  
  const handleDragLeave = () => {
    if (draggedOverCol === status) {
      setDraggedOverCol(null);
    }
  };

  const handleDrop = (e) => {
    const jobId = e.dataTransfer.getData('jobId');
    onDrop(jobId, status);
  };

  return (
    <div
      className={`kanban-col ${draggedOverCol === status ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-col-header">
        <span className={`status-dot status-${status}`} />
        {label}
        <span className="kanban-count">{jobs.length}</span>
      </div>
      {jobs.map(job => (
        <JobCard key={job._id} job={job} onEdit={onEdit} />
      ))}
    </div>
  );
}

// Job card
function JobCard({ job, onEdit }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('jobId', job._id);
  };
  
  const isDeadlineSoon = job.deadline &&
    new Date(job.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="job-card" draggable onDragStart={handleDragStart} onClick={() => onEdit(job)}>
      <div className="job-card-company">{job.companyName}</div>
      <div className="job-card-title">{job.jobTitle}</div>
      
      {job.interviewReport && (
        <div className="job-card-badge linked">
          Report: {job.interviewReport.matchScore}% Match
        </div>
      )}
      
      {job.deadline && (
        <div className={`job-card-badge ${isDeadlineSoon ? 'urgent' : 'deadline'}`}>
          Deadline: {new Date(job.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Add / Edit modal
function JobModal({ job, reports, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    companyName:      job?.companyName      || '',
    jobTitle:         job?.jobTitle         || '',
    jobUrl:           job?.jobUrl           || '',
    status:           job?.status           || 'saved',
    deadline:         job?.deadline ? job.deadline.slice(0, 10) : '',
    interviewReport:  job?.interviewReport?._id || ''
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.companyName || !form.jobTitle) return;
    onSave({
      ...form,
      deadline:        form.deadline || null,
      interviewReport: form.interviewReport || null
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>{job ? 'Edit Job Application' : 'Add Job Application'}</h2>

        <label>Company Name *</label>
        <input value={form.companyName} onChange={set('companyName')} placeholder="e.g. Swiggy" required />

        <label>Job Title *</label>
        <input value={form.jobTitle} onChange={set('jobTitle')} placeholder="e.g. SDE-1" required />

        <label>Job URL</label>
        <input value={form.jobUrl} onChange={set('jobUrl')} placeholder="careers.swiggy.com/..." />

        <label>Status</label>
        <select value={form.status} onChange={set('status')}>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>

        <label>Deadline / Interview Date</label>
        <input type="date" value={form.deadline} onChange={set('deadline')} />

        <label>Link to Prep Report</label>
        <select value={form.interviewReport} onChange={set('interviewReport')}>
          <option value="">None</option>
          {reports.map(r => (
            <option key={r._id} value={r._id}>
              {r.title} ({r.matchScore}% Match)
            </option>
          ))}
        </select>

        <div className="modal-actions">
          {onDelete && (
            <button className="btn-danger" onClick={onDelete}>Delete</button>
          )}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {job ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
