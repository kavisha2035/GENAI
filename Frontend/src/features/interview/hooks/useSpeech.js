import { useState, useRef, useCallback, useEffect } from "react"

/**
 * @description Custom hook for Web Speech API — handles speech recognition (STT) 
 * and speech synthesis (TTS) for the voice interview feature.
 */
export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const [supported, setSupported] = useState(true)
    const [error, setError] = useState(null)

    const recognitionRef = useRef(null)
    const synthRef = useRef(window.speechSynthesis)

    // Initialize SpeechRecognition on mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSupported(false)
            setError("Speech Recognition is not supported in this browser.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event) => {
            let interim = ""
            let final = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    final += result[0].transcript + " "
                } else {
                    interim += result[0].transcript
                }
            }
            if (final) {
                setTranscript(prev => (prev + final).trim())
            }
            setInterimTranscript(interim)
        }

        recognition.onerror = (event) => {
            console.error("[useSpeech] Recognition error:", event.error)
            if (event.error === "not-allowed") {
                setError("Microphone access denied. Please allow microphone permissions.")
            } else if (event.error !== "aborted") {
                setError(`Speech recognition error: ${event.error}`)
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            setInterimTranscript("")
        }

        recognitionRef.current = recognition

        return () => {
            recognition.abort()
            synthRef.current?.cancel()
        }
    }, [])

    /**
     * Start listening for speech input.
     */
    const startListening = useCallback(() => {
        if (!recognitionRef.current) return
        setError(null)
        setTranscript("")
        setInterimTranscript("")
        try {
            recognitionRef.current.start()
            setIsListening(true)
        } catch (err) {
            // Already started — restart
            recognitionRef.current.stop()
            setTimeout(() => {
                try {
                    recognitionRef.current.start()
                    setIsListening(true)
                } catch (e) {
                    setError("Failed to start speech recognition.")
                }
            }, 200)
        }
    }, [])

    /**
     * Stop listening and finalize transcript.
     */
    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        recognitionRef.current.stop()
        setIsListening(false)
        setInterimTranscript("")
    }, [])

    /**
     * Speak text using SpeechSynthesis (TTS).
     * @param {string} text - The text to speak aloud.
     * @returns {Promise<void>}
     */
    const speak = useCallback((text) => {
        return new Promise((resolve) => {
            if (!synthRef.current || !text) {
                resolve()
                return
            }
            // Cancel any ongoing speech
            synthRef.current.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.0
            utterance.pitch = 1.0
            utterance.volume = 1.0
            utterance.lang = "en-US"

            // Try to pick a good English voice
            const voices = synthRef.current.getVoices()
            const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                                 voices.find(v => v.lang.startsWith("en-US")) ||
                                 voices.find(v => v.lang.startsWith("en"))
            if (englishVoice) {
                utterance.voice = englishVoice
            }

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => {
                setIsSpeaking(false)
                resolve()
            }
            utterance.onerror = () => {
                setIsSpeaking(false)
                resolve()
            }

            synthRef.current.speak(utterance)
        })
    }, [])

    /**
     * Stop any ongoing speech synthesis.
     */
    const stopSpeaking = useCallback(() => {
        synthRef.current?.cancel()
        setIsSpeaking(false)
    }, [])

    /**
     * Reset the transcript to empty.
     */
    const resetTranscript = useCallback(() => {
        setTranscript("")
        setInterimTranscript("")
    }, [])

    return {
        // State
        isListening,
        isSpeaking,
        transcript,
        interimTranscript,
        supported,
        error,
        // Actions
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        resetTranscript
    }
}
