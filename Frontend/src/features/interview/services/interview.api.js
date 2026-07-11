import { api } from "../../auth/services/auth.api";


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}

/**
 * @description Service to generate cover letter based on job inputs.
 */
export const generateCoverLetterApi = async ({ jobTitle, companyName, jobDescription, skills }) => {
    const response = await api.post("/api/cover-letter/", { jobTitle, companyName, jobDescription, skills })
    return response.data
}

/**
 * @description Service to get all generated cover letters for the user.
 */
export const getAllCoverLettersApi = async () => {
    const response = await api.get("/api/cover-letter/")
    return response.data
}

// =====================================================
// MOCK SESSION APIs
// =====================================================

/**
 * @description Evaluate a user's answer to an interview question.
 */
export const evaluateAnswerApi = async ({ question, userAnswer, questionType }) => {
    const response = await api.post("/api/mock-session/evaluate", { question, userAnswer, questionType })
    return response.data
}

/**
 * @description Stream AI content via SSE. Returns an EventSource-like interface.
 * @param {string} prompt
 * @param {string} context
 * @param {function} onChunk - Called with each text chunk
 * @param {function} onDone - Called when streaming is complete
 * @param {function} onError - Called on error
 */
export const streamContentApi = async ({ prompt, context, onChunk, onDone, onError }) => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "http://localhost:3000"
        const response = await fetch(`${baseUrl}/api/mock-session/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ prompt, context })
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.slice(6))
                        if (data.done) {
                            onDone?.()
                        } else if (data.error) {
                            onError?.(data.error)
                        } else if (data.text) {
                            onChunk?.(data.text)
                        }
                    } catch (e) {
                        // Skip malformed JSON
                    }
                }
            }
        }
        onDone?.()
    } catch (error) {
        onError?.(error.message || "Streaming failed")
    }
}

// =====================================================
// ANALYTICS APIs
// =====================================================

/**
 * @description Get analytics data for the current user.
 */
export const getAnalyticsApi = async () => {
    const response = await api.get("/api/analytics/")
    return response.data
}

// =====================================================
// SKILL ROADMAP APIs
// =====================================================

/**
 * @description Generate a skill roadmap based on interview report.
 */
export const generateSkillRoadmapApi = async (interviewReportId) => {
    const response = await api.post(`/api/interview/roadmap/${interviewReportId}`)
    return response.data
}

// =====================================================
// SHAREABLE REPORT APIs
// =====================================================

/**
 * @description Get a shareable link for a report.
 */
export const getShareLinkApi = async (interviewReportId) => {
    const response = await api.post(`/api/share/${interviewReportId}`)
    return response.data
}

/**
 * @description Fetch a shared report by slug (public, no auth required).
 */
export const getSharedReportApi = async (slug) => {
    const response = await api.get(`/api/share/${slug}`)
    return response.data
}