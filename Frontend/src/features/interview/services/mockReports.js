export const mockReports = {
    "Front End Developer": {
        _id: "mock-fe-dev-123",
        title: "Front End Developer",
        matchScore: 92,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: "Can you explain the difference between useMemo and useCallback in React, and when you would use each?",
                intention: "Evaluate the candidate's understanding of React performance optimization hooks and rendering behavior.",
                answer: "useMemo memoizes the computed value of a function, recalculating it only when dependencies change. useCallback memoizes the function definition itself to prevent recreation on every render, which is useful when passing callbacks to memoized child components."
            },
            {
                question: "How would you optimize the Core Web Vitals (LCP, FID, CLS) of a heavy React web application?",
                intention: "Assess knowledge of web performance metrics, bundle optimization, and user experience engineering.",
                answer: "I would use dynamic imports (React.lazy) for route-level code splitting, optimize image loading with modern formats (WebP/AVIF) and proper dimensions, utilize critical CSS inline, defer non-essential scripts, and ensure interactive elements have reserved layouts to prevent content shifts."
            },
            {
                question: "What is the difference between CSS Grid and Flexbox, and when is it appropriate to use each?",
                intention: "Verify CSS layout capabilities and design implementation decisions.",
                answer: "Flexbox is one-dimensional, designed for aligning content in either a row or a column. CSS Grid is two-dimensional, designed for controlling layouts in both rows and columns simultaneously. I use Flexbox for component-level alignment and Grid for page-level structural templates."
            },
            {
                question: "What are the advantages and trade-offs of using Server-Side Rendering (SSR) in frameworks like Next.js compared to Client-Side Rendering (CSR)?",
                intention: "Test architectural understanding of rendering strategies and their impact on SEO and speed.",
                answer: "SSR improves initial page load speed (FCP) and SEO because search engines receive fully populated HTML. The trade-off is higher server load, slower time-to-first-byte (TTFB) due to server-side processing, and potential hydrations issues."
            },
            {
                question: "Explain the concept of closures in JavaScript and how they are utilized in custom React hooks.",
                intention: "Evaluate core JavaScript capability and its application in modern library contexts.",
                answer: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). React hooks use closures to preserve state references between renders, allowing custom hooks to access updated state variables correctly."
            }
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time you had a disagreement with a designer about implementing a specific UI feature. How did you resolve it?",
                intention: "Assess collaboration, communication, and conflict resolution skills when working cross-functionally.",
                answer: "Describe a scenario where you analyzed the design's impact on page load speed or complexity, met with the designer to present alternative solutions that achieved their visual goal, built a quick prototype, and agreed on a performant compromise."
            },
            {
                question: "Describe a situation where you had to debug a critical production bug under tight time pressure.",
                intention: "Test problem-solving, resilience, and debugging practices during high-stress situations.",
                answer: "Outline how you isolated the issue using telemetry/error logs, created a safe local replication, implemented a temporary hotfix to restore service, and followed up with a robust, code-reviewed permanent fix."
            },
            {
                question: "How do you stay up-to-date with the rapidly evolving frontend ecosystem?",
                intention: "Evaluate the candidate's passion for continuous learning and self-improvement.",
                answer: "Mention specific blogs (e.g., Smashing Magazine, Frontend Focus), newsletters, attending conferences, contributing to open source, or experimenting with new libraries in personal sandbox projects."
            }
        ],
        skillGaps: [
            { skill: "GraphQL & Apollo Client", severity: "medium" },
            { skill: "End-to-End Testing (Cypress/Playwright)", severity: "low" },
            { skill: "Web Accessibility (WCAG 2.1 compliance)", severity: "high" }
        ],
        preparationPlan: [
            { day: 1, focus: "React Performance Tuning", tasks: ["Review rendering lifecycle", "Build examples of React.memo, useMemo, and useCallback", "Analyze bundle sizes using source-map-explorer"] },
            { day: 2, focus: "CSS Layouts & Responsive Design", tasks: ["Practice complex CSS Grid layouts", "Study CSS Custom Properties and container queries", "Refactor a component for mobile-first layout"] },
            { day: 3, focus: "JavaScript Core Deep Dive", tasks: ["Review Event Loop, closures, prototypes, and hoisting", "Solve 3 coding challenges using clean JS closures", "Study async/await error handling patterns"] },
            { day: 4, focus: "Web Performance Metrics", tasks: ["Run Lighthouse audits on personal code", "Optimize images and add layout constraints to prevent CLS", "Implement lazy loading on list elements"] },
            { day: 5, focus: "Web Accessibility & Semantic HTML", tasks: ["Study WCAG standards and keyboard accessibility", "Use screen readers (NVDA/VoiceOver) on key forms", "Fix form label associations and aria-live regions"] },
            { day: 6, focus: "Mock Interview & Technical Explanations", tasks: ["Practice explaining rendering strategies aloud", "Do a peer review of a frontend coding test", "Review system design concepts for frontend caching"] },
            { day: 7, focus: "Final Review & Relax", tasks: ["Review behavioral questions using STAR method", "Double check resume links and portfolio status", "Get good rest before the interview day"] }
        ],
        questionsToAsk: [
            { question: "What does the typical developer workflow and release lifecycle look like in your team?", intention: "Shows you care about process efficiency, code reviews, CI/CD, and how code gets to production." },
            { question: "How does the engineering team handle technical debt alongside product feature requests?", intention: "Evaluates the team's commitment to quality code and checks if you will be stuck constantly firefighting bugs." },
            { question: "Are there design system tokens established, or do developers style elements from scratch?", intention: "Shows your interest in design-to-development handoffs and productivity tooling." },
            { question: "What are the most challenging technical obstacles the frontend team is currently facing?", intention: "Displays problem-solving interest and shows you are eager to contribute solutions to their pain points." }
        ]
    },
    "Project Manager": {
        _id: "mock-pm-123",
        title: "Project Manager",
        matchScore: 88,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: "How do you define and manage the critical path of a project with multiple shifting dependencies?",
                intention: "Check understanding of project scheduling, risk identification, and resource allocation.",
                answer: "I map all tasks and dependencies using Gantt charts or network diagrams, identify the longest sequence of dependent tasks (critical path), monitor slack time on non-critical tasks, and establish early warning triggers for critical path tasks."
            },
            {
                question: "What criteria do you use to choose between Agile, Waterfall, or Hybrid project management methodologies?",
                intention: "Assess adaptability and knowledge of different delivery frameworks.",
                answer: "I evaluate the clarity of project requirements, frequency of feedback loops, stakeholder expectations, and constraints on budget/timeline. Agile is best for evolving scopes, Waterfall for highly structured environments, and Hybrid for projects with clear milestones but iterative building phase."
            },
            {
                question: "How do you calculate and utilize Earned Value Management (EVM) metrics like CV, SV, CPI, and SPI?",
                intention: "Evaluate financial forecasting and analytical project monitoring capabilities.",
                answer: "Earned Value metrics help compare planned work against actual progress and cost. Cost Variance (CV = EV - AC) and Schedule Variance (SV = EV - PV) show deviation. CPI and SPI ratios help project whether we will finish under budget and on schedule."
            }
        ],
        behavioralQuestions: [
            {
                question: "Describe a project that was falling behind schedule. How did you get it back on track?",
                intention: "Test leadership, quick thinking, and resource/scope management under pressure.",
                answer: "Explain how you analyzed the root cause (e.g. scope creep or resource blockages), re-negotiated deliverables, fast-tracked tasks, reallocated resources, and set up daily stand-ups to clear roadblocks."
            },
            {
                question: "How do you handle a key stakeholder who constantly requests scope changes outside the formal request process?",
                intention: "Verify stakeholder management, assertiveness, and change control compliance.",
                answer: "Emphasize explaining the impact of changes on the timeline and budget, document every change request in a central log, present the trade-offs to the steering committee, and stick to the formal change control board process."
            }
        ],
        skillGaps: [
            { skill: "Jira Advanced Roadmaps", severity: "low" },
            { skill: "Change Management Certification (PROSCI)", severity: "medium" },
            { skill: "Budget Forecasting & EVM", severity: "high" }
        ],
        preparationPlan: [
            { day: 1, focus: "Agile & Scrum Frameworks", tasks: ["Review Scrum Guide", "Solve 5 Scrum Master scenario questions", "Brush up on velocity and burn-down chart analysis"] },
            { day: 2, focus: "Stakeholder Negotiation", tasks: ["Practice resolving conflicting priorities scenarios", "Draft communication plans for difficult clients"] },
            { day: 3, focus: "Budgeting & Financial Tracking", tasks: ["Review formulas for EV, PV, AC, CPI, and SPI", "Analyze a sample budget spreadsheet for variance"] },
            { day: 4, focus: "Risk Management Plan", tasks: ["Create a sample Risk Register with impact and probability ratings", "Outline mitigation strategies for resource departure"] },
            { day: 5, focus: "Jira & Tooling Efficiency", tasks: ["Configure advanced roadmaps and dependency lines", "Review sprint report tracking widgets"] },
            { day: 6, focus: "Conflict Resolution Roleplay", tasks: ["Practice STAR method for team conflicts", "Prepare stories on scope creep mitigation"] },
            { day: 7, focus: "Review Project Portfolio & Rest", tasks: ["Summarize key achievements of past projects", "Print portfolio highlights", "Rest before the big day"] }
        ],
        questionsToAsk: [
            { question: "How does the organization balance product management vision with engineering capacity?", intention: "Shows you are focused on realistic planning and keeping engineering morale high." },
            { question: "What are the most common challenges you face with cross-departmental collaboration here?", intention: "Helps you anticipate organizational silos or communication barriers you will need to dissolve." },
            { question: "How do you define project success at this company, beyond just meeting budget and timeline?", intention: "Displays commitment to delivering actual value and positive business outcomes." }
        ]
    },
    "UX Designer": {
        _id: "mock-ux-123",
        title: "UX Designer",
        matchScore: 90,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: "How do you conduct usability testing for a product that is in early wireframe stages vs a fully launched product?",
                intention: "Assess research methodologies, prototyping approaches, and adaptation to product cycles.",
                answer: "For early wireframes, I use low-fidelity interactive click-throughs (Figma) focusing on flow, navigation, and cognitive load. For launched products, I use unmoderated task analysis, heatmaps, conversion funnel metrics, and A/B testing to refine UI polish."
            },
            {
                question: "What is your approach to establishing and scaling a consistent design system?",
                intention: "Check system thinking, collaboration with developers, and design governance.",
                answer: "I start by auditing existing UI elements, grouping them into atomic components (buttons, typography, inputs), naming them with design tokens, collaborating with engineers to align Figma libraries with React code components, and creating a governance process for updates."
            }
        ],
        behavioralQuestions: [
            {
                question: "How do you handle negative feedback from a client or stakeholder on a design you spent weeks creating?",
                intention: "Test ego-detachment, customer focus, and receptive design communication.",
                answer: "Describe removing personal pride from the design, digging into the feedback to find the underlying problem they want to solve, validating their concerns with data/user testing, and iterating collaboratively."
            }
        ],
        skillGaps: [
            { skill: "HTML/CSS prototyping", severity: "medium" },
            { skill: "Quantitative analytics (Mixpanel/Amplitude)", severity: "high" }
        ],
        preparationPlan: [
            { day: 1, focus: "Design Portfolio Review", tasks: ["Select top 3 case studies", "Structure presentation using Problem-Research-Solution framework", "Polishing visual assets"] },
            { day: 2, focus: "UX Research Methodologies", tasks: ["Review cognitive psychology laws in UX", "Draft a usability test script for a hypothetical checkout page"] },
            { day: 3, focus: "Design Systems & Tokens", tasks: ["Practice setting up auto-layout 4.0 in Figma", "Learn name mapping syntax for CSS design tokens"] },
            { day: 4, focus: "Analytics & User Behavior Data", tasks: ["Read articles on interpreting heap map data", "Review funnel drop-off metrics analysis"] },
            { day: 5, focus: "Accessibility (a11y) in Design", tasks: ["Check contrast ratios on portfolios", "Learn design criteria for keyboard-only and screen reader navigation"] },
            { day: 6, focus: "Whiteboard Design Challenge Practice", tasks: ["Solve 2 mock whiteboard design exercises", "Practice speaking out loud during the wireframing steps"] },
            { day: 7, focus: "Final Polish & Rest", tasks: ["Check all prototype links", "Sleep well to maintain high energy and creativity"] }
        ],
        questionsToAsk: [
            { question: "How integrated is user research in the product design process, and how often do designers interact directly with users?", intention: "Reveals if design is user-centered or just dictated by business stakeholders." },
            { question: "What is the relationship like between the design team and the frontend engineering team?", intention: "Shows if there is a collaborative partnership or a siloed handoff process." }
        ]
    },
    "Copywriter": {
        _id: "mock-cw-123",
        title: "Copywriter",
        matchScore: 85,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: "How do you adapt the brand tone and voice when writing for a technical whitepaper vs an Instagram ad campaign?",
                intention: "Check versatility, vocabulary control, and target audience awareness.",
                answer: "For whitepapers, I write with authoritative, clear, and professional tone, focusing on data points and explaining complex systems simply. For Instagram ads, I write with punchy, conversational, and emotional language, using hooks, short sentences, and clear call-to-actions."
            }
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time a client completely disliked your copy direction. How did you react?",
                intention: "Verify resilience, empathy, and collaborative revision cycles.",
                answer: "Acknowledge the subjective nature of writing, ask open-ended questions to clarify client brand vision, draft 3 alternative copy angles, and walk them through the psychological angles behind each."
            }
        ],
        skillGaps: [
            { skill: "SEO Keywords & Search Intent", severity: "medium" },
            { skill: "A/B Testing Tools", severity: "low" }
        ],
        preparationPlan: [
            { day: 1, focus: "Portfolio Curation", tasks: ["Assemble samples showing different formats", "Write brief notes on the conversion results of each sample"] },
            { day: 2, focus: "Brand Voice Alignment", tasks: ["Study the target company's current site copy", "Rewrite 3 of their ads to show you understand their style"] },
            { day: 3, focus: "SEO Copywriting Best Practices", tasks: ["Review header structures and keyword density rules", "Study search intent classification (informational vs commercial)"] },
            { day: 4, focus: "Conversion Rate Optimization (CRO)", tasks: ["Practice writing headlines using different frameworks (AIDA, PAS)", "Study CTA placement guidelines"] },
            { day: 5, focus: "Content Strategy & Planning", tasks: ["Draft a content calendar for a SaaS relaunch campaign"] },
            { day: 6, focus: "Creative Writing Under Time Pressure", tasks: ["Write 10 headlines for the same product in 30 minutes"] },
            { day: 7, focus: "Relax & Focus", tasks: ["Rest your creative mind, read something pleasant, and be ready"] }
        ],
        questionsToAsk: [
            { question: "Who holds final approval on copy deliverables, and what does the critique process look like?", intention: "Helps you know how many rounds of approval you will navigate." },
            { question: "Do you have user personas or search intent reports that copywriters can reference?", intention: "Shows that you write based on customer data rather than subjective guessing." }
        ]
    },
    "Consultant": {
        _id: "mock-con-123",
        title: "Consultant",
        matchScore: 87,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: "How do you approach structuring an ambiguous, multi-million dollar cost-reduction project for a legacy company?",
                intention: "Assess structured thinking, analytical framework utilization, and risk management.",
                answer: "I use MECE (Mutually Exclusive, Collectively Exhaustive) issue trees to break the business into cost divisions (fixed vs variable, operations, logistics, overheads), establish high-probability cost hypotheses, and run data analyses to quantify savings potential."
            }
        ],
        behavioralQuestions: [
            {
                question: "How do you deliver recommendations that are highly critical of a senior executive's past strategic choices?",
                intention: "Assess diplomacy, data-backed persuasion, and political intelligence.",
                answer: "I frame findings purely around objective data and forward-looking growth opportunities, present findings in 1-on-1 prep sessions before the steering board meeting, and present the executive as a sponsor of the new recovery strategy."
            }
        ],
        skillGaps: [
            { skill: "Financial Modeling", severity: "medium" },
            { skill: "Data Visualization (Tableau/PowerBI)", severity: "high" }
        ],
        preparationPlan: [
            { day: 1, focus: "Case Interview Practice", tasks: ["Solve 3 profitability and market entry cases", "Practice drawing clean logic trees quickly"] },
            { day: 2, focus: "Industry Value Chains Analysis", tasks: ["Study margins and business models of target client sectors"] },
            { day: 3, focus: "Executive Communication & Slide Writing", tasks: ["Practice writing slide titles using Minto Pyramid Principle", "Study charts and layouts that convey insights clearly"] },
            { day: 4, focus: "Financial Metrics & Ratios", tasks: ["Review NPV, IRR, WACC, EBITDA margins, and ROI calculation formulas"] },
            { day: 5, focus: "Client Management Frameworks", tasks: ["Review change management strategies and workshop designs"] },
            { day: 6, focus: "Rapid Calculation Drills", tasks: ["Do 30 minutes of mental math, percentage increases, and scaling problems"] },
            { day: 7, focus: "Mental Readiness", tasks: ["Calm down, practice breathing, review your frameworks, and rest"] }
        ],
        questionsToAsk: [
            { question: "How does the firm support consultants who wish to specialize in a specific industry vertical over time?", intention: "Shows your long-term career ambition and planning." },
            { question: "What is the client mix currently for this office (e.g. public sector, financial services, tech)?", intention: "Helps you understand what projects you will likely staff immediately." }
        ]
    }
};

export const getMockReportForTitle = (title, seniority = "mid") => {
    // Return standard mock if it exists exactly
    const matched = Object.keys(mockReports).find(key => key.toLowerCase() === title.trim().toLowerCase());
    if (matched) {
        return {
            ...mockReports[matched],
            _id: `mock-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
    }

    // Otherwise, generate a customized generic mock report
    return {
        _id: `mock-generic-${Date.now()}`,
        title: title || "Interview Report",
        matchScore: seniority === "junior" ? 75 : seniority === "mid" ? 84 : 91,
        createdAt: new Date().toISOString(),
        technicalQuestions: [
            {
                question: `What are the most critical tools, frameworks, and methodologies required for a ${seniority} ${title} role, and how do you apply them?`,
                intention: "Check foundational knowledge and professional stack alignment.",
                answer: `As a ${seniority} ${title}, it's essential to explain how you select tools (e.g., standard libraries or tracking templates) to drive efficiency. Focus on methodologies like Agile, modularity, or data-driven prioritization, detailing a specific project where you applied them successfully.`
            },
            {
                question: `Can you describe a technical challenge you encountered as a ${title} and the logical debugging or troubleshooting process you followed?`,
                intention: "Assess analytical capabilities and structured problem solving.",
                answer: "Explain how you broke down the challenge into smaller sub-problems, isolated variables, checked logs or telemetry, searched for known solutions, implemented a prototype fix, and verified its security and performance before pushing to production."
            },
            {
                question: "How do you evaluate and integrate new industry trends or emerging tools into your existing workflows?",
                intention: "Evaluate adaptation skills and capacity for continuous innovation.",
                answer: "Talk about tracking industry newsletters, testing tools in a sandbox environment, analyzing efficiency gains vs integration friction, presenting proposals to key stakeholders, and managing training and migration."
            }
        ],
        behavioralQuestions: [
            {
                question: `Tell me about a time you had to deliver a critical milestone as a ${title} under an extremely tight deadline.`,
                intention: "Verify timeline management, prioritization under pressure, and communications.",
                answer: "Describe prioritizing tasks based on business impact, negotiating temporary delays on non-critical scope items, maintaining clear stakeholder status reports, and working systematically to complete the project on time."
            },
            {
                question: "Describe a situation where a misunderstanding arose with a teammate or cross-functional partner. How did you handle it?",
                intention: "Assess interpersonal communication, active listening, and conflict resolution.",
                answer: "Explain shifting communication channels to a face-to-face meeting, listening to their concerns without getting defensive, finding the source of the communication gap, and implementing a common agreement/framework."
            }
        ],
        skillGaps: [
            { skill: "Advanced Workflow Automation", severity: "medium" },
            { skill: "Data Analytics & Quantitative Dashboarding", severity: "low" }
        ],
        preparationPlan: [
            { day: 1, focus: "Core Competency Mapping", tasks: [`Review key technical requirements of a ${title}`, "Formulate three stories illustrating your hands-on experience"] },
            { day: 2, focus: "Industry Methodologies Study", tasks: ["Brush up on best-practice frameworks (e.g., Agile, Scrum, Lean)", "Read articles on standard processes"] },
            { day: 3, focus: "Technical Tooling Audit", tasks: ["Double check your proficiency level in key softwares", "Do a quick coding or configuration challenge"] },
            { day: 4, focus: "Problem Solving Frameworks", tasks: ["Practice logic tree breakdowns of common business issues", "Perform mental math drills"] },
            { day: 5, focus: "Communication & Stakeholders", tasks: ["Prepare a clear 2-minute self-introduction", "Review communication channels for cross-functional partners"] },
            { day: 6, focus: "Mock Testing & STAR Stories", tasks: ["Answer 5 behavioral questions using STAR structure", "Record yourself speaking to evaluate pacing and filler words"] },
            { day: 7, focus: "Final Review & Rest", tasks: ["Review the job post one last time", "Verify interview details (links, dress code)", "Rest and recharge"] }
        ],
        questionsToAsk: [
            { question: "What does success look like in the first 90 days for this specific position?", intention: "Shows you are results-oriented and want to make an immediate, aligned impact." },
            { question: "What is the company's approach to learning, development, and career growth for team members?", intention: "Demonstrates long-term dedication to self-improvement and loyalty to the firm." },
            { question: "What are the key priorities for this department over the next six months?", intention: "Shows you think strategically about the company's roadmap and market environment." }
        ]
    };
};
