const mongoose = require('mongoose');


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const questionsToAskSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
})

const exampleSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    explanation: {
        type: String
    }
}, {
    _id: false
})

const codingQuestionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    examples: [ exampleSchema ],
    constraints: [ String ],
    hints: [ String ],
    approach: {
        type: String,
        required: true
    },
    timeComplexity: {
        type: String,
        required: true
    },
    spaceComplexity: {
        type: String,
        required: true
    }
}, {
    _id: false
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    questionsToAsk: [ questionsToAskSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    codingQuestions: [ codingQuestionSchema ],
    codingQuestionsGeneratedAt: {
        type: Date
    },
    resumeHtml: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    },
    shareSlug: {
        type: String,
        unique: true,
        sparse: true  // Allow multiple null values
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Performance indexes
interviewReportSchema.index({ user: 1, createdAt: -1 })  // For getAllReports sorted by date
interviewReportSchema.index({ user: 1, jobDescription: 1, selfDescription: 1, resume: 1 })  // For dedup cache lookups
interviewReportSchema.index({ shareSlug: 1 })  // For shared report lookups

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;  