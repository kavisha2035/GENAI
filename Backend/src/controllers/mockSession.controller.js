const { evaluateAnswer, generateContentStream } = require("../services/ai.service")
const { trackEvent } = require("./analytics.controller")

/**
 * @description Evaluate a user's answer to an interview question using Gemini AI.
 * Returns score, feedback, and a model answer.
 */
async function evaluateAnswerController(req, res) {
    try {
        const { question, userAnswer, questionType } = req.body

        const evaluation = await evaluateAnswer({
            question,
            userAnswer,
            questionType: questionType || "technical"
        })

        // Track analytics
        trackEvent(req.user.id, "answer_evaluated", {
            score: evaluation.score,
            questionType: questionType || "technical"
        })

        res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation
        })
    } catch (error) {
        console.error("[MockSession] Evaluation error:", error)
        const msg = error?.message || ""
        if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
            return res.status(429).json({ message: "AI rate limit reached. Please wait and try again." })
        }
        res.status(503).json({ message: "AI evaluation service is temporarily unavailable." })
    }
}

/**
 * @description SSE streaming endpoint — streams AI content token-by-token.
 * Used for real-time feedback display in the frontend.
 */
async function streamContentController(req, res) {
    const { prompt, context } = req.body

    if (!prompt) {
        return res.status(400).json({ message: "Prompt is required for streaming." })
    }

    // Set SSE headers
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    })

    try {
        const fullPrompt = context
            ? `Context: ${context}\n\nUser Request: ${prompt}`
            : prompt

        const stream = await generateContentStream(fullPrompt)

        for await (const chunk of stream) {
            const text = chunk.text || ""
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`)
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
        res.end()
    } catch (error) {
        console.error("[Stream] Streaming error:", error)
        res.write(`data: ${JSON.stringify({ error: "Stream failed. Please try again." })}\n\n`)
        res.end()
    }
}

module.exports = { evaluateAnswerController, streamContentController }
