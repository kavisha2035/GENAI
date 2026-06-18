const express = require('express');
const { getJobs, createJob, updateJob, deleteJob, getUpcomingDeadlines } = require('../controllers/jobTracker.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.authUser); // all routes protected

router.get('/', getJobs);
router.post('/', createJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);
router.get('/deadlines', getUpcomingDeadlines);

module.exports = router;
