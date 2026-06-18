const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const { generateShareLinkController, getSharedReportController, revokeShareLinkController } = require("../controllers/share.controller")

const shareRouter = express.Router()

/**
 * @route POST /api/share/:interviewReportId
 * @description Generate a shareable link for an interview report.
 * @access private
 */
shareRouter.post("/:interviewReportId", authMiddleware.authUser, generateShareLinkController)

/**
 * @route GET /api/share/:slug
 * @description Fetch a shared report by its public slug.
 * @access public
 */
shareRouter.get("/:slug", getSharedReportController)

/**
 * @route DELETE /api/share/:interviewReportId
 * @description Revoke a shareable link, making the report private.
 * @access private
 */
shareRouter.delete("/:interviewReportId", authMiddleware.authUser, revokeShareLinkController)

module.exports = shareRouter
