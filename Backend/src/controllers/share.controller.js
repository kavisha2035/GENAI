const crypto = require("crypto")
const interviewReportModel = require("../models/interviewReport.model")
const { trackEvent } = require("./analytics.controller")

/**
 * @description Generate a shareable link for an interview report.
 * Creates a unique slug if one doesn't exist.
 */
async function generateShareLinkController(req, res) {
    try {
        const { interviewReportId } = req.params
        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        // Generate slug if not already present
        if (!report.shareSlug) {
            report.shareSlug = crypto.randomBytes(8).toString("hex")
            report.isPublic = true
            await report.save()
        }

        // Track analytics
        trackEvent(req.user.id, "report_shared", { reportId: interviewReportId })

        res.status(200).json({
            message: "Share link generated successfully.",
            shareSlug: report.shareSlug,
            shareUrl: `/shared/${report.shareSlug}`
        })
    } catch (error) {
        console.error("[Share] Error generating share link:", error)
        res.status(500).json({ message: "Failed to generate share link." })
    }
}

/**
 * @description Fetch a shared report by slug. Public, no auth required.
 */
async function getSharedReportController(req, res) {
    try {
        const { slug } = req.params
        const report = await interviewReportModel.findOne({ shareSlug: slug, isPublic: true })
            .select("-resume -selfDescription -jobDescription -user -__v -resumeHtml")

        if (!report) {
            return res.status(404).json({ message: "Shared report not found or has been made private." })
        }

        res.status(200).json({
            message: "Shared report fetched successfully.",
            report
        })
    } catch (error) {
        console.error("[Share] Error fetching shared report:", error)
        res.status(500).json({ message: "Failed to fetch shared report." })
    }
}

/**
 * @description Revoke a shared link (make report private).
 */
async function revokeShareLinkController(req, res) {
    try {
        const { interviewReportId } = req.params
        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        report.isPublic = false
        report.shareSlug = undefined
        await report.save()

        res.status(200).json({ message: "Share link revoked successfully." })
    } catch (error) {
        console.error("[Share] Error revoking share link:", error)
        res.status(500).json({ message: "Failed to revoke share link." })
    }
}

module.exports = { generateShareLinkController, getSharedReportController, revokeShareLinkController }
