const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const { evaluateAnswerController, streamContentController } = require("../controllers/mockSession.controller")
const { validateMockEvaluation } = require("../middlewares/validation.middleware")

const mockSessionRouter = express.Router()

/**
 * @route POST /api/mock-session/evaluate
 * @description Evaluate a user's answer to an interview question using AI.
 * @access private
 */
mockSessionRouter.post("/evaluate", authMiddleware.authUser, validateMockEvaluation, evaluateAnswerController)

/**
 * @route POST /api/mock-session/stream
 * @description Stream AI content via Server-Sent Events.
 * @access private
 */
mockSessionRouter.post("/stream", authMiddleware.authUser, streamContentController)

module.exports = mockSessionRouter
