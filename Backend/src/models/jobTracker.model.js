const mongoose = require('mongoose');

const jobTrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobUrl: { type: String },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interview_scheduled', 'offer', 'rejected'],
    default: 'saved'
  },
  deadline: { type: Date },
  interviewReport: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewReport', default: null }
}, { timestamps: true });

jobTrackerSchema.index({ user: 1, createdAt: -1 });

const jobTrackerModel = mongoose.model('JobTracker', jobTrackerSchema);

module.exports = jobTrackerModel;
