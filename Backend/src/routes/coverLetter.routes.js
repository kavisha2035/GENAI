const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const coverLetterController = require("../controllers/coverLetter.controller")
const { validateCoverLetter } = require("../middlewares/validation.middleware")

const coverLetterRouter = express.Router()

coverLetterRouter.post("/", authMiddleware.authUser, validateCoverLetter, coverLetterController.generateCoverLetterController)
coverLetterRouter.get("/", authMiddleware.authUser, coverLetterController.getAllCoverLettersController)
coverLetterRouter.get("/:id", authMiddleware.authUser, coverLetterController.getCoverLetterByIdController)

module.exports = coverLetterRouter

