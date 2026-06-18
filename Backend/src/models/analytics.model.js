const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    event: {
        type: String,
        required: true,
        enum: [
            "report_generated",
            "resume_downloaded",
            "cover_letter_generated",
            "mock_session_started",
            "answer_evaluated",
            "roadmap_generated",
            "report_shared"
        ]
    },
    metadata: {
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewReport" },
        score: Number,
        jobTitle: String,
        questionType: String,
        duration: Number  // in seconds
    }
}, {
    timestamps: true
})

// Performance indexes
analyticsSchema.index({ user: 1, createdAt: -1 })
analyticsSchema.index({ user: 1, event: 1 })

const analyticsModel = mongoose.model("Analytics", analyticsSchema)

module.exports = analyticsModel
