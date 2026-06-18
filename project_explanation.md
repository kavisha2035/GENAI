# Interview Prep AI - Project Explanation & Architecture Document

Welcome to the **Interview Prep AI** platform documentation. This document provides a detailed overview of the system architecture, technological choices, database schemas, component structures, and runtime data flows for developers and stakeholders.

---

## 1. System Architecture

The application is built on a decoupled **MERN-like architecture** (React, Express, Node.js, MongoDB) leveraging Google's Gemini AI API for generating real-time, personalized, and domain-specific career artifacts.

```mermaid
graph TD
    subgraph Client (Vite + React)
        User[Browser Viewport] <--> SPA[React SPA / React Router]
        SPA --> Axios[Axios API Client]
        Axios --> LocalStorage[(Local Cache / JWT)]
    end

    subgraph Server (Node.js + Express)
        Axios <--> API[Express Router]
        API --> AuthMW[JWT Auth Middleware]
        API --> Controllers[Route Controllers]
        Controllers <--> Services[AI Service / Puppeteer]
    end

    subgraph Data & Cloud Services
        Controllers <--> DB[(MongoDB Atlas / Local)]
        Services <--> Gemini[Google GenAI API]
        Services <--> HeadlessBrowser[Puppeteer Headless]
    end
```

---

## 2. Technology Stack

### Frontend Components
- **Framework**: React 18 (Vite Bundler)
- **Routing**: React Router DOM (v6)
- **Styling**: SCSS (Structured variables, layouts, and glassmorphic micro-interactions)
- **API Client**: Axios (With credential sharing and interceptors)
- **State Management**: React Context (`AuthContext`, `InterviewContext`)

### Backend Services
- **Runtime**: Node.js & Express
- **Database**: MongoDB & Mongoose
- **File Parsing**: `pdf-parse` (Extracts textual profiles from uploaded PDF resumes)
- **PDF Generation**: `puppeteer` (Launches headless Chrome to render AI-crafted HTML templates into print-ready A4 PDFs)
- **AI Integrations**: `@google/genai` SDK using `gemini-3-flash-preview` with structured JSON output configurations

---

## 3. Directory Layout

### Backend Directory Layout
```text
Backend/
├── package.json
├── server.js                     # Main entrypoint, initializes Mongoose and binds server port
├── src/
│   ├── app.js                    # Configures Express middleware, CORS, routes, and error handlers
│   ├── config/                   # Configuration loaders
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.js
│   │   ├── coverLetter.controller.js
│   │   └── interview.controller.js
│   ├── middlewares/              # Security and upload interceptors
│   │   ├── auth.middleware.js
│   │   └── file.middleware.js    # Memory storage configuration for multer resume uploads
│   ├── models/                   # Mongoose DB schemas
│   │   ├── blacklist.model.js    # Expirable token revocation list
│   │   ├── coverLetter.model.js
│   │   ├── interviewReport.model.js
│   │   └── user.model.js
│   ├── routes/                   # Endpoint bindings
│   │   ├── auth.routes.js
│   │   ├── coverLetter.routes.js
│   │   └── interview.routes.js
│   └── services/                 # core logical engines
│       └── ai.service.js         # Google Gemini bindings, prompting, and Puppeteer PDF engine
```

### Frontend Directory Layout
```text
Frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── app.routes.jsx            # Defines public and protected routes
    ├── index.css                 # Global CSS rules and reset defaults
    ├── main.jsx
    ├── style.scss                # Global layout imports
    └── features/
        ├── auth/                 # Login, Registration, and session logic
        │   ├── auth.context.jsx
        │   ├── auth.form.scss
        │   ├── hooks/
        │   │   └── useAuth.js
        │   ├── pages/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   └── services/
        │       └── auth.api.js
        └── interview/            # Dashboard, Resumes, Cover Letters, and Pricing
            ├── interview.context.jsx
            ├── hooks/
            │   └── useInterview.js
            ├── pages/
            │   ├── CoverLetter.jsx
            │   ├── Dashboard.jsx
            │   ├── Interview.jsx
            │   ├── Landing.jsx
            │   ├── Pricing.jsx
            │   └── Resumes.jsx
            ├── services/
            │   ├── interview.api.js
            │   └── mockReports.js
            └── style/
                ├── home.scss      # Premium custom dashboards and layout configurations
                └── interview.scss # Mock interview visual styles
```

---

## 4. Database Models & Schema Design

### 4.1 User Schema (`user.model.js`)
```javascript
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });
```

### 4.2 Blacklist Token Schema (`blacklist.model.js`)
Used for secure logout. Invalidated JWT tokens are stored with an expiry index so MongoDB auto-clears them when they die.
```javascript
const blacklistSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-deletes after 1 hour
});
```

### 4.3 Interview Report Schema (`interviewReport.model.js`)
Contains the full structure of the AI analysis report along with cached resume HTML.
```javascript
const interviewReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    resume: { type: String }, // Extracted text
    selfDescription: { type: String },
    jobDescription: { type: String },
    matchScore: { type: Number },
    title: { type: String },
    technicalQuestions: [{
        intention: String,
        question: String,
        answer: String
    }],
    behavioralQuestions: [{
        intention: String,
        question: String,
        answer: String
    }],
    questionsToAsk: [{
        question: String,
        intention: String
    }],
    skillGaps: [{
        skill: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    preparationPlan: [{
        day: Number,
        focus: String,
        tasks: [String]
    }],
    resumeHtml: { type: String } // Cached tailored HTML template
}, { timestamps: true });
```

### 4.4 Cover Letter Schema (`coverLetter.model.js`)
```javascript
const coverLetterSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    jobDescription: { type: String },
    skills: { type: String },
    content: { type: String, required: true }
}, { timestamps: true });
```

---

## 5. Main Component Flows

### 5.1 Authentication Flow
1. **User Sign Up / Log In**: User submits credentials through `Register.jsx` or `Login.jsx`.
2. **Server JWT Token Generation**: Backend validates username/email and passwords using bcrypt, generates a secure JWT token, and sends it inside an HTTP-only cookie or headers.
3. **Session Verification**: The `useAuth` hook loads the authenticated context and verifies the user profile.
4. **Log Out**: Clear user headers and add the current active JWT token to the backend blacklist collection.

### 5.2 Mock Interview Report Generation
1. **Inputs**: The user uploads a resume PDF and enters descriptions/job text in the dashboard.
2. **Client Cache Lookups**: The `useInterview.js` hook calculates a content hash of the input fields. If a matched key exists in `localStorage`, it restores the report instantly.
3. **API Posting**: If new, files are uploaded via a `multipart/form-data` request.
4. **Text Extraction**: The backend parses the PDF buffer using `pdf-parse`.
5. **Server Deduplication**: A DB query searches for identical report conditions. If found, the cached DB record is returned directly.
6. **Gemini Invocation**: Gemini parses the candidate's profile matching the target job description and responds using the strict JSON schema.
7. **Hydration & Storage**: The controller formats response properties and stores them in MongoDB, returning the hydrated model to the frontend.

### 5.3 Resume PDF Generation & Download
```text
+----------+             +------------------------+             +--------------+             +-----------------+
| Frontend |             | Backend controller     |             | Gemini AI    |             | Puppeteer       |
+----------+             +------------------------+             +--------------+             +-----------------+
     |                               |                                 |                              |
     |--- Get PDF download --------->|                                 |                              |
     |                               |--- Check if resumeHtml exists ->|                              |
     |                               |    (If yes, skip AI call)       |                              |
     |                               |                                 |                              |
     |                               |--- Request custom HTML -------->|                              |
     |                               |<-- Return HTML template --------|                              |
     |                               |                                                                |
     |                               |--- Pass HTML to headless Chrome ------------------------------>|
     |                               |<-- Return compiled PDF Buffer ---------------------------------|
     |                               |                                                                |
     |<-- Send raw binary PDF Buffer-|                                                                |
     |                               |                                                                |
     |--- Form Blob object URL ---->|                                                                |
     |--- Create virtual anchor ---->|                                                                |
     |--- Trigger local download ----|                                                                |
```

---

## 6. AI JSON Schema Implementations

To ensure structured content without parse failures, Gemini API calls include strict configuration schemas.

### 6.1 Report Schema
```json
{
  "type": "OBJECT",
  "properties": {
    "matchScore": { "type": "INTEGER" },
    "title": { "type": "STRING" },
    "technicalQuestions": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "intention": { "type": "STRING" },
          "question": { "type": "STRING" },
          "answer": { "type": "STRING" }
        },
        "required": ["intention", "question", "answer"]
      }
    },
    "behavioralQuestions": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "intention": { "type": "STRING" },
          "question": { "type": "STRING" },
          "answer": { "type": "STRING" }
        },
        "required": ["intention", "question", "answer"]
      }
    },
    "questionsToAsk": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "question": { "type": "STRING" },
          "intention": { "type": "STRING" }
        },
        "required": ["question", "intention"]
      }
    },
    "skillGaps": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "skill": { "type": "STRING" },
          "severity": { "type": "STRING", "enum": ["low", "medium", "high"] }
        },
        "required": ["skill", "severity"]
      }
    },
    "preparationPlan": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "day": { "type": "INTEGER" },
          "focus": { "type": "STRING" },
          "tasks": { "type": "ARRAY", "items": { "type": "STRING" } }
        },
        "required": ["day", "focus", "tasks"]
      }
    }
  },
  "required": [
    "matchScore",
    "title",
    "technicalQuestions",
    "behavioralQuestions",
    "questionsToAsk",
    "skillGaps",
    "preparationPlan"
  ]
}
```

---

## 7. Performance & Error Handling

1. **Client-side Caching**: Redundant API roundtrips are eliminated by computing cache keys matching text fields.
2. **Server-side Cache Deduplication**: Reports matching identical job description, profile description, and resume data bypass the Gemini API and are resolved instantly from MongoDB cache.
3. **Resilient Mock Fallbacks**: In the event of network failures or API quota limits (429 status code handling), the system automatically loads context-specific mock data, keeping the user interface active.
4. **Binary Stream Handling**: By calling Axios endpoints with `{ responseType: 'blob' }` and returning standard response buffers, PDF download processes bypass browser decoding failures.
