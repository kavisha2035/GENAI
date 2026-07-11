# Interview Prep AI 🤖

An AI-powered mock interview preparation and resume-tailoring platform built on the MERN stack (React, Node.js, Express, MongoDB) and powered by the Google Gemini AI API.

- **Frontend Deployment (Vercel)**: [https://genai-6m9y.vercel.app](https://genai-6m9y.vercel.app)
- **Backend Service (Render)**: [https://genai-wly7.onrender.com](https://genai-wly7.onrender.com)

---

## 📸 Screenshots

### 1. Landing Page
![Landing Page](./assets/landing_page_1.png)

### 2. How it Works
![How it Works](./assets/landing_page_2.png)

### 3. Customized 7-Day Roadmap
![Roadmap](./assets/roadmap.png)

### 4. Technical & Behavioral Questions
![Questions they ask](./assets/questions_they_ask.png)

### 5. Smart Questions to Ask the Interviewer
![Questions to ask](./assets/questions_to_ask.png)

---

## 🚀 Key Features

*   **Customized 7-Day Prep Roadmap**: Generates structured, day-by-day preparation plans tailored for your target job profile.
*   **Targeted AI Questions**: Produces role-specific technical and behavioral questions aligned to your resume and experience.
*   **Reverse Interviewing**: Recommends smart, high-impact questions to ask interviewers to stand out.
*   **Resume Score & Analysis**: Evaluates your resume against a job description, computing a match score and detecting key skill gaps.
*   **Tailored PDF Resume Generation**: Compiles an ATS-friendly, tailored HTML resume and generates a print-ready PDF using Puppeteer.
*   **Cover Letter Creator**: Generates highly persuasive, tailored cover letters targeting specific roles.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19 (Vite), React Router v7, SCSS (glassmorphic layout rules)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB & Mongoose
*   **AI Engine**: `@google/genai` (utilizing `gemini-3-flash-preview` structured JSON configuration schemas)
*   **PDF Compiler**: Headless Chrome (via Puppeteer)

---

## 💻 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/kavisha2035/GENAI.git
cd GENAI
```

### 2. Install dependencies
Install all root, backend, and frontend dependencies at once:
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the `Backend` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_signing_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 4. Run the development environment
Start both the backend and frontend development servers concurrently:
```bash
npm run dev
```
*   Frontend: [http://localhost:5173](http://localhost:5173)
*   Backend API: [http://localhost:3000](http://localhost:3000)
