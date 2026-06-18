const analyticsModel = require("../models/analytics.model")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * Helper to track analytics events from other controllers.
 */
async function trackEvent(userId, event, metadata = {}) {
    try {
        await analyticsModel.create({
            user: userId,
            event,
            metadata
        })
    } catch (error) {
        console.error("[Analytics] Failed to track event:", error.message)
    }
}

/**
 * @description Get analytics dashboard data for the authenticated user.
 * Returns aggregated stats, activity timeline, and score history.
 */
async function getAnalyticsController(req, res) {
    try {
        const userId = req.user.id

        // Total counts by event type
        const eventCounts = await analyticsModel.aggregate([
            { $match: { user: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
            { $group: { _id: "$event", count: { $sum: 1 } } }
        ])

        const countsMap = {}
        eventCounts.forEach(e => { countsMap[e._id] = e.count })

        // Score history from interview reports
        const reports = await interviewReportModel
            .find({ user: userId })
            .sort({ createdAt: 1 })
            .select("matchScore title createdAt")
            .lean()

        const scoreHistory = reports.map(r => ({
            score: r.matchScore,
            title: r.title,
            date: r.createdAt
        }))

        // Average match score
        const avgScore = reports.length > 0
            ? Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / reports.length)
            : 0

        // Recent activity (last 20 events)
        const recentActivity = await analyticsModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()

        // Weekly activity (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const weeklyActivity = await analyticsModel.aggregate([
            {
                $match: {
                    user: require("mongoose").Types.ObjectId.createFromHexString(userId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // Mock session scores
        const mockScores = await analyticsModel
            .find({ user: userId, event: "answer_evaluated", "metadata.score": { $exists: true } })
            .sort({ createdAt: 1 })
            .select("metadata.score metadata.questionType createdAt")
            .lean()

        const practiceScores = mockScores.map(s => ({
            score: s.metadata?.score || 0,
            type: s.metadata?.questionType || "technical",
            date: s.createdAt
        }))

        res.status(200).json({
            message: "Analytics data fetched successfully.",
            analytics: {
                totalReports: reports.length,
                totalResumes: countsMap["resume_downloaded"] || 0,
                totalCoverLetters: countsMap["cover_letter_generated"] || 0,
                totalMockSessions: countsMap["mock_session_started"] || 0,
                totalEvaluations: countsMap["answer_evaluated"] || 0,
                avgMatchScore: avgScore,
                scoreHistory,
                practiceScores,
                weeklyActivity,
                recentActivity
            }
        })
    } catch (error) {
        console.error("[Analytics] getAnalytics error:", error)
        res.status(500).json({ message: "Failed to fetch analytics data." })
    }
}

module.exports = { getAnalyticsController, trackEvent }
