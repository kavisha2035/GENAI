const express=require("express")
const authMiddleware=require("../middlewares/auth.middleware")
const interviewController=require("../controllers/interview.controller")
const upload=require("../middlewares/file.middleware")
const { validateInterviewReport } = require("../middlewares/validation.middleware")

const interviewRouter=express.Router()



interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"), validateInterviewReport, interviewController.generateInterViewReportController) 

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController) 

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController) 

/**
 * @route POST /api/interview/roadmap/:interviewReportId
 * @description Generate a skill development roadmap from an interview report's skill gaps.
 * @access private
 */
interviewRouter.post("/roadmap/:interviewReportId", authMiddleware.authUser, interviewController.generateSkillRoadmapController)

interviewRouter.get("/:id/coding", authMiddleware.authUser, interviewController.getCodingQuestionsController)

module.exports=interviewRouter