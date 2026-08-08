import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./App.css";

const GOOGLE_CLIENT_ID = "492920890631-bjujpdf9npihuo6hrklipdu382dq4pkk.apps.googleusercontent.com";
const API = "https://devmind-ai-sata.onrender.com";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 860 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const getScoreColor = (score) => {
  if (score >= 91) return "#0f9f6e";
  if (score >= 71) return "#14919b";
  if (score >= 41) return "#c27803";
  return "#d64545";
};

const detectLanguage = (code) => {
  if (!code || code.trim() === "") return "python";
  if (code.includes("def ") || (code.includes("import ") && !code.includes("function"))) return "python";
  if (code.includes("function") || code.includes("const ") || code.includes("let ") || code.includes("console.log")) return "javascript";
  if (code.includes("public class") || code.includes("System.out")) return "java";
  if (code.includes("#include") || code.includes("cout")) return "c++";
  if (code.includes("<html>") || code.includes("<div>")) return "html";
  return "python";
};

const formatOutput = (text, tab) => {
  const sections = [];
  if (tab === "review") {
    const scoreMatch = text.match(/Score:\s*(\d+)\/100/i);
    if (scoreMatch) sections.push({ type: "score", content: scoreMatch[1] });
    const bugMatch = text.match(/(?:Bugs?)[:\s]*([\s\S]*?)(?=Security|Suggestions?|Recommendations?|Updated|Improved|Fixed|Score|$)/i);
    if (bugMatch) sections.push({ type: "bugs", content: bugMatch[1].trim() });
    const secMatch = text.match(/Security[^:]*:[:\s]*([\s\S]*?)(?=Suggestions?|Recommendations?|Updated|Improved|Fixed|Score|Code Quality|$)/i);
    if (secMatch) sections.push({ type: "security", content: secMatch[1].trim() });
    const recMatch = text.match(/(?:Suggestions? for Improvement|Recommendations?|Code Quality Issues?)[:\s]*([\s\S]*?)(?=Updated|Improved|Fixed Code|Score|$)/i);
    if (recMatch) sections.push({ type: "recommendations", content: recMatch[1].trim() });
    const codeMatch = text.match(/(?:Updated Code|Improved Code|Fixed Code|Here'?s? (?:the )?(?:updated|improved|fixed))[:\s]*([\s\S]*?)(?=Score|$)/i);
    if (codeMatch) sections.push({ type: "code", content: codeMatch[1].trim() });
  }
  return sections.length > 0 ? sections : [{ type: "raw", content: text }];
};

const IconReview = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 5.5h16M4 12h10M4 18.5h7" strokeLinecap="round" />
    <circle cx="17.5" cy="17" r="3.5" />
    <path d="M20 19.5 22 21.5" strokeLinecap="round" />
  </svg>
);

const IconBug = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 9.5a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0v-6Z" />
    <path d="M12 5.5V3.5M8 12H4.5M19.5 12H16M7 7 5 5M17 7l2-2M7 17l-2 2M17 17l2 2" strokeLinecap="round" />
  </svg>
);

const IconDocs = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 3.5h7l4 4V20.5H7V3.5Z" />
    <path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" strokeLinecap="round" />
  </svg>
);

const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13 3.5 6.5 13.5H12l-1 7 6.5-10H12L13 3.5Z" strokeLinejoin="round" />
  </svg>
);

const IconCommit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 4v4.5M12 15.5V20" strokeLinecap="round" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12.5 10 17.5 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TOOLS = [
  { id: "review", label: "Code Review", short: "Review", desc: "Score quality, bugs, and security", color: "#0d7377", Icon: IconReview },
  { id: "bughunt", label: "Bug Hunt", short: "Bugs", desc: "Trace errors to a concrete fix", color: "#d64545", Icon: IconBug },
  { id: "devdocs", label: "Dev Docs", short: "Docs", desc: "Generate README, API, comments", color: "#2f6fed", Icon: IconDocs },
  { id: "complexity", label: "Complexity", short: "Big-O", desc: "Estimate time and space cost", color: "#c27803", Icon: IconZap },
  { id: "commit", label: "Git Commit", short: "Commit", desc: "Craft clear commit messages", color: "#0f9f6e", Icon: IconCommit },
];

const HERO_CODE = `from fastapi import FastAPI
from groq import Groq
import os

app = FastAPI()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.post("/review")
def review_code(code: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"Review: {code}"}]
    )
    return {"review": response.choices[0].message.content}`;

const CodeBlock = ({ code }) => (
  <SyntaxHighlighter
    language="python"
    style={oneDark}
    customStyle={{
      borderRadius: "10px",
      fontSize: "13px",
      margin: 0,
      background: "#0b1220",
    }}
  >
    {code}
  </SyntaxHighlighter>
);

const scoreTone = (score) => {
  if (score >= 91) return "Excellent signal. Ship with light cleanup.";
  if (score >= 71) return "Solid base. A few fixes will raise confidence.";
  if (score >= 41) return "Needs attention before merge.";
  return "High risk. Resolve critical issues first.";
};

const ResultCard = ({ sections }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  if (!sections || sections.length === 0) return null;

  const copyText = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <div className="result-stack">
      {sections.map((s, i) => {
        if (s.type === "score") {
          const score = parseInt(s.content, 10);
          const color = getScoreColor(score);
          return (
            <div
              key={i}
              className="result-block score-block"
              style={{ "--score-color": color, "--score-pct": score }}
            >
              <div className="score-ring">
                <strong>{score}</strong>
              </div>
              <div className="score-copy">
                <p className="label">Quality score</p>
                <h3>{score}/100</h3>
                <p>{scoreTone(score)}</p>
              </div>
            </div>
          );
        }
        if (s.type === "bugs") {
          return (
            <div key={i} className="result-block result-bugs">
              <h3>Bugs found</h3>
              <div className="md">
                <ReactMarkdown>{s.content}</ReactMarkdown>
              </div>
            </div>
          );
        }
        if (s.type === "security") {
          return (
            <div key={i} className="result-block result-security">
              <h3>Security issues</h3>
              <div className="md">
                <ReactMarkdown>{s.content}</ReactMarkdown>
              </div>
            </div>
          );
        }
        if (s.type === "recommendations") {
          return (
            <div key={i} className="result-block result-recommendations">
              <h3>Recommendations</h3>
              <div className="md">
                <ReactMarkdown>{s.content}</ReactMarkdown>
              </div>
            </div>
          );
        }
        if (s.type === "code") {
          const codeMatch = s.content.match(/```(?:\w+)?\n?([\s\S]*?)```/);
          const codeToCopy = codeMatch ? codeMatch[1] : s.content;
          const key = `code-${i}`;
          return (
            <div key={i} className="result-block result-code">
              <div className="code-result-head">
                <h3>Fixed code</h3>
                <button
                  type="button"
                  className={`copy-btn${copiedKey === key ? " copied" : ""}`}
                  onClick={() => copyText(key, codeToCopy)}
                >
                  {copiedKey === key ? "Copied" : "Copy"}
                </button>
              </div>
              {codeMatch ? (
                <CodeBlock code={codeMatch[1]} />
              ) : (
                <div className="md">
                  <ReactMarkdown>{s.content}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        }
        return (
          <div key={i} className="result-block">
            <div className="md">
              <ReactMarkdown>{s.content}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LandingPage = ({ onStart }) => (
  <div className="landing">
    <nav className="landing-nav fade-up">
      <div className="brand-mark">
        DEVMIND<span className="ai">AI</span>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onStart}>
        Sign in
      </button>
    </nav>

    <section className="hero">
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="hero-orb hero-orb-c" />
        <div className="hero-codeplane">
          <pre>{`${HERO_CODE}\n\n${HERO_CODE}`}</pre>
        </div>
        <div className="hero-vignette" />
      </div>

      <div className="hero-content">
        <h1 className="brand-mark hero-brand">
          DEVMIND<span className="ai">AI</span>
        </h1>
        <p className="hero-headline fade-up fade-up-delay-1">
          An AI pair for cleaner, sharper shipping.
        </p>
        <p className="hero-support fade-up fade-up-delay-2">
          Review, debug, and document from one calm workspace — paste code or pull a GitHub file.
        </p>
        <div className="hero-cta fade-up fade-up-delay-3">
          <button type="button" className="btn btn-primary" onClick={onStart}>
            Enter workspace
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <a className="hero-scroll" href="#toolkit">
        Explore
        <i aria-hidden="true" />
      </a>
    </section>

    <section className="landing-section" id="toolkit">
      <p className="section-kicker">Toolkit</p>
      <h2 className="section-title">Five tools. One continuous flow.</h2>
      <p className="section-copy">
        Move from review to fix to documentation without leaving the editor.
      </p>
      <div className="tools-rail">
        {TOOLS.map(({ id, label, desc, Icon }, index) => (
          <div key={id} className="tool-cell">
            <span className="tool-index">0{index + 1}</span>
            <div className="tool-icon">
              <Icon />
            </div>
            <h3>{label}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="landing-section">
      <div className="feature-split">
        <div>
          <p className="section-kicker">GitHub access</p>
          <h2 className="section-title">Analyze from a file URL.</h2>
          <p className="section-copy">
            Drop a GitHub blob link into the workspace. DevMind loads the source so you can review without copy-paste.
          </p>
          <button type="button" className="btn btn-accent" onClick={onStart}>
            Open workspace
          </button>
        </div>
        <div className="feature-visual">
          <div className="feature-visual-top">
            <span className="dot" />
            <span className="dot" />
            <span className="dot live" />
            <span>github.com / allen745 / main.py</span>
          </div>
          <div className="feature-score" aria-hidden="true">
            <strong>88</strong>
          </div>
          <pre>{`# Loaded from GitHub
POST /review
language: python

security:
  - avoid hardcoding secrets
recommendations:
  - type the request body
  - add structured logging
status: ready to merge`}</pre>
        </div>
      </div>
    </section>

    <section className="landing-cta">
      <div>
        <h2>Start with signal, not noise.</h2>
        <p>Sign in and run your first review in under a minute.</p>
      </div>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        Get started
        <span aria-hidden="true">→</span>
      </button>
    </section>

    <footer className="landing-footer">
      <div className="brand-mark">
        DEVMIND<span className="ai">AI</span>
      </div>
      <span>Built for developers who want sharper shipping.</span>
    </footer>
  </div>
);

const SignInPage = ({ onSuccess, onBack }) => (
  <div className="signin">
    <aside className="signin-visual">
      <div className="brand-mark fade-up">
        DEVMIND<span className="ai">AI</span>
      </div>
      <div className="signin-visual-copy fade-up fade-up-delay-1">
        <h2>Your AI workspace for sharper shipping.</h2>
        <p>
          Sign in once. Keep reviews, bug hunts, docs, and commit drafts in a single calm dashboard.
        </p>
      </div>
      <pre className="signin-code fade-up fade-up-delay-2">{`review → score + fixes
bughunt → root cause
devdocs → README / API
complexity → Big-O
commit → message draft`}</pre>
    </aside>

    <main className="signin-panel">
      <div className="signin-card fade-up">
        <h1>Welcome back</h1>
        <p>Continue with Google to unlock the full DevMind toolkit.</p>

        <div className="signin-benefits">
          {[
            "Code review with a quality score",
            "Bug hunting from real error traces",
            "Docs, complexity, and commit help",
          ].map((text) => (
            <div key={text} className="signin-benefit">
              <IconCheck />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="signin-google">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              onSuccess({
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
              });
            }}
            onError={() => alert("Sign in failed. Please try again.")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="pill"
            width="320"
          />
        </div>

        <p className="signin-note">By signing in, you agree to use DevMind AI responsibly.</p>
        <button type="button" className="signin-back" onClick={onBack}>
          ← Back to landing
        </button>
      </div>
    </main>
  </div>
);

export default function App() {
  const isMobile = useIsMobile();

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("devmind_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const saved = localStorage.getItem("devmind_user");
      return saved ? "app" : "landing";
    } catch {
      return "landing";
    }
  });

  const [tab, setTab] = useState("review");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [error, setError] = useState("");
  const [docType, setDocType] = useState("readme");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubError, setGithubError] = useState("");

  const handleSignIn = (userData) => {
    try {
      localStorage.setItem("devmind_user", JSON.stringify(userData));
    } catch {
      // continue without persistence
    }
    setUser(userData);
    setPage("app");
  };

  const handleSignOut = () => {
    googleLogout();
    try {
      localStorage.removeItem("devmind_user");
    } catch {
      // ignore
    }
    setUser(null);
    setPage("landing");
  };

  const analyze = async () => {
    setLoading(true);
    setSections([]);
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 400);
    try {
      let body;
      let endpoint;
      if (tab === "review") {
        endpoint = "/review";
        body = { code, language };
      } else if (tab === "bughunt") {
        endpoint = "/bughunt";
        body = { error, code, language };
      } else if (tab === "complexity") {
        endpoint = "/complexity";
        body = { code, language };
      } else if (tab === "commit") {
        endpoint = "/commit";
        body = { code, language };
      } else {
        endpoint = "/devdocs";
        body = { code, doc_type: docType, language };
      }

      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const rawText = data.review || data.solution || data.documentation || data.complexity || data.commit;
      setSections(formatOutput(rawText, tab));
    } catch {
      setSections([{ type: "raw", content: "Error connecting to API. Please try again." }]);
    }
    clearInterval(dotsInterval);
    setDots("");
    setLoading(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target.result);
    reader.readAsText(file);
  };

  const fetchGithubCode = async () => {
    setGithubError("");
    try {
      const url = githubUrl
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not fetch file!");
      const text = await res.text();
      setCode(text);
      setGithubError("ok:Code loaded from GitHub.");
    } catch {
      setGithubError("err:Invalid URL. Paste a direct GitHub file link.");
    }
  };

  const activeTool = TOOLS.find((t) => t.id === tab) ?? TOOLS[0];
  const lineCount = code ? code.split(/\n/).length : 0;
  const charCount = code.length;
  const fileExt = {
    python: "py",
    javascript: "js",
    java: "java",
    "c++": "cpp",
    html: "html",
    css: "css",
  }[language] || "txt";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {page === "landing" && <LandingPage onStart={() => setPage("signin")} />}
      {page === "signin" && (
        <SignInPage onSuccess={handleSignIn} onBack={() => setPage("landing")} />
      )}
      {page === "app" && (
        <div className="dashboard">
          <header className="dash-header">
            <button type="button" className="brand-mark dash-brand" onClick={() => setPage("landing")}>
              DEVMIND<span className="ai">AI</span>
            </button>

            <div className="dash-crumb">
              <span>Workspace</span>
              <span className="sep">/</span>
              <strong>{activeTool.label}</strong>
            </div>

            <div className="dash-header-right">
              <div className={`status-pill${loading ? " busy" : ""}`}>
                <span className="pulse" />
                {loading ? "Analyzing" : "Ready"}
              </div>
              {user && (
                <div className="dash-user">
                  <img src={user.picture} alt={user.name} />
                  <div className="meta">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button type="button" className="btn-signout" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="dash-body">
            <aside className="dash-sidebar">
              <p className="sidebar-label">Tools</p>
              <nav className="tool-nav">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`tool-btn${tab === t.id ? " active" : ""}`}
                    style={{ "--tool-color": t.color }}
                    onClick={() => {
                      setTab(t.id);
                      setSections([]);
                    }}
                  >
                    <div className="tool-btn-title">
                      <span className="icon-wrap">
                        <t.Icon />
                      </span>
                      {t.label}
                    </div>
                    <p>{t.desc}</p>
                  </button>
                ))}
              </nav>
              <div className="sidebar-foot">
                <strong>Pro tip</strong>
                <p>Load a GitHub file URL, then run {activeTool.short.toLowerCase()} without leaving the workspace.</p>
              </div>
            </aside>

            <main className="dash-main">
              {isMobile && (
                <div className="mobile-tools">
                  {TOOLS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`mobile-tool${tab === t.id ? " active" : ""}`}
                      onClick={() => {
                        setTab(t.id);
                        setSections([]);
                      }}
                    >
                      {t.short}
                    </button>
                  ))}
                </div>
              )}

              <div className="workspace-shell">
                <section className="panel input-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Source</h2>
                      <p>{activeTool.desc}</p>
                    </div>
                  </div>

                  <div className="panel-body">
                    {tab === "bughunt" && (
                      <div className="error-banner">
                        <label>Error message</label>
                        <input
                          placeholder="Paste your stack trace or error..."
                          value={error}
                          onChange={(e) => setError(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="source-row">
                      <input
                        placeholder="GitHub file URL (optional)"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                      />
                      <button type="button" className="btn-secondary" onClick={fetchGithubCode}>
                        Load
                      </button>
                      <label className="upload-btn">
                        Upload
                        <input
                          type="file"
                          accept=".py,.js,.ts,.html,.css,.java,.cpp,.go,.rs"
                          onChange={handleFile}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    {githubError && (
                      <p className={`field-hint ${githubError.startsWith("ok:") ? "ok" : "err"}`}>
                        {githubError.replace(/^(ok|err):/, "")}
                      </p>
                    )}

                    <div className="editor">
                      <div className="editor-chrome">
                        <div className="editor-dots" aria-hidden="true">
                          <span /><span /><span />
                        </div>
                        <div className="editor-file">main.{fileExt}</div>
                        <div className="editor-meta">
                          <span className="lang-badge">{language}</span>
                        </div>
                      </div>
                      <textarea
                        placeholder={
                          tab === "bughunt"
                            ? "Optional: paste related source for better fixes..."
                            : "Paste your code here..."
                        }
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setLanguage(detectLanguage(e.target.value));
                        }}
                        spellCheck={false}
                      />
                      <div className="editor-foot">
                        <span>{lineCount} lines</span>
                        <span>{charCount} chars</span>
                      </div>
                    </div>

                    <div className="action-bar">
                      <div className="field">
                        <label>Language</label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                          {["python", "javascript", "java", "c++", "html", "css"].map((l) => (
                            <option key={l} value={l}>
                              {l.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {tab === "devdocs" && (
                        <div className="field">
                          <label>Doc type</label>
                          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                            {["readme", "api", "comments"].map((d) => (
                              <option key={d} value={d}>
                                {d.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="run">
                        <button
                          type="button"
                          className="btn-run"
                          onClick={analyze}
                          disabled={loading}
                        >
                          {loading ? `Running${dots}` : "Run analysis"}
                          {!loading && <span className="kbd">↵</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel output-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Output</h2>
                      <p>
                        {loading
                          ? "Model is reviewing your source..."
                          : sections.length > 0
                            ? "Latest analysis"
                            : "Results appear here"}
                      </p>
                    </div>
                  </div>

                  <div className="panel-body">
                    {loading && (
                      <div className="output-loading">
                        <div>
                          <div className="glyph">
                            <activeTool.Icon />
                          </div>
                          <h3>Analyzing {activeTool.label.toLowerCase()}</h3>
                          <p>Parsing structure, risks, and suggested fixes.</p>
                          <div className="loading-bars" aria-hidden="true">
                            <span /><span /><span />
                          </div>
                        </div>
                      </div>
                    )}

                    {!loading && sections.length === 0 && (
                      <div className="output-empty">
                        <div>
                          <div className="glyph">
                            <activeTool.Icon />
                          </div>
                          <h3>Ready when you are</h3>
                          <p>
                            Paste code or load a GitHub file, then run {activeTool.short.toLowerCase()} to see structured results.
                          </p>
                        </div>
                      </div>
                    )}

                    {!loading && sections.length > 0 && <ResultCard sections={sections} />}
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
