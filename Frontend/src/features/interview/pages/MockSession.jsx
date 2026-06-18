import { useState, useEffect, useCallback } from "react"
import { useSpeech } from "../hooks/useSpeech"
import { evaluateAnswerApi } from "../services/interview.api"
import "../style/voice-interview.scss"

/**
 * MockSession — Interactive mock interview practice component.
 * Users can practice answering questions from their interview report,
 * either by typing or using voice input, and get AI-powered feedback.
 */
export default function MockSession({ questions = [], reportTitle = "" }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [evaluation, setEvaluation] = useState(null)
    const [evaluating, setEvaluating] = useState(false)
    const [mode, setMode] = useState("text") // "text" or "voice"
    const [sessionScores, setSessionScores] = useState([])
    const [sessionComplete, setSessionComplete] = useState(false)

    const speech = useSpeech()
    const currentQuestion = questions[currentIndex]

    // When switching to voice mode, sync transcript -> userAnswer
    useEffect(() => {
        if (mode === "voice" && speech.transcript) {
            setUserAnswer(speech.transcript)
        }
    }, [speech.transcript, mode])

    const handleSubmitAnswer = useCallback(async () => {
        if (!userAnswer.trim() || !currentQuestion) return

        setEvaluating(true)
        setEvaluation(null)

        try {
            const result = await evaluateAnswerApi({
                question: currentQuestion.question,
                userAnswer: userAnswer.trim(),
                questionType: currentQuestion.type || "technical"
            })
            setEvaluation(result.evaluation)
            setSessionScores(prev => [...prev, {
                question: currentQuestion.question,
                score: result.evaluation.score,
                index: currentIndex
            }])
        } catch (error) {
            console.error("Evaluation failed:", error)
            setEvaluation({
                score: 0,
                overallFeedback: "Unable to evaluate your answer. Please try again.",
                strengths: [],
                improvements: [],
                modelAnswer: ""
            })
        } finally {
            setEvaluating(false)
        }
    }, [userAnswer, currentQuestion, currentIndex])

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setUserAnswer("")
            setEvaluation(null)
            speech.resetTranscript()
        } else {
            setSessionComplete(true)
        }
    }

    const handleStartVoice = () => {
        setMode("voice")
        setUserAnswer("")
        speech.resetTranscript()
        speech.startListening()
    }

    const handleStopVoice = () => {
        speech.stopListening()
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "#10b981"
        if (score >= 60) return "#f59e0b"
        return "#ef4444"
    }

    const averageScore = sessionScores.length > 0
        ? Math.round(sessionScores.reduce((sum, s) => sum + s.score, 0) / sessionScores.length)
        : 0

    if (!questions.length) {
        return (
            <div className="mock-session-empty">
                <div className="empty-icon"></div>
                <h3>No Questions Available</h3>
                <p>Generate an interview report first to practice with AI-tailored questions.</p>
            </div>
        )
    }

    if (sessionComplete) {
        return (
            <div className="mock-session-complete">
                <div className="complete-header">
                    <div className="complete-icon"></div>
                    <h2>Session Complete!</h2>
                    <p>You've practiced all {questions.length} questions for <strong>{reportTitle}</strong></p>
                </div>

                <div className="final-score-ring">
                    <svg viewBox="0 0 120 120" className="score-svg">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#1b2046" strokeWidth="8" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor(averageScore)}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(averageScore / 100) * 327} 327`}
                            transform="rotate(-90 60 60)" />
                        <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{averageScore}</text>
                        <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">AVG SCORE</text>
                    </svg>
                </div>

                <div className="score-breakdown">
                    {sessionScores.map((s, i) => (
                        <div key={i} className="score-row">
                            <span className="score-q-label">Q{s.index + 1}</span>
                            <div className="score-bar-track">
                                <div className="score-bar-fill" style={{ width: `${s.score}%`, background: getScoreColor(s.score) }} />
                            </div>
                            <span className="score-value" style={{ color: getScoreColor(s.score) }}>{s.score}</span>
                        </div>
                    ))}
                </div>

                <button className="restart-btn" onClick={() => {
                    setCurrentIndex(0)
                    setUserAnswer("")
                    setEvaluation(null)
                    setSessionScores([])
                    setSessionComplete(false)
                    speech.resetTranscript()
                }}>
                    🔄 Restart Session
                </button>
            </div>
        )
    }

    return (
        <div className="mock-session">
            {/* Progress bar */}
            <div className="session-progress">
                <div className="progress-info">
                    <span className="progress-label">Question {currentIndex + 1} of {questions.length}</span>
                    <span className="progress-score">Session Avg: {averageScore || "—"}</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((currentIndex + (evaluation ? 1 : 0)) / questions.length) * 100}%` }} />
                </div>
            </div>

            {/* Question Card */}
            <div className="session-question-card">
                <div className="question-type-badge">
                    {currentQuestion.type === "behavioral" ? " Behavioral" : " Technical"}
                </div>
                <h3 className="session-question-text">{currentQuestion.question}</h3>
                {currentQuestion.intention && (
                    <p className="question-intent">
                        <strong>Interviewer's Intent:</strong> {currentQuestion.intention}
                    </p>
                )}
            </div>

            {/* Answer Area */}
            <div className="answer-area">
                <div className="answer-mode-toggle">
                    <button className={`mode-btn ${mode === "text" ? "active" : ""}`} onClick={() => setMode("text")}>
                         Type Answer
                    </button>
                    <button
                        className={`mode-btn ${mode === "voice" ? "active" : ""}`}
                        onClick={() => setMode("voice")}
                        disabled={!speech.supported}
                        title={!speech.supported ? "Voice not supported in this browser" : ""}
                    >
                     Voice Answer
                    </button>
                </div>

                {mode === "text" ? (
                    <textarea
                        className="answer-textarea"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here... Practice structuring your response clearly."
                        rows={6}
                        disabled={evaluating || !!evaluation}
                    />
                ) : (
                    <div className="voice-answer-area">
                        <div className={`voice-visualizer ${speech.isListening ? "active" : ""}`}>
                            <div className="pulse-ring" />
                            <div className="mic-icon">{speech.isListening ? "🔴" : "🎤"}</div>
                        </div>

                        {speech.isListening ? (
                            <button className="voice-control-btn stop" onClick={handleStopVoice}>
                                ⏹ Stop Recording
                            </button>
                        ) : (
                            <button className="voice-control-btn start" onClick={handleStartVoice} disabled={evaluating || !!evaluation}>
                                🎤 Start Speaking
                            </button>
                        )}

                        <div className="transcript-preview">
                            {userAnswer && <p className="final-transcript">{userAnswer}</p>}
                            {speech.interimTranscript && <p className="interim-transcript">{speech.interimTranscript}</p>}
                            {!userAnswer && !speech.interimTranscript && !speech.isListening && (
                                <p className="transcript-placeholder">Your spoken answer will appear here...</p>
                            )}
                        </div>

                        {speech.error && <p className="speech-error">{speech.error}</p>}
                    </div>
                )}

                {!evaluation && (
                    <button
                        className="submit-answer-btn"
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim() || evaluating}
                    >
                        {evaluating ? (
                            <><span className="btn-spinner" /> Evaluating...</>
                        ) : (
                            " Submit for AI Evaluation"
                        )}
                    </button>
                )}
            </div>

            {/* Evaluation Results */}
            {evaluation && (
                <div className="evaluation-results">
                    <div className="eval-header">
                        <h3>AI Evaluation</h3>
                        <div className="eval-score" style={{ color: getScoreColor(evaluation.score) }}>
                            {evaluation.score}<span className="score-max">/100</span>
                        </div>
                    </div>

                    <p className="eval-feedback">{evaluation.overallFeedback}</p>

                    {evaluation.strengths?.length > 0 && (
                        <div className="eval-section strengths">
                            <h4> Strengths</h4>
                            <ul>
                                {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}

                    {evaluation.improvements?.length > 0 && (
                        <div className="eval-section improvements">
                            <h4> Areas to Improve</h4>
                            <ul>
                                {evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}

                    {evaluation.modelAnswer && (
                        <div className="eval-section model-answer">
                            <h4> Model Answer</h4>
                            <p>{evaluation.modelAnswer}</p>
                        </div>
                    )}

                    <button className="next-question-btn" onClick={handleNextQuestion}>
                        {currentIndex < questions.length - 1 ? "Next Question →" : " Complete Session"}
                    </button>
                </div>
            )}
        </div>
    )
}
