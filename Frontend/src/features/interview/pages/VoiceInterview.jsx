import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useSpeech } from "../hooks/useSpeech"
import { useInterview } from "../hooks/useInterview"
import MockSession from "./MockSession"
import { streamContentApi } from "../services/interview.api"
import "../style/voice-interview.scss"

/**
 * VoiceInterview — Full voice-enabled mock interview page.
 * Combines the interview report questions with voice interaction and
 * real-time AI streaming feedback.
 */
export default function VoiceInterview() {
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const { report, loading, getReportById } = useInterview()
    const speech = useSpeech()

    const [activeTab, setActiveTab] = useState("practice") // "practice" | "stream"
    const [streamText, setStreamText] = useState("")
    const [streamLoading, setStreamLoading] = useState(false)
    const [streamPrompt, setStreamPrompt] = useState("")

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    // Build the question list from the report
    const allQuestions = []
    if (report) {
        (report.technicalQuestions || []).forEach(q => {
            allQuestions.push({ ...q, type: "technical" })
        });
        (report.behavioralQuestions || []).forEach(q => {
            allQuestions.push({ ...q, type: "behavioral" })
        })
    }

    const handleStreamRequest = async () => {
        if (!streamPrompt.trim()) return
        setStreamLoading(true)
        setStreamText("")

        await streamContentApi({
            prompt: streamPrompt,
            context: report ? `Job: ${report.title}. Skills: ${(report.skillGaps || []).map(s => s.skill).join(", ")}` : "",
            onChunk: (text) => setStreamText(prev => prev + text),
            onDone: () => setStreamLoading(false),
            onError: (err) => {
                setStreamText(prev => prev + `\n\n[Error: ${err}]`)
                setStreamLoading(false)
            }
        })
    }

    if (loading) {
        return (
            <div className="voice-interview-loading">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading interview data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="voice-interview-page">
            {/* Header */}
            <header className="vi-header">
                <button className="vi-back-btn" onClick={() => navigate(interviewId ? `/interview/${interviewId}` : "/dashboard")}>
                    ← Back
                </button>
                <div className="vi-title-block">
                    <h1> Mock Interview Practice</h1>
                    {report && <p className="vi-subtitle">Practicing for: <strong>{report.title}</strong></p>}
                </div>
                {!speech.supported && (
                    <div className="vi-browser-warning">
                         Voice features require Chrome or Edge browser
                    </div>
                )}
            </header>

            {/* Tab Switcher */}
            <div className="vi-tabs">
                <button className={`vi-tab ${activeTab === "practice" ? "active" : ""}`} onClick={() => setActiveTab("practice")}>
                    Practice Questions
                </button>
                <button className={`vi-tab ${activeTab === "stream" ? "active" : ""}`} onClick={() => setActiveTab("stream")}>
                     AI Coach (Live)
                </button>
            </div>

            {/* Tab Content */}
            <div className="vi-content">
                {activeTab === "practice" ? (
                    <MockSession
                        questions={allQuestions}
                        reportTitle={report?.title || "Interview"}
                    />
                ) : (
                    <div className="stream-coach-panel">
                        <div className="stream-header">
                            <h2>AI Interview Coach</h2>
                            <p>Ask follow-up questions, request explanations, or get custom practice scenarios — responses stream in real-time.</p>
                        </div>

                        <div className="stream-input-area">
                            <textarea
                                className="stream-prompt-input"
                                value={streamPrompt}
                                onChange={(e) => setStreamPrompt(e.target.value)}
                                placeholder={`Try: "Give me a harder version of the system design question" or "How should I explain my experience with microservices?"`}
                                rows={3}
                                disabled={streamLoading}
                            />
                            <button
                                className="stream-send-btn"
                                onClick={handleStreamRequest}
                                disabled={streamLoading || !streamPrompt.trim()}
                            >
                                {streamLoading ? (
                                    <><span className="btn-spinner" /> Streaming...</>
                                ) : (
                                    " Send"
                                )}
                            </button>
                        </div>

                        {streamText && (
                            <div className="stream-output">
                                <div className="stream-output-header">
                                    <span>AI Response</span>
                                    {streamLoading && <span className="streaming-indicator">● Streaming...</span>}
                                </div>
                                <div className="stream-output-text">
                                    {streamText}
                                    {streamLoading && <span className="stream-cursor">▊</span>}
                                </div>
                            </div>
                        )}

                        {/* Quick Prompt Chips */}
                        <div className="quick-prompts">
                            <span className="quick-label">Quick prompts:</span>
                            {[
                                "Give me a follow-up question",
                                "How do I structure a STAR answer?",
                                "What are common mistakes for this role?",
                                "Create a mini case study for me"
                            ].map((prompt, i) => (
                                <button key={i} className="quick-chip" onClick={() => {
                                    setStreamPrompt(prompt)
                                }} disabled={streamLoading}>
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
