const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    jobTitle: {
        type: String,
        required: [true, "Job title is required"]
    },
    companyName: {
        type: String,
        required: [true, "Company name is required"]
    },
    jobDescription: {
        type: String
    },
    skills: {
        type: String
    },
    content: {
        type: String,
        required: [true, "Cover letter content is required"]
    }
}, {
    timestamps: true
});

const coverLetterModel = mongoose.model("CoverLetter", coverLetterSchema);

module.exports = coverLetterModel;
