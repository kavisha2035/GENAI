const { GoogleGenAI } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = {
    type: "OBJECT",
    properties: {
        matchScore: {
            type: "INTEGER",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job"
        },
        title: {
            type: "STRING",
            description: "The title of the job for which the interview report is generated"
        },
        technicalQuestions: {
            type: "ARRAY",
            description: "3-5 technical questions with intentions and answers",
            items: {
                type: "OBJECT",
                properties: {
                    intention: {
                        type: "STRING",
                        description: "The intention of interviewer behind asking this question"
                    },
                    question: {
                        type: "STRING",
                        description: "The technical question that can be asked in the interview"
                    },
                    answer: {
                        type: "STRING",
                        description: "How to answer this question, what points to cover, what approach to take"
                    }
                },
                required: ["intention", "question", "answer"]
            }
        },
        behavioralQuestions: {
            type: "ARRAY",
            description: "3-5 behavioral questions with intentions and answers",
            items: {
                type: "OBJECT",
                properties: {
                    intention: {
                        type: "STRING",
                        description: "The intention of interviewer behind asking this question"
                    },
                    question: {
                        type: "STRING",
                        description: "The behavioral question that can be asked in the interview"
                    },
                    answer: {
                        type: "STRING",
                        description: "How to answer this question, specific examples and approach"
                    }
                },
                required: ["intention", "question", "answer"]
            }
        },
        questionsToAsk: {
            type: "ARRAY",
            description: "3-5 smart questions the candidate can ask the interviewer",
            items: {
                type: "OBJECT",
                properties: {
                    question: {
                        type: "STRING",
                        description: "A smart question the candidate can ask the interviewer at the end of the interview"
                    },
                    intention: {
                        type: "STRING",
                        description: "Why it is a good idea to ask this specific question, and what positive trait it demonstrates"
                    }
                },
                required: ["question", "intention"]
            }
        },
        skillGaps: {
            type: "ARRAY",
            description: "List of skill gaps with severity levels",
            items: {
                type: "OBJECT",
                properties: {
                    skill: {
                        type: "STRING",
                        description: "The skill which the candidate is lacking"
                    },
                    severity: {
                        type: "STRING",
                        enum: ["low", "medium", "high"],
                        description: "How important this skill gap is for the role"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "ARRAY",
            description: "7-day preparation plan with daily focus and tasks",
            items: {
                type: "OBJECT",
                properties: {
                    day: {
                        type: "INTEGER",
                        description: "Day number (1-7)"
                    },
                    focus: {
                        type: "STRING",
                        description: "Main focus area for this day"
                    },
                    tasks: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Specific tasks to complete on this day"
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "questionsToAsk", "skillGaps", "preparationPlan"]
}

const resumePdfSchema = {
    type: "OBJECT",
    properties: {
        html: {
            type: "STRING",
            description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer"
        }
    },
    required: ["html"]
}

const coverLetterPromptSchema = {
    type: "OBJECT",
    properties: {
        content: {
            type: "STRING",
            description: "The generated cover letter text, well-structured with address, salutation, intro, body paragraphs highlighting user skills aligned to the job description, and a professional closing."
        }
    },
    required: ["content"]
}

function isApiKeyInvalidError(err) {
    const errMsg = String(err.message || "").toLowerCase();
    return errMsg.includes("api key not valid") || 
           errMsg.includes("api_key_invalid") || 
           errMsg.includes("invalid api key") ||
           err.status === "INVALID_ARGUMENT";
}

/**
 * Validates and sanitizes Gemini AI output for interview reports.
 * Fills in safe defaults for missing fields to prevent Mongoose validation errors.
 */
function validateInterviewReportOutput(data) {
    const errors = []
    
    // Validate matchScore
    if (data.matchScore === undefined || data.matchScore === null) {
        data.matchScore = 0
        errors.push("matchScore missing, defaulted to 0")
    } else if (typeof data.matchScore !== 'number' || data.matchScore < 0 || data.matchScore > 100) {
        data.matchScore = Math.max(0, Math.min(100, parseInt(data.matchScore) || 0))
        errors.push("matchScore out of range, clamped to 0-100")
    }

    // Validate title
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        data.title = "Interview Report"
        errors.push("title missing, defaulted")
    }

    // Validate arrays exist and have at least 1 item
    const arrayFields = ['technicalQuestions', 'behavioralQuestions', 'questionsToAsk', 'skillGaps', 'preparationPlan']
    arrayFields.forEach(field => {
        if (!Array.isArray(data[field]) || data[field].length === 0) {
            errors.push(`${field} missing or empty`)
        }
    })

    // Validate question objects have required fields
    const questionArrays = ['technicalQuestions', 'behavioralQuestions']
    questionArrays.forEach(field => {
        if (Array.isArray(data[field])) {
            data[field] = data[field].filter(q => q && q.question && q.answer && q.intention)
        }
    })

    if (errors.length > 0) {
        console.warn("[Schema Validation] Gemini output had issues:", errors)
    }

    return { valid: errors.length === 0, data, errors }
}

/**
 * Validates Gemini cover letter output.
 */
function validateCoverLetterOutput(content) {
    if (!content || typeof content !== 'string' || content.trim().length < 50) {
        console.warn("[Schema Validation] Cover letter content too short or missing")
        return { valid: false, content: null }
    }
    return { valid: true, content: content.trim() }
}

function getTitleFromJobDescription(jobDescription) {
    const match = jobDescription.match(/^\s*Position:\s*(.+)$/im);
    if (match && match[1]) return match[1].trim();
    const firstLine = jobDescription.trim().split(/\r?\n/)[0];
    return firstLine || "Backend Developer";
}

function getMockInterviewReport(selfDescription, jobDescription) {
    return {
        matchScore: 85,
        title: jobDescription ? getTitleFromJobDescription(jobDescription) : "Backend Developer",
        technicalQuestions: [
            {
                intention: "Assess deep understanding of Node.js event-driven architecture.",
                question: "Explain the Node.js event loop and how it handles asynchronous I/O operations.",
                answer: "The event loop is a single-threaded loop that monitors and executes tasks, delegating heavy operations to the system kernel or the Libuv thread pool. Detail phases like timers, I/O callbacks, idle/prepare, poll, check, and close callbacks."
            },
            {
                intention: "Evaluate database optimization skills under high load.",
                question: "How would you optimize a slow-performing MongoDB query in a production environment?",
                answer: "Explain using explain() to analyze query plans, creating appropriate single-field or compound indexes, avoiding tables scans, utilizing projection to retrieve only needed fields, and implementing Redis caching for frequently accessed data."
            },
            {
                intention: "Assess knowledge of authentication best practices.",
                question: "What are the security implications of using JWT for authentication, and how do you mitigate them?",
                answer: "Discuss token expiration, storing tokens securely (e.g., httpOnly cookies to prevent XSS), implementing token blacklisting for logouts, signing tokens with a strong secret/private key, and using HTTPS to prevent interception."
            }
        ],
        behavioralQuestions: [
            {
                intention: "Evaluate conflict resolution and teamwork capabilities.",
                question: "Describe a situation where you had a technical disagreement with a team member. How did you resolve it?",
                answer: "Use the STAR method. Focus on objective evaluation of pros and cons, running benchmarks or prototypes to get concrete data, maintaining professional communication, and committing to the final team decision."
            },
            {
                intention: "Assess adaptability and problem-solving under pressure.",
                question: "Tell me about a time when a critical production bug occurred. What did you do?",
                answer: "Demonstrate a systematic approach: reproducing the issue, isolating the cause, deploying a hotfix, communicating with stakeholders, and conducting a post-mortem to prevent recurrence."
            }
        ],
        questionsToAsk: [
            {
                question: "What does a successful first 90 days look like for someone in this role?",
                intention: "Shows proactive mindset and a focus on delivering measurable impact quickly."
            },
            {
                question: "How does the engineering team handle technical debt and prioritize system refactoring?",
                intention: "Demonstrates care for long-term code quality and sustainable engineering practices."
            }
        ],
        skillGaps: [
            { skill: "Redis caching implementation", severity: "low" },
            { skill: "Docker production deployment", severity: "medium" }
        ],
        preparationPlan: [
            { day: 1, focus: "Core Node.js & Event Loop", tasks: ["Review event loop phases", "Practice writing asynchronous middleware"] },
            { day: 2, focus: "MongoDB Optimization", tasks: ["Study index types and indexing strategies", "Analyze query execution plans using explain()"] },
            { day: 3, focus: "Authentication & Security", tasks: ["Review JWT best practices", "Implement httpOnly cookie storage logic"] },
            { day: 4, focus: "Redis Caching Patterns", tasks: ["Learn cache-aside and write-through patterns", "Write clean Redis wrapper services"] },
            { day: 5, focus: "Dockerizing Applications", tasks: ["Create Dockerfiles and docker-compose configurations for development"] },
            { day: 6, focus: "System Design & Scalability", tasks: ["Review horizontal scaling and load balancing principles"] },
            { day: 7, focus: "Mock Interview & Refinement", tasks: ["Perform mock interviews answering the technical questions generated here"] }
        ]
    };
}

function getMockResumeHtml(resume, selfDescription, jobDescription) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; padding: 20px; }
        h1 { color: #1a253c; margin-bottom: 5px; }
        .subtitle { color: #613bf7; font-weight: bold; margin-bottom: 20px; }
        .section-title { font-size: 1.2em; color: #1a253c; border-bottom: 2px solid #613bf7; padding-bottom: 5px; margin-top: 20px; text-transform: uppercase; }
        .experience-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; }
    </style>
</head>
<body>
    <h1>Jane Doe</h1>
    <div class="subtitle">Tailored Backend Developer (Node.js)</div>
    
    <div class="section-title">Professional Summary</div>
    <p>${selfDescription || "Highly skilled developer focusing on building robust, scalable server-side systems and RESTful APIs."}</p>
    
    <div class="section-title">Key Skills</div>
    <p>JavaScript, Node.js, Express.js, MongoDB, Redis, Docker, System Design, REST APIs</p>
    
    <div class="section-title">Professional Experience</div>
    <div class="experience-item">
        <span class="job-title">Senior Backend Developer</span> - Acme Corp (2021 - Present)
        <ul>
            <li>Designed and developed scalable RESTful APIs using Node.js and Express.</li>
            <li>Implemented authentication using JWT and secure cookies.</li>
            <li>Optimized database performance, reducing query latency by 30%.</li>
        </ul>
    </div>
    
    <div class="section-title">Education</div>
    <p>Bachelor of Technology in Computer Science, 2021</p>
</body>
</html>`;
}

function getMockCoverLetter(jobTitle, companyName, jobDescription, skills) {
    return `Dear Hiring Team at ${companyName},

I am writing to express my enthusiastic interest in the ${jobTitle} position. With my solid background in software engineering and hands-on experience developing high-performance applications, I am confident in my ability to make a meaningful contribution to your team.

My technical experience aligns well with the requirements of this role. In my previous positions, I have focused heavily on designing scalable solutions, optimizing databases, and writing clean, maintainable code. Your search for a professional who can deliver quality results matches my work ethic and expertise.

I am particularly drawn to ${companyName} because of your reputation for innovation and engineering excellence. I am excited about the opportunity to bring my skills in ${skills || "software development"} to your team.

Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications with you in more detail.

Sincerely,

[Your Name]
[Your Phone Number]
[Your Email Address]`;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `You are an expert interview preparation assistant. Generate a comprehensive interview report for a candidate.

Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}

Analyze the candidate's profile against the job requirements and provide:
1. Match score (0-100)
2. 3-5 technical questions with intentions and detailed answers
3. 3-5 behavioral questions with intentions and detailed answers
4. 3-5 smart questions the candidate can ask the interviewer at the end of the interview (questionsToAsk)
5. Skill gaps with severity levels
6. A 7-day preparation plan with daily focus and tasks
7. Job title from the job description

Ensure all arrays have at least 3 items each.`

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportSchema,
            }
        })

        const rawResponse = JSON.parse(response.text)
        const formattedResponse = transformAIResponse(rawResponse)
        
        // Validate the AI output before returning
        const validation = validateInterviewReportOutput(formattedResponse)
        if (!validation.valid) {
            console.warn("[AI Service] Report validation found issues, using sanitized data:", validation.errors)
        }
        
        return validation.data
    } catch (error) {
        console.error("GOOGLE_GENAI_API_KEY error or model issue in generateInterviewReport, falling back to mock:", error);
        return getMockInterviewReport(selfDescription, jobDescription);
    }
}

function transformAIResponse(data) {
    // Handle match_score or matchScore
    const matchScore = data.match_score !== undefined ? data.match_score : (data.matchScore || 0)

    // Handle job_title or title
    const title = data.job_title || data.title || "Interview Report"

    // Transform technical questions from flattened array to structured array
    const technicalQuestions = []
    let techQArray = data.technical_questions || data.technicalQuestions || []

    if (Array.isArray(techQArray) && techQArray.length > 0) {
        if (typeof techQArray[0] === 'object' && techQArray[0] !== null) {
            techQArray.forEach(q => {
                technicalQuestions.push({
                    intention: q.intention || "",
                    question: q.question || "",
                    answer: q.answer || ""
                })
            })
        } else {
            for (let i = 0; i < techQArray.length; i += 3) {
                if (i + 2 < techQArray.length) {
                    technicalQuestions.push({
                        intention: String(techQArray[i]),
                        question: String(techQArray[i + 1]),
                        answer: String(techQArray[i + 2])
                    })
                }
            }
        }
    }

    // Transform behavioral questions from flattened array to structured array
    const behavioralQuestions = []
    let behavQArray = data.behavioral_questions || data.behavioralQuestions || []

    if (Array.isArray(behavQArray) && behavQArray.length > 0) {
        if (typeof behavQArray[0] === 'object' && behavQArray[0] !== null) {
            behavQArray.forEach(q => {
                behavioralQuestions.push({
                    intention: q.intention || "",
                    question: q.question || "",
                    answer: q.answer || ""
                })
            })
        } else {
            for (let i = 0; i < behavQArray.length; i += 3) {
                if (i + 2 < behavQArray.length) {
                    behavioralQuestions.push({
                        intention: String(behavQArray[i]),
                        question: String(behavQArray[i + 1]),
                        answer: String(behavQArray[i + 2])
                    })
                }
            }
        }
    }

    // Transform skill gaps from flattened array to structured array
    const skillGaps = []
    let skillsArray = data.skill_gaps || data.skillGaps || []

    if (Array.isArray(skillsArray) && skillsArray.length > 0) {
        if (typeof skillsArray[0] === 'object' && skillsArray[0] !== null) {
            skillsArray.forEach(s => {
                skillGaps.push({
                    skill: s.skill || "",
                    severity: String(s.severity || "medium").toLowerCase()
                })
            })
        } else {
            for (let i = 0; i < skillsArray.length; i += 2) {
                if (i + 1 < skillsArray.length) {
                    const severityValue = String(skillsArray[i + 1]).toLowerCase()
                    if (['low', 'medium', 'high'].includes(severityValue)) {
                        skillGaps.push({
                            skill: String(skillsArray[i]),
                            severity: severityValue
                        })
                    }
                }
            }
        }
    }

    // Transform preparation plan from flattened array to structured array
    const preparationPlan = []
    let planArray = data.preparation_plan || data.preparationPlan || []

    if (Array.isArray(planArray) && planArray.length > 0) {
        if (typeof planArray[0] === 'object' && planArray[0] !== null) {
            planArray.forEach(p => {
                const tasks = Array.isArray(p.tasks) ? p.tasks : [p.tasks].filter(Boolean)
                preparationPlan.push({
                    day: parseInt(p.day) || 1,
                    focus: p.focus || "",
                    tasks: tasks
                })
            })
        } else {
            for (let i = 0; i < planArray.length; i += 3) {
                if (i + 2 < planArray.length) {
                    const dayNum = parseInt(planArray[i]) || (i / 3 + 1)
                    const focusStr = String(planArray[i + 1])
                    const tasksStr = String(planArray[i + 2])

                    // Parse tasks from string (split by period or bullet points)
                    const tasks = tasksStr
                        .split(/[.\n•-]+/)
                        .map(t => t.trim())
                        .filter(t => t.length > 0)

                    preparationPlan.push({
                        day: dayNum,
                        focus: focusStr,
                        tasks: tasks.length > 0 ? tasks : [tasksStr]
                    })
                }
            }
        }
    }

    // Transform questionsToAsk from flattened array or structured array
    const questionsToAsk = []
    let askQArray = data.questionsToAsk || data.questions_to_ask || []

    if (Array.isArray(askQArray) && askQArray.length > 0) {
        if (typeof askQArray[0] === 'object' && askQArray[0] !== null) {
            askQArray.forEach(q => {
                questionsToAsk.push({
                    question: q.question || "",
                    intention: q.intention || ""
                })
            })
        } else {
            for (let i = 0; i < askQArray.length; i += 2) {
                if (i + 1 < askQArray.length) {
                    questionsToAsk.push({
                        question: String(askQArray[i]),
                        intention: String(askQArray[i + 1])
                    })
                }
            }
        }
    }

    return {
        matchScore,
        title,
        technicalQuestions: technicalQuestions.length > 0 ? technicalQuestions : [],
        behavioralQuestions: behavioralQuestions.length > 0 ? behavioralQuestions : [],
        questionsToAsk: questionsToAsk.length > 0 ? questionsToAsk : [],
        skillGaps: skillGaps.length > 0 ? skillGaps : [],
        preparationPlan: preparationPlan.length > 0 ? preparationPlan : []
    }
}

async function generatePdfFromHtml(htmlContent, maxRetries = 2) {
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let browser = null
        try {
            browser = await puppeteer.launch({
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            })
            const page = await browser.newPage()
            await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 30000 })

            const pdfBuffer = await page.pdf({
                format: "A4",
                margin: {
                    top: "20mm",
                    bottom: "20mm",
                    left: "15mm",
                    right: "15mm"
                },
                timeout: 30000
            })

            return pdfBuffer
        } catch (error) {
            lastError = error
            console.error(`[Puppeteer] Attempt ${attempt}/${maxRetries} failed:`, error.message)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
            }
        } finally {
            if (browser) {
                try { await browser.close() } catch (e) { /* prevent zombie processes */ }
            }
        }
    }

    console.error("[Puppeteer] All retry attempts exhausted. Returning error buffer.")
    throw lastError
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `Generate resume for a candidate with the following details:
                            Resume: ${resume}
                            Self Description: ${selfDescription}
                            Job Description: ${jobDescription}

                            the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                            The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                            The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                            you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                            The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                            The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                        `

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumePdfSchema,
            }
        })

        const jsonContent = JSON.parse(response.text)
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
        return { pdfBuffer, html: jsonContent.html }
    } catch (error) {
        console.error("GOOGLE_GENAI_API_KEY error or model issue in generateResumePdf, falling back to mock:", error);
        const mockHtml = getMockResumeHtml(resume, selfDescription, jobDescription);
        const pdfBuffer = await generatePdfFromHtml(mockHtml);
        return { pdfBuffer, html: mockHtml };
    }
}

async function generateCoverLetter({ jobTitle, companyName, jobDescription, skills }) {
    try {
        const prompt = `You are an expert professional cover letter writer. Generate a tailored, high-converting cover letter based on the following details:
                         Target Job Title: ${jobTitle}
                         Company Name: ${companyName}
                         Target Job Description: ${jobDescription || "Not provided"}
                         Candidate's Key Skills / Experience: ${skills || "Not provided"}

                         Instructions:
                         1. Write a professional, polished cover letter that highlights how the candidate's skills align perfectly with the target job requirements.
                         2. Use a standard professional format with placeholders for candidate's address, phone number, and date.
                         3. Ensure the tone is confident, professional, and engaging. Avoid generic cliches.
                         4. Ideal length should be around 300-400 words (3-4 paragraphs).
                         `

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: coverLetterPromptSchema,
            }
        })

        const jsonContent = JSON.parse(response.text)
        return jsonContent.content
    } catch (error) {
        console.error("GOOGLE_GENAI_API_KEY error or model issue in generateCoverLetter, falling back to mock:", error);
        return getMockCoverLetter(jobTitle, companyName, jobDescription, skills);
    }
}

// =====================================================
// ANSWER EVALUATION (Mock Session)
// =====================================================

const answerEvaluationSchema = {
    type: "OBJECT",
    properties: {
        score: {
            type: "INTEGER",
            description: "Score from 0 to 100 evaluating the quality of the answer"
        },
        strengths: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of strong points in the candidate's answer"
        },
        improvements: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of areas where the answer could be improved"
        },
        modelAnswer: {
            type: "STRING",
            description: "An ideal, concise model answer for comparison"
        },
        overallFeedback: {
            type: "STRING",
            description: "A brief overall assessment of the answer quality"
        }
    },
    required: ["score", "strengths", "improvements", "modelAnswer", "overallFeedback"]
}

const skillRoadmapSchema = {
    type: "OBJECT",
    properties: {
        roadmap: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    skill: { type: "STRING", description: "Skill name" },
                    currentLevel: { type: "STRING", description: "Estimated current level: beginner, intermediate, advanced" },
                    targetLevel: { type: "STRING", description: "Required level for the job" },
                    resources: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Recommended resources or actions to improve"
                    },
                    estimatedWeeks: { type: "INTEGER", description: "Estimated weeks to reach target level" },
                    priority: { type: "STRING", description: "Priority: high, medium, low" }
                },
                required: ["skill", "currentLevel", "targetLevel", "resources", "estimatedWeeks", "priority"]
            }
        }
    },
    required: ["roadmap"]
}

function getMockEvaluation(question, userAnswer) {
    return {
        score: 65,
        strengths: [
            "Shows basic understanding of the concept",
            "Answer is structured and clear"
        ],
        improvements: [
            "Could provide more specific examples",
            "Consider mentioning edge cases and trade-offs",
            "Include real-world scenarios from past experience"
        ],
        modelAnswer: `For the question "${question.substring(0, 60)}...", a strong answer would cover the core concept with specific examples, mention trade-offs, and relate it to practical experience. Structure your response using the STAR method for behavioral questions or a systematic approach for technical ones.`,
        overallFeedback: "Good foundational answer. Adding concrete examples and discussing edge cases would elevate this to an excellent response."
    }
}

function getMockRoadmap() {
    return {
        roadmap: [
            {
                skill: "System Design",
                currentLevel: "beginner",
                targetLevel: "intermediate",
                resources: ["Read 'Designing Data-Intensive Applications'", "Practice on system design primers"],
                estimatedWeeks: 6,
                priority: "high"
            },
            {
                skill: "Data Structures & Algorithms",
                currentLevel: "intermediate",
                targetLevel: "advanced",
                resources: ["LeetCode medium/hard problems daily", "Review common patterns (sliding window, two pointers)"],
                estimatedWeeks: 8,
                priority: "high"
            },
            {
                skill: "Cloud Services (AWS/GCP)",
                currentLevel: "beginner",
                targetLevel: "intermediate",
                resources: ["Complete AWS Cloud Practitioner certification", "Build a project using cloud services"],
                estimatedWeeks: 4,
                priority: "medium"
            }
        ]
    }
}

async function evaluateAnswer({ question, userAnswer, questionType }) {
    try {
        const prompt = `You are an expert interview coach. Evaluate the following interview answer.

Question Type: ${questionType}
Question: ${question}
Candidate's Answer: ${userAnswer}

Provide a detailed evaluation with:
1. A score from 0-100
2. Specific strengths of the answer
3. Specific areas for improvement
4. A model answer for comparison
5. Brief overall feedback

Be constructive and encouraging while being honest about areas for improvement.`

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: answerEvaluationSchema,
            }
        })

        const parsed = JSON.parse(response.text)
        // Clamp score
        parsed.score = Math.max(0, Math.min(100, parseInt(parsed.score) || 0))
        return parsed
    } catch (error) {
        console.error("[AI Service] evaluateAnswer error, falling back to mock:", error)
        return getMockEvaluation(question, userAnswer)
    }
}

async function generateContentStream(prompt) {
    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-3-flash-preview",
            contents: prompt,
        })
        return response
    } catch (error) {
        console.error("[AI Service] generateContentStream error:", error)
        // Return an async iterable that yields an error message
        async function* errorStream() {
            yield { text: "I'm sorry, I'm unable to generate a response right now. Please try again later." }
        }
        return errorStream()
    }
}

async function generateSkillRoadmap({ skillGaps, jobDescription, resume }) {
    try {
        const prompt = `You are a career development expert. Based on the candidate's skill gaps and their target role, generate a personalized skill development roadmap.

Skill Gaps: ${JSON.stringify(skillGaps)}
Target Job Description: ${jobDescription || "Not provided"}
Current Resume/Skills: ${resume || "Not provided"}

For each skill gap, provide:
1. Current estimated level (beginner/intermediate/advanced)
2. Required level for the target role
3. Specific learning resources and actions
4. Estimated weeks to reach the target level
5. Priority (high/medium/low)

Order by priority (highest first).`

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: skillRoadmapSchema,
            }
        })

        return JSON.parse(response.text)
    } catch (error) {
        console.error("[AI Service] generateSkillRoadmap error, falling back to mock:", error)
        return getMockRoadmap()
    }
}

const codingQuestionsSchema = {
    type: "OBJECT",
    properties: {
        questions: {
            type: "ARRAY",
            description: "Exactly 6 DSA questions (2 easy, 3 medium, 1 hard)",
            items: {
                type: "OBJECT",
                properties: {
                    id: { type: "STRING" },
                    title: { type: "STRING" },
                    difficulty: { type: "STRING" },
                    topic: { type: "STRING" },
                    description: { type: "STRING" },
                    examples: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                input: { type: "STRING" },
                                output: { type: "STRING" },
                                explanation: { type: "STRING" }
                            },
                            required: ["input", "output"]
                        }
                    },
                    constraints: { type: "ARRAY", items: { type: "STRING" } },
                    hints: { type: "ARRAY", items: { type: "STRING" } },
                    approach: { type: "STRING" },
                    timeComplexity: { type: "STRING" },
                    spaceComplexity: { type: "STRING" }
                },
                required: ["id", "title", "difficulty", "topic", "description", "examples", "constraints", "hints", "approach", "timeComplexity", "spaceComplexity"]
            }
        }
    },
    required: ["questions"]
}

function getMockCodingQuestions(report) {
    const title = (report?.title || "").toLowerCase();
    const isFrontend = title.includes("front") || title.includes("ui") || title.includes("react") || title.includes("javascript");
    
    if (isFrontend) {
        return [
            {
                id: "fe-1",
                title: "Array Flattening",
                difficulty: "easy",
                topic: "Recursion & Arrays",
                description: "Write a function that flattens a nested array up to a specified depth. If no depth is specified, default to 1 level of flattening.",
                examples: [
                    { input: "flat([1, [2, [3]]], 1)", output: "[1, 2, [3]]", explanation: "Only one level is flattened." },
                    { input: "flat([1, [2, [3]]], 2)", output: "[1, 2, 3]", explanation: "Two levels are flattened." }
                ],
                constraints: [
                    "0 <= array length <= 1000",
                    "0 <= nesting depth <= 10",
                    "0 <= specified depth <= 10"
                ],
                hints: [
                    "Use recursion to iterate through the array elements.",
                    "Check if an element is an array using Array.isArray().",
                    "If it is an array and depth > 0, recursively flatten it and decrement the depth."
                ],
                approach: "Iterate through the array. If the item is an array and we haven't reached depth limit, recursively call the flatten function and concatenate results. Otherwise, push the item to the output array.",
                timeComplexity: "O(N)",
                spaceComplexity: "O(D) where D is the maximum nesting depth (for the call stack)."
            },
            {
                id: "fe-2",
                title: "Debounce Function",
                difficulty: "easy",
                topic: "Closures & Timing",
                description: "Implement a debounce function that delays invoking a callback function until after wait milliseconds have elapsed since the last time the debounced function was invoked.",
                examples: [
                    { input: "debounce(fn, 100)", output: "Function wrapper that limits execution rate.", explanation: "Useful for search inputs to prevent API spam." }
                ],
                constraints: [
                    "wait >= 0 milliseconds",
                    "callback must be a function"
                ],
                hints: [
                    "Use closures to keep track of a timer variable between calls.",
                    "clearTimeout(timer) should be called whenever the wrapper is invoked.",
                    "Set a new timer using setTimeout to execute the callback with arguments."
                ],
                approach: "Return a closure wrapper that resets a timer on each invocation. Once the specified duration passes without another invocation, trigger the original function using `.apply(this, args)`.",
                timeComplexity: "O(1)",
                spaceComplexity: "O(1)"
            },
            {
                id: "fe-3",
                title: "DOM Tree Breadth-First Search",
                difficulty: "medium",
                topic: "Trees & BFS",
                description: "Given the root of a HTML DOM tree, perform a breadth-first search and return an array of all tag names in order of visitation.",
                examples: [
                    { input: "bfs(document.body)", output: "['BODY', 'DIV', 'SPAN', 'P']", explanation: "Visits all children level-by-level." }
                ],
                constraints: [
                    "The input is a valid DOM element.",
                    "Number of nodes in DOM tree <= 5000"
                ],
                hints: [
                    "Use a queue to process DOM nodes level by level.",
                    "Start by pushing the root node onto the queue.",
                    "While the queue is not empty, shift a node, record its tag name, and push all its children nodes to the queue."
                ],
                approach: "Use a FIFO queue to implement standard BFS. For each node shifted, push its immediate children into the queue, processing from top to bottom.",
                timeComplexity: "O(N) where N is the number of nodes.",
                spaceComplexity: "O(W) where W is the maximum width of the tree."
            },
            {
                id: "fe-4",
                title: "CSS Selector Query Engine",
                difficulty: "medium",
                topic: "Strings & DOM Parsing",
                description: "Implement a simplified querySelector that supports tags, classes, and ID selectors, returning matched elements in document order.",
                examples: [
                    { input: "find('div.container')", output: "Array of matched DOM nodes", explanation: "Matches all div tags having the class 'container'." }
                ],
                constraints: [
                    "Support single level selectors (no descendants like 'div p')",
                    "Standard document DOM is searched"
                ],
                hints: [
                    "Parse the selector string to extract tag, class, or id components.",
                    "Traverse the DOM tree and check if each element matches the parsed rules.",
                    "Return matched elements in order of traversal."
                ],
                approach: "Traverse the DOM using DFS. For each element, check if it meets the selector constraints. Match tag via `.tagName`, ID via `.id`, and classes via `.classList.contains`.",
                timeComplexity: "O(N) where N is total DOM nodes.",
                spaceComplexity: "O(H) recursion stack height."
            },
            {
                id: "fe-5",
                title: "Custom Event Emitter",
                difficulty: "medium",
                topic: "Design Patterns & Objects",
                description: "Create an EventEmitter class that allows registering subscribers to named events, firing events with arguments, and unsubscribing from events.",
                examples: [
                    { input: "const em = new EventEmitter(); const sub = em.subscribe('click', callback); em.emit('click', 'args'); sub.unsubscribe();", output: "Subscribed callback triggers, then unsubscribes.", explanation: "Implements publisher-subscriber pattern." }
                ],
                constraints: [
                    "An event can have multiple subscribers.",
                    "Unsubscribing must not affect other subscribers."
                ],
                hints: [
                    "Use a Map to store event names as keys and an array/set of callback functions as values.",
                    "The subscribe method should return an object containing an unsubscribe method.",
                    "The emit method iterates through all registered callbacks and invokes them with arguments."
                ],
                approach: "Create a Map to hold event arrays. Subscribe pushes the callback to the corresponding array and returns an object that splices the callback on unsubscribe. Emit loops through the event array and runs each callback.",
                timeComplexity: "O(1) subscribe, O(S) emit where S is subscribers.",
                spaceComplexity: "O(E * S) overall space."
            },
            {
                id: "fe-6",
                title: "Valid HTML Tags Parser",
                difficulty: "hard",
                topic: "Stacks & String Parsing",
                description: "Given a string containing HTML markup, determine if all opening tags are closed properly, in correct nested order.",
                examples: [
                    { input: "isValid('<div><p>Hello</p></div>')", output: "true", explanation: "Tags are correctly nested." },
                    { input: "isValid('<div><p>Hello</div></p>')", output: "false", explanation: "Overlapping tags are invalid." }
                ],
                constraints: [
                    "String contains only standard HTML text",
                    "Ignore self-closing tags like <img> or <br>"
                ],
                hints: [
                    "Use a stack to keep track of open HTML tags.",
                    "Extract tags using regular expressions or manual index parsing.",
                    "Push opening tags onto the stack, and when encountering a closing tag, pop the stack and verify that the tags match."
                ],
                approach: "Scan the string. Identify HTML tags. When an opening tag is encountered, push it to a stack. When a closing tag is found, verify it matches the popped tag from the stack. If mismatched or stack is empty, return false. Return true if stack is empty at the end.",
                timeComplexity: "O(L) where L is string length.",
                spaceComplexity: "O(T) where T is maximum nested tags."
            }
        ];
    }

    // Default backend / DSA questions
    return [
        {
            id: "dsa-1",
            title: "Two Sum",
            difficulty: "easy",
            topic: "Hash Maps & Arrays",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            examples: [
                { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
            ],
            constraints: [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9"
            ],
            hints: [
                "A brute force approach would search all pairs, taking O(N^2) time.",
                "Can we check if the complement (target - nums[i]) exists in the array?",
                "Use a hash map to map values to their indices, allowing O(1) lookups."
            ],
            approach: "Iterate through the array. For each element, compute its complement. If the complement exists in our hash map, return its index and the current index. Otherwise, add the current element and its index to the hash map.",
            timeComplexity: "O(N) where N is array size.",
            spaceComplexity: "O(N) to store elements in the hash map."
        },
        {
            id: "dsa-2",
            title: "Valid Parentheses",
            difficulty: "easy",
            topic: "Stacks & Strings",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            examples: [
                { input: "s = '()[]{}'", output: "true", explanation: "All parentheses match correctly." },
                { input: "s = '(]'", output: "false", explanation: "Parentheses do not match." }
            ],
            constraints: [
                "1 <= s.length <= 10^4",
                "s consists of parentheses characters only"
            ],
            hints: [
                "Use a stack structure to process characters.",
                "Whenever an opening bracket is seen, push it onto the stack.",
                "When a closing bracket is seen, pop from the stack and verify if they match. If not, the string is invalid."
            ],
            approach: "Loop through characters. Push opening brackets to stack. For closing brackets, check if stack is empty or the popped element matches the expected opening bracket. Verify stack is empty at the end.",
            timeComplexity: "O(N) where N is string length.",
            spaceComplexity: "O(N) stack storage in worst case."
        },
        {
            id: "dsa-3",
            title: "Longest Substring Without Repeating Characters",
            difficulty: "medium",
            topic: "Sliding Window & Strings",
            description: "Given a string s, find the length of the longest substring without repeating characters.",
            examples: [
                { input: "s = 'abcabcbb'", output: "3", explanation: "The answer is 'abc', with the length of 3." }
            ],
            constraints: [
                "0 <= s.length <= 5 * 10^4",
                "s consists of English letters, digits, symbols and spaces"
            ],
            hints: [
                "Use the sliding window technique to keep track of a valid substring window.",
                "Use a set or hash map to store characters in the current window and check for duplicates.",
                "When a duplicate character is encountered, shrink the window from the left until the duplicate is removed."
            ],
            approach: "Maintain a sliding window with left and right pointers. Add characters to a set. If a duplicate is found, remove characters from the left and advance left pointer until duplicate is removed. Track the maximum width.",
            timeComplexity: "O(N) where N is string length.",
            spaceComplexity: "O(K) where K is size of the character set."
        },
        {
            id: "dsa-4",
            title: "Merge Intervals",
            difficulty: "medium",
            topic: "Arrays & Sorting",
            description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
            examples: [
                { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." }
            ],
            constraints: [
                "1 <= intervals.length <= 10^4",
                "intervals[i].length == 2",
                "0 <= start_i <= end_i <= 10^4"
            ],
            hints: [
                "Sort the intervals by their start times first.",
                "After sorting, overlapping intervals will be adjacent in the array.",
                "Iterate through, checking if the current interval starts before the previous one ends."
            ],
            approach: "Sort intervals by start value. Initialize a merged array with the first interval. For each subsequent interval, if its start value is <= the end value of the last merged interval, update the end of the last merged interval. Otherwise, push it as a new interval.",
            timeComplexity: "O(N log N) due to sorting.",
            spaceComplexity: "O(N) or O(log N) for sorting implementation."
        },
        {
            id: "dsa-5",
            title: "LRU Cache",
            difficulty: "medium",
            topic: "Design & Linked Lists",
            description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache, supporting get and put operations in O(1) time complexity.",
            examples: [
                { input: "LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); cache.get(2);", output: "Returns 1, evicts key 2, returns -1 (not found) for key 2.", explanation: "Correct LRU eviction pattern." }
            ],
            constraints: [
                "1 <= capacity <= 3000",
                "0 <= key <= 10^4",
                "0 <= value <= 10^5",
                "At most 2 * 10^5 calls will be made to get and put"
            ],
            hints: [
                "To achieve O(1) for get and put, we need a hash map for fast key lookup.",
                "To maintain the order of insertion/usage in O(1), use a doubly linked list.",
                "Move accessed nodes to the head, and evict from the tail on capacity overflow."
            ],
            approach: "Combine a HashMap mapping keys to Node references and a Doubly Linked List keeping track of access order. Accessing a key moves its node to the front. Inserting a new key adds it to the front, and evicts from the tail if capacity is exceeded.",
            timeComplexity: "O(1) average for both get and put operations.",
            spaceComplexity: "O(C) where C is cache capacity."
        },
        {
            id: "dsa-6",
            title: "Binary Tree Maximum Path Sum",
            difficulty: "hard",
            topic: "Trees & Recursion",
            description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Find the maximum path sum of any non-empty path.",
            examples: [
                { input: "root = [1,2,3]", output: "6", explanation: "The path is 2 -> 1 -> 3 with sum 2 + 1 + 3 = 6." }
            ],
            constraints: [
                "Number of nodes in tree <= 3 * 10^4",
                "-1000 <= Node.val <= 1000"
            ],
            hints: [
                "Use a post-order traversal to calculate max path sums bottom-up.",
                "For each node, compute the max single-path sum extending into its left and right subtrees.",
                "The maximum path sum involving the current node as the root of the path is node.val + leftMax + rightMax. Keep track of the global maximum sum."
            ],
            approach: "Implement recursive post-order traversal. For each node, find max paths starting from its left and right children (ignoring negative paths). Update a global max variable with leftPath + rightPath + node.val. Return node.val + max(leftPath, rightPath) to parent.",
            timeComplexity: "O(N) visiting each node once.",
            spaceComplexity: "O(H) recursion stack height."
        }
    ];
}

async function generateCodingQuestions(report) {
    try {
        const prompt = `You are a technical interviewer at a product-based company.

Job title: ${report.title}
Job description: ${report.jobDescription || "Not provided"}
Candidate skill gaps: ${(report.skillGaps || []).map(s => s.skill).join(', ')}

Generate exactly 6 DSA coding questions that would realistically appear in the coding round for this specific role.
Distribution:
- 2 easy (warm-up, arrays/strings/hashmaps)
- 3 medium (the core interview round difficulty)
- 1 hard (stretch question)

Requirements:
- Questions must be DIRECTLY relevant to the job description and tech stack
- For each question provide exactly 3 progressive hints (hint 1 = nudge, hint 2 = approach direction, hint 3 = near-solution guidance)
- Examples must have realistic input/output pairs
- Approach should describe the optimal algorithm in 2-3 sentences
- Time and space complexity in Big-O notation

Return JSON matching the schema exactly.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: codingQuestionsSchema,
            }
        });

        const parsed = JSON.parse(response.text);

        if (!parsed.questions || parsed.questions.length < 3) {
            throw new Error('Insufficient questions generated');
        }

        parsed.questions.forEach(q => {
            if (q.difficulty) {
                q.difficulty = q.difficulty.toLowerCase();
            }
        });

        return parsed.questions;
    } catch (error) {
        console.error("GOOGLE_GENAI_API_KEY error or model issue in generateCodingQuestions, falling back to mock:", error);
        return getMockCodingQuestions(report);
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generatePdfFromHtml,
    generateCoverLetter,
    evaluateAnswer,
    generateContentStream,
    generateSkillRoadmap,
    generateCodingQuestions
}