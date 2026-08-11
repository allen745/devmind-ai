# DevMind AI

### The AI-powered workspace for developer productivity

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://devmind-ai-topaz.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://devmind-ai-sata.onrender.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](./frontend)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](./backend)
[![Groq](https://img.shields.io/badge/AI-Groq%20%2B%20LLaMA-F55036?style=for-the-badge)](https://groq.com/)

**Live app:** [https://devmind-ai-topaz.vercel.app](https://devmind-ai-topaz.vercel.app/)  
**Repository:** [https://github.com/allen745/devmind-ai](https://github.com/allen745/devmind-ai)

DevMind AI is an all-in-one AI developer toolkit. Paste code, upload a file, or load a public GitHub file URL — then run focused tools for review, debugging, documentation, complexity analysis, and commit messages. Every successful run is saved to your personal History so you can restore past work anytime.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Product walkthrough](#product-walkthrough)
- [Supported languages](#supported-languages)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Usage tips](#usage-tips)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

DevMind AI helps developers move faster with less copy-paste friction:

| Capability | What you get |
|---|---|
| **Code Review** | Quality score, bugs, security notes, recommendations, and improved code |
| **Bug Hunt** | Root-cause analysis from an error/stack trace + fixed code |
| **Dev Docs** | README, API docs, or inline comments generated from source |
| **Complexity** | Time and space complexity guidance for the pasted code |
| **Git Commit** | Clear, conventional commit message drafts |
| **History** | Per-user archive of past analyses with search, filter, restore, and delete |

Built as a real product surface — premium landing page, Google sign-in, IDE-style workspace, and Render/Vercel deployment — not a demo notebook.

---

## Features

### Core AI tools
- **Code Review** — scores code quality and surfaces bugs, security issues, and actionable recommendations
- **Bug Hunt** — paste an error message (and optional source) to get diagnosis + fix
- **Dev Docs** — generate `README`, `API`, or `comments` documentation
- **Complexity** — estimate Big-O time/space characteristics
- **Git Commit** — draft commit messages from the current change context

### Workspace productivity
- **GitHub file URL loader** — paste a public `blob` URL and load source instantly
- **File upload** — import `.py`, `.js`, `.ts`, `.java`, `.cpp`, `.html`, `.css`, `.go`, `.rs`, and more
- **Language detection** — auto-detects common languages from pasted code
- **Draft autosave** — code, language, error text, and GitHub URL persist across refresh
- **History** — every successful run is saved per signed-in account
- **Search + filter History** — find past work by tool, language, or content
- **Restore runs** — reopen source + output into the workspace in one click
- **Copy / Export** — copy results or download markdown reports
- **Keyboard shortcut** — `⌘/Ctrl + Enter` to run analysis
- **Clear editor** — reset source and context quickly

### Product experience
- Premium brand-first landing page
- Google OAuth sign-in
- Split Source / Output IDE-style dashboard
- Responsive layout for desktop and mobile

---

## Product walkthrough

1. Open the [live app](https://devmind-ai-topaz.vercel.app/)
2. Click **Enter workspace** / **Sign in** with Google
3. Choose a tool from the sidebar (Code Review, Bug Hunt, Dev Docs, Complexity, Git Commit)
4. Paste code, upload a file, or load a GitHub file URL
5. Click **Run analysis** (or press `⌘/Ctrl + Enter`)
6. Review structured output in the Output panel
7. Open **History** to restore, search, filter, or delete past runs

---

## Supported languages

Currently supported in the workspace selector:

- Python
- JavaScript
- Java
- C++
- HTML
- CSS

**Coming soon:** TypeScript, Go, Rust, PHP, Swift, Kotlin

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App), custom CSS design system |
| Auth | Google OAuth (`@react-oauth/google`, `jwt-decode`) |
| Rendering | `react-markdown`, `react-syntax-highlighter` |
| Backend | FastAPI, Uvicorn, Pydantic |
| AI Engine | Groq API · `llama-3.3-70b-versatile` |
| Frontend host | Vercel |
| Backend host | Render |
| Persistence (current) | Browser `localStorage` for session, drafts, and History |

> Note: earlier drafts mentioned Tailwind/PostgreSQL. The shipped app uses a custom CSS system and client-side persistence today. Cloud history + DB sync are on the roadmap.

---

## Architecture

```text
┌──────────────────────────────┐
│  React Frontend (Vercel)     │
│  Landing · Auth · Workspace  │
│  History · Draft autosave    │
└──────────────┬───────────────┘
               │ HTTPS JSON
               ▼
┌──────────────────────────────┐
│  FastAPI Backend (Render)    │
│  /review /bughunt /devdocs   │
│  /complexity /commit         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Groq · LLaMA 3.3 70B        │
└──────────────────────────────┘
```

---

## Project structure

```text
devmind-ai/
├── frontend/                 # React app
│   ├── public/
│   └── src/
│       ├── App.js            # Landing, auth, dashboard, history
│       ├── App.css           # Design system + workspace styles
│       └── index.js
├── backend/
│   ├── main.py               # FastAPI routes + Groq prompts
│   ├── requirements.txt
│   └── Procfile
├── package.json
└── README.md
```

---

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A [Groq](https://console.groq.com/) API key
- Google OAuth Client ID (for sign-in)

### 1) Clone the repository

```bash
git clone https://github.com/allen745/devmind-ai.git
cd devmind-ai
```

### 2) Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

Run the API:

```bash
uvicorn main:app --reload --port 8000
```

API health check: `http://localhost:8000/`

### 3) Start the frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

> For local API testing, point the frontend `API` constant in `frontend/src/App.js` to `http://localhost:8000`.

---

## Environment variables

### Backend
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key used by FastAPI routes |

### Frontend
| Variable / config | Required | Description |
|---|---|---|
| Google OAuth Client ID | Yes | Used by `GoogleOAuthProvider` for sign-in |
| Backend API URL | Yes | Render/production or local FastAPI base URL |

---

## API reference

Base URL (production): `https://devmind-ai-sata.onrender.com`

| Method | Endpoint | Body | Response key |
|---|---|---|---|
| `GET` | `/` | — | `{ "message": "..." }` |
| `POST` | `/review` | `{ "code", "language" }` | `review` |
| `POST` | `/bughunt` | `{ "error", "code?", "language" }` | `solution` |
| `POST` | `/devdocs` | `{ "code", "doc_type", "language" }` | `documentation` |
| `POST` | `/complexity` | `{ "code", "language" }` | `complexity` |
| `POST` | `/commit` | `{ "code", "language" }` | `commit` |

### Example

```bash
curl -X POST https://devmind-ai-sata.onrender.com/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b\n",
    "language": "python"
  }'
```

---

## Usage tips

- Use a **direct GitHub file URL** (`.../blob/main/file.py`) for the Load action
- For Bug Hunt, include both the **error message** and related source when possible
- History is stored **per signed-in Google account** in the browser
- Export markdown when you want to attach a review to a PR or ticket
- The first API call after idle may be slower if the Render service is cold-starting

---

## Roadmap

- [x] Premium landing + Google auth workspace
- [x] Five AI tools + GitHub file loader
- [x] Per-user History, draft autosave, export/copy
- [ ] Structured JSON model responses (more reliable score/cards)
- [ ] Side-by-side diff for original vs fixed code
- [ ] Cloud-synced History (backend + database)
- [ ] Private GitHub access via OAuth
- [ ] Multi-file / PR review support
- [ ] Broader language pack (TypeScript, Go, Rust, …)
- [ ] Team workspaces and shareable report links

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with a clear message
4. Open a pull request describing the change and how you tested it

For larger features (cloud history, diff view, structured outputs), open an issue first so scope stays aligned.

---

## License

This project is currently shared for portfolio, learning, and collaboration purposes.  
If you plan to reuse substantial parts commercially, please reach out to the author first.

---

## Author

<p align="center">
  <a href="https://portfolio-demo-tan-six.vercel.app" target="_blank" rel="noopener noreferrer">
    <img
      src="https://avatars.githubusercontent.com/u/226674447?v=4"
      alt="Allen Stivanson Christian"
      width="140"
      height="140"
      style="border-radius: 50%;"
    />
  </a>
</p>

<h3 align="center">Allen Stivanson Christian</h3>

<p align="center">
  <strong>AI & Data Science Engineer · Patent Holder · Builder</strong><br/>
  B.Tech Artificial Intelligence & Data Science<br/>
  A D Patel Institute of Technology (ADIT) · CVM University · Anand, Gujarat
</p>

<p align="center">
  I ship FastAPI backends, LLM agents, and production tools — built to ship, not just to show.
</p>

### About the builder

Allen is an AI & Data Science engineer focused on backend systems, LLM agents, and end-to-end products. Recent work includes:

- **DevMind AI** — AI developer toolkit (this repo)
- **DevMind AI Agent** — multi-step GitHub repository health agent ([live](https://devmind-agent.onrender.com/))
- **CA SaaS** — B2B SaaS for chartered accountants (in progress)
- **Vertex** — career intelligence platform (in progress)
- **Government of India Design Patent** — Spring-Loaded Piezoelectric Generating Striker Device (Design No. **450815-001**)

Recognition highlights include Top Intern at InAmigos Foundation, TCS Rural IT Quiz (National), SPEC Innovation Award (AIKYAM), and HackZero ’26 CTF (OWASP VIT Bhopal).

### Connect

<p align="center">
  <a href="https://portfolio-demo-tan-six.vercel.app" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Portfolio-Live%20Site-0d7377?style=for-the-badge" alt="Portfolio" />
  </a>
  <a href="https://github.com/allen745/portfolio-demo-" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Portfolio-GitHub-181717?style=for-the-badge&logo=github" alt="Portfolio GitHub" />
  </a>
  <a href="https://github.com/allen745" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/GitHub-allen745-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/allen-christian-708545409/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/LinkedIn-Allen%20Christian-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="https://allen745.github.io/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/GitHub%20Pages-Profile-222222?style=for-the-badge" alt="GitHub Pages" />
  </a>
</p>

<p align="center">
  <sub>
    Portfolio source:
    <a href="https://github.com/allen745/portfolio-demo-">github.com/allen745/portfolio-demo-</a>
    ·
    Live:
    <a href="https://portfolio-demo-tan-six.vercel.app">portfolio-demo-tan-six.vercel.app</a>
  </sub>
</p>

---

<p align="center">
  <strong>DevMind AI</strong> — built for developers who want signal, not noise.<br/>
  ★ Star the repo if this helps your workflow.
</p>
