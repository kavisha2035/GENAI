const rateLimit = require("express-rate-limit")
const { ipKeyGenerator } = rateLimit

/**
 * Global rate limiter — 100 requests per 15 minutes per IP.
 * Prevents general abuse and brute-force attacks.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests from this IP. Please try again later.",
        retryAfter: "15 minutes"
    }
})

/**
 * AI-specific rate limiter — 10 requests per 15 minutes per user.
 * Protects Gemini API quota (250 req/day free tier).
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use authenticated user ID if available for per-user limiting;
        // otherwise use ipKeyGenerator which handles IPv6 addresses correctly.
        if (req.user?.id) return req.user.id
        return ipKeyGenerator(req)
    },
    validate: { xForwardedForHeader: false },
    message: {
        message: "AI generation rate limit exceeded. You can make 10 AI requests per 15 minutes.",
        retryAfter: "15 minutes"
    }
})

/**
 * Auth rate limiter — 10 login/register attempts per 15 minutes per IP.
 * Prevents brute-force credential attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Please try again in 15 minutes.",
        retryAfter: "15 minutes"
    }
})

module.exports = { globalLimiter, aiLimiter, authLimiter }
