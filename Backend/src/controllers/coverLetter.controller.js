const { generateCoverLetter } = require("../services/ai.service")
const coverLetterModel = require("../models/coverLetter.model")
const { trackEvent } = require("./analytics.controller")

/**
 * Controller to generate a cover letter using AI and save it to the database.
 */
async function generateCoverLetterController(req, res) {
    try {
        const { jobTitle, companyName, jobDescription, skills } = req.body
        const userId = req.user.id

        if (!jobTitle || !companyName) {
            return res.status(400).json({ message: "Job title and company name are required." })
        }

        const coverLetterContent = await generateCoverLetter({
            jobTitle,
            companyName,
            jobDescription: jobDescription || "",
            skills: skills || ""
        })

        const coverLetter = await coverLetterModel.create({
            user: userId,
            jobTitle,
            companyName,
            jobDescription: jobDescription || "",
            skills: skills || "",
            content: coverLetterContent
        })

        // Track analytics
        trackEvent(userId, "cover_letter_generated", { jobTitle })

        res.status(201).json({
            message: "Cover letter generated successfully.",
            coverLetter
        })
    } catch (error) {
        console.error("[generateCoverLetter Error]", error)
        res.status(500).json({ message: "Failed to generate cover letter. Please try again." })
    }
}

/**
 * Controller to fetch all cover letters for the logged-in user.
 */
async function getAllCoverLettersController(req, res) {
    try {
        const userId = req.user.id
        const coverLetters = await coverLetterModel.find({ user: userId }).sort({ createdAt: -1 })

        res.status(200).json({
            message: "Cover letters fetched successfully.",
            coverLetters
        })
    } catch (error) {
        console.error("[getAllCoverLetters Error]", error)
        res.status(500).json({ message: "Failed to fetch cover letters." })
    }
}

/**
 * Controller to fetch a specific cover letter by ID.
 */
async function getCoverLetterByIdController(req, res) {
    try {
        const { id } = req.params
        const userId = req.user.id

        const coverLetter = await coverLetterModel.findOne({ _id: id, user: userId })
        if (!coverLetter) {
            return res.status(404).json({ message: "Cover letter not found." })
        }

        res.status(200).json({
            message: "Cover letter fetched successfully.",
            coverLetter
        })
    } catch (error) {
        console.error("[getCoverLetterById Error]", error)
        res.status(500).json({ message: "Failed to fetch cover letter." })
    }
}

module.exports = {
    generateCoverLetterController,
    getAllCoverLettersController,
    getCoverLetterByIdController
}
