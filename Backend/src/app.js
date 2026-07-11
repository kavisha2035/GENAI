const express = require("express")
const cookieParser = require("cookie-parser")
const app = express()
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const { globalLimiter, aiLimiter, authLimiter } = require("./middlewares/rateLimit.middleware")

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:")) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}))

// Apply global rate limiter to all routes
app.use(globalLimiter)

/* require all the routes here * */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const coverLetterRouter = require("./routes/coverLetter.routes")
const mockSessionRouter = require("./routes/mockSession.routes")
const analyticsRouter = require("./routes/analytics.routes")
const shareRouter = require("./routes/share.routes")
const jobTrackerRouter = require("./routes/jobTracker.routes")


/**use all the routes here */
app.use("/api/auth", authLimiter, authRouter)
// Apply AI limiter to AI-heavy routes
app.use("/api/interview", aiLimiter, interviewRouter)
app.use("/api/cover-letter", aiLimiter, coverLetterRouter)
app.use("/api/mock-session", aiLimiter, mockSessionRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api/share", shareRouter)
app.use("/api/tracker", jobTrackerRouter)

// Serve frontend static assets in production
const frontendDistPath = path.join(__dirname, "../../Frontend/dist")
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath))
    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"))
    })
}

module.exports = app