const { body, validationResult } = require("express-validator")

/**
 * Middleware to check validation results and return errors.
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed.",
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        })
    }
    next()
}

/**
 * Validation chains for user registration.
 */
const validateRegister = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required.")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters.")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores."),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required.")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
        .matches(/[0-9]/).withMessage("Password must contain at least one number."),
    handleValidationErrors
]

/**
 * Validation chains for user login.
 */
const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required."),
    handleValidationErrors
]

/**
 * Validation chains for interview report generation.
 */
const validateInterviewReport = [
    body("jobDescription")
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage("Job description must be under 10,000 characters.")
        .escape(),
    body("selfDescription")
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage("Self description must be under 5,000 characters.")
        .escape(),
    handleValidationErrors
]

/**
 * Validation chains for cover letter generation.
 */
const validateCoverLetter = [
    body("jobTitle")
        .trim()
        .notEmpty().withMessage("Job title is required.")
        .isLength({ max: 200 }).withMessage("Job title must be under 200 characters.")
        .escape(),
    body("companyName")
        .trim()
        .notEmpty().withMessage("Company name is required.")
        .isLength({ max: 200 }).withMessage("Company name must be under 200 characters.")
        .escape(),
    body("jobDescription")
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage("Job description must be under 10,000 characters.")
        .escape(),
    body("skills")
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage("Skills must be under 2,000 characters.")
        .escape(),
    handleValidationErrors
]

/**
 * Validation chains for mock session answer evaluation.
 */
const validateMockEvaluation = [
    body("question")
        .trim()
        .notEmpty().withMessage("Question is required.")
        .isLength({ max: 2000 }).withMessage("Question must be under 2,000 characters."),
    body("userAnswer")
        .trim()
        .notEmpty().withMessage("Your answer is required.")
        .isLength({ max: 5000 }).withMessage("Answer must be under 5,000 characters."),
    body("questionType")
        .optional()
        .trim()
        .isIn(["technical", "behavioral"]).withMessage("Question type must be 'technical' or 'behavioral'."),
    handleValidationErrors
]

module.exports = {
    validateRegister,
    validateLogin,
    validateInterviewReport,
    validateCoverLetter,
    validateMockEvaluation
}
