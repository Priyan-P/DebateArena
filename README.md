# DebateArena AI — Full-Stack AI Debate Simulator

> **College Mini-Project** | Developed with React, Vite, Node.js, Express, and the Official Google GenAI SDK (`@google/genai`).

**DebateArena AI** is an interactive, multi-round debate platform where users debate directly with an AI opponent. The user selects a topic, configures their position (**FOR** or **AGAINST**), and chooses difficulty and style parameters. The AI automatically defends the opposing position, responds to specific arguments in real time, points out logical fallacies or missing evidence, and maintains its stance throughout the debate. 

At the end of the session, a separate **AI Judge** evaluates the user's debate performance across five core dimensions (Logic, Evidence, Clarity, Relevance, and Rebuttal Quality) and outputs a detailed performance report.

---

## 🌟 Features

- **Real AI Opponent**: Uses Google's Gemini models via the official `@google/genai` JavaScript SDK for dynamic argument generation and counter-arguments.
- **Configurable Debate Sessions**:
  - **Topics**: Pick from curated hot topics or enter any custom motion.
  - **Positions**: User chooses FOR or AGAINST; AI is assigned the opposing stance.
  - **Difficulty Levels**: Beginner, Intermediate, Advanced.
  - **Debate Length**: 3, 5, or 7 rounds.
  - **Debate Styles**: Formal, Friendly, or Socratic.
- **Live Debate Room**:
  - Real-time round progress & elapsed debate timer.
  - Interactive multiline input with keyboard shortcuts (`Ctrl + Enter`).
  - Smooth loading indicators during AI thinking.
  - Error recovery and argument draft preservation.
- **AI Adjudicator & Scoring Engine**:
  - Automated evaluation across 5 key dimensions (0-100 scale).
  - Highlights user's **Strongest Argument** & **Weakest Point**.
  - Provides actionable feedback: **Observed Strengths** & **Areas for Growth**.
  - Formatted judge summary.
- **Debate History & Local Persistence**:
  - Automatically saves completed debates in `localStorage`.
  - Reopen past debate reports anytime.
  - Export reports as JSON or print formatted reports.
- **Demo Mode Support**:
  - Seamless fallback demo mode when `GEMINI_API_KEY` is not set, allowing full UI exploration out of the box.

---

## 🛠️ Technology Stack

- **Frontend**:
  - [React 18](https://react.dev/)
  - [Vite 5](https://vitejs.dev/)
  - [Lucide React Icons](https://lucide.dev/)
  - Custom CSS Design System (Dark Navy Theme, Glassmorphism, Responsive Grid)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
  - Official Google GenAI SDK (`@google/genai`)
  - `dotenv`, `cors`
- **Data Persistence**:
  - `localStorage` for client debate history.

---

## 📂 Project Structure

```
DebateArena/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopicSelector.jsx
│   │   ├── DebateRoom.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── DebateTimer.jsx
│   │   ├── ScoreCard.jsx
│   │   └── DebateResults.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── server/
│   ├── routes/
│   │   └── debateRoutes.js
│   ├── controllers/
│   │   └── debateController.js
│   ├── services/
│   │   └── aiService.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
├── index.html
└── README.md
```

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Install Dependencies
Run the install command from the root directory to install both frontend and backend dependencies:
```bash
npm run install:all
```
*(Or run `npm install` in the root folder, and `npm install` inside the `server/` folder).*

### 2. Configure Environment Variables
1. Open `server/.env`.
2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
3. Add your key to `server/.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

*(Note: If no API key is provided, the application will automatically run in **Demo Mode**, serving simulated debate responses so you can still test all UI interactions).*

### 3. Launch the Application
Run the root development command to start both the Vite frontend and Express backend concurrently:
```bash
npm run dev
```

### Local URLs
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Endpoints Documentation

### `GET /api/health`
- **Description**: Returns server status and API configuration info.
- **Response**:
  ```json
  {
    "status": "ok",
    "serverTime": "2026-10-09T22:45:00.000Z",
    "apiKeyConfigured": true,
    "model": "gemini-2.5-flash"
  }
  ```

### `POST /api/debate/start`
- **Description**: Initializes debate session & generates AI opening argument.
- **Request Body**:
  ```json
  {
    "topic": "Should college attendance be compulsory?",
    "userPosition": "FOR",
    "difficulty": "Intermediate",
    "roundLimit": 5,
    "style": "Formal"
  }
  ```
- **Response**: Returns assigned AI position, debate config, and `openingArgument`.

### `POST /api/debate/reply`
- **Description**: Submits user argument and returns contextual AI counterargument.
- **Request Body**:
  ```json
  {
    "topic": "Should college attendance be compulsory?",
    "userPosition": "FOR",
    "aiPosition": "AGAINST",
    "difficulty": "Intermediate",
    "style": "Formal",
    "history": [...],
    "userArgument": "Compulsory attendance ensures discipline and active peer collaboration."
  }
  ```

### `POST /api/debate/judge`
- **Description**: Adjudicates the completed debate transcript and returns structured evaluation metrics.
- **Request Body**:
  ```json
  {
    "topic": "Should college attendance be compulsory?",
    "userPosition": "FOR",
    "history": [...]
  }
  ```

---

## 🔧 Troubleshooting

1. **"API Key Not Configured" Banner**:
   - Ensure you saved your API key in `server/.env` (not root `.env`).
   - Restart the server process (`npm run dev`).
2. **CORS Errors**:
   - Verify the frontend is running on `http://localhost:5173` which is whitelisted in `server/server.js`.
3. **Port 5000 / 5173 Already in Use**:
   - You can change `PORT` in `server/.env` or adjust `vite.config.js`.

---

## 🎓 College Mini-Project License & Context

This project is built for educational demonstration, pair programming, and portfolio use. All evaluation scores are AI-assisted practice metrics designed to sharpen critical thinking, public speaking, and argumentation skills.
