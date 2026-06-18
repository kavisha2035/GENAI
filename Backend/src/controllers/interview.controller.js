const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, generatePdfFromHtml, generateSkillRoadmap, generateCodingQuestions } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const { trackEvent } = require("./analytics.controller")

function getTitleFromJobDescription(jobDescription) {
    const match = jobDescription.match(/^\s*Position:\s*(.+)$/im)
    if (match && match[1]) return match[1].trim()
    const firstLine = jobDescription.trim().split(/\r?\n/)[0]
    return firstLine || "Interview Report"
}

/**
 * Maps a Gemini / Google GenAI API error to an HTTP status code + message.
 */
function handleAiError(error, res) {
    const status = error?.status || error?.response?.status || error?.code
    const msg = error?.message || ""

    if (status === 429 || msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
        return res.status(429).json({
            message: "AI rate limit reached. You are sending too many requests. Please wait a minute and try again."
        })
    }
    if (status === 400 || msg.toLowerCase().includes("invalid")) {
        return res.status(400).json({ message: "Invalid request sent to AI service. Please check your input." })
    }
    console.error("[AI Error]", error)
    return res.status(503).json({ message: "AI service is temporarily unavailable. Please try again later." })
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = ""
        if (req.file) {
            const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = parsed.text || ""
        }
        const { selfDescription, jobDescription } = req.body

        // Server-Side Deduplication Cache Check
        const existingReport = await interviewReportModel.findOne({
            user: req.user.id,
            jobDescription: jobDescription || "",
            selfDescription: selfDescription || "",
            resume: resumeText
        })

        if (existingReport) {
            console.log("Matching report found in DB cache. Returning immediately to save tokens.")
            return res.status(200).json({
                message: "Interview report fetched from cache successfully.",
                interviewReport: existingReport
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription || ""
        })

        console.log("AI REPORT")
        console.log(JSON.stringify(interViewReportByAi, null, 2))

        const interviewReportData = {
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription || "",
            ...interViewReportByAi
        }

        if (!interviewReportData.title) {
            interviewReportData.title = getTitleFromJobDescription(jobDescription || "")
        }

        const interviewReport = await interviewReportModel.create(interviewReportData)

        // Track analytics event
        trackEvent(req.user.id, "report_generated", { reportId: interviewReport._id, jobTitle: interviewReport.title, score: interviewReport.matchScore })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        handleAiError(error, res)
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }
        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("[getInterviewReportById Error]", error)
        res.status(500).json({ message: "Failed to fetch interview report." })
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("[getAllInterviewReports Error]", error)
        res.status(500).json({ message: "Failed to fetch interview reports." })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        let pdfBuffer
        if (interviewReport.resumeHtml) {
            console.log("Cached HTML found in database. Generating PDF locally with Puppeteer.")
            pdfBuffer = await generatePdfFromHtml(interviewReport.resumeHtml)
        } else {
            console.log("No cached HTML found. Invoking Gemini AI to build resume template.")
            const { resume, jobDescription, selfDescription } = interviewReport
            const result = await generateResumePdf({ 
                resume: resume || "", 
                jobDescription: jobDescription || "", 
                selfDescription: selfDescription || "" 
            })
            
            pdfBuffer = result.pdfBuffer
            interviewReport.resumeHtml = result.html
            await interviewReport.save()
        }

        // Track analytics event
        trackEvent(req.user.id, "resume_downloaded", { reportId: interviewReportId })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        handleAiError(error, res)
    }
}

/**
 * @description Generate a skill development roadmap from an interview report.
 */
async function generateSkillRoadmapController(req, res) {
    try {
        const { interviewReportId } = req.params
        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const roadmap = await generateSkillRoadmap({
            skillGaps: report.skillGaps || [],
            jobDescription: report.jobDescription || "",
            resume: report.resume || ""
        })

        // Track analytics event
        trackEvent(req.user.id, "roadmap_generated", { reportId: interviewReportId })

        res.status(200).json({
            message: "Skill roadmap generated successfully.",
            roadmap: roadmap.roadmap || []
        })
    } catch (error) {
        console.error("[Roadmap Error]", error)
        res.status(500).json({ message: "Failed to generate skill roadmap." })
    }
}

async function getCodingQuestionsController(req, res) {
    try {
        const { id } = req.params
        const report = await interviewReportModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!report) {
            return res.status(404).json({ error: 'Report not found' })
        }

        // Return cached questions if already generated
        if (report.codingQuestions && report.codingQuestions.length > 0) {
            return res.json({ questions: report.codingQuestions, cached: true })
        }

        // Generate fresh from Gemini
        const questions = await generateCodingQuestions(report)

        // Cache in the report document
        report.codingQuestions = questions
        report.codingQuestionsGeneratedAt = new Date()
        await report.save()

        res.json({ questions, cached: false })
    } catch (err) {
        console.error('Coding questions error:', err)
        res.status(500).json({ error: 'Failed to generate coding questions' })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generateSkillRoadmapController,
    getCodingQuestionsController
}