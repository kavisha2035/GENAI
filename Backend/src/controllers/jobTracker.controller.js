const JobTracker = require('../models/jobTracker.model');

// GET all jobs for the logged-in user
const getJobs = async (req, res) => {
  try {
    const jobs = await JobTracker.find({ user: req.user.id })
      .populate('interviewReport', 'title matchScore')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('getJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// POST create a new job card
const createJob = async (req, res) => {
  try {
    const { companyName, jobTitle, jobUrl, status, deadline } = req.body;
    const job = await JobTracker.create({
      user: req.user.id,
      companyName,
      jobTitle,
      jobUrl,
      status: status || 'saved',
      deadline: deadline || null
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// PATCH update status, deadline, or link a report
const updateJob = async (req, res) => {
  try {
    const job = await JobTracker.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    ).populate('interviewReport', 'title matchScore');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// DELETE a job card
const deleteJob = async (req, res) => {
  try {
    const result = await JobTracker.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteJob error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// GET jobs with deadlines in the next 3 days (for reminder banner)
const getUpcomingDeadlines = async (req, res) => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const jobs = await JobTracker.find({
      user: req.user.id,
      deadline: { $gte: now, $lte: soon },
      status: { $nin: ['offer', 'rejected'] }
    }).sort({ deadline: 1 });
    res.json(jobs);
  } catch (error) {
    console.error('getUpcomingDeadlines error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming deadlines' });
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getUpcomingDeadlines
};
