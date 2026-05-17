import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const API = "https://devmind-ai-sata.onrender.com";

const getScoreColor = (score) => {
  if (score >= 91) return "#00ff88";
  if (score >= 71) return "#ffff00";
  if (score >= 41) return "#ff8800";
  return "#ff4444";
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

const CodeBlock = ({ code }) => (
  <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ borderRadius: "8px", fontSize: "13px" }}>
    {code}
  </SyntaxHighlighter>
);

const ResultCard = ({ sections }) => {
  if (!sections || sections.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {sections.map((s, i) => {
        if (s.type === "score") {
          const score = parseInt(s.content);
          const color = getScoreColor(score);
          return (
            <div key={i} style={{ background: "#111", border: `2px solid ${color}`, borderRadius: "12px", padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#888", margin: "0 0 8px", fontSize: "14px", letterSpacing: "2px" }}>CODE QUALITY SCORE</p>
              <p style={{ color: color, fontSize: "4rem", fontWeight: "bold", margin: "0" }}>
                {score}<span style={{ fontSize: "1.5rem", color: "#888" }}>/100</span>
              </p>
            </div>
          );
        }
        if (s.type === "bugs") return (
          <div key={i} style={{ background: "#1a0000", border: "1px solid #ff4444", borderRadius: "12px", padding: "1.5rem" }}>
            <h3 style={{ color: "#ff4444", margin: "0 0 12px" }}>🐛 Bugs Found</h3>
            <div style={{ color: "#ffcccc", fontSize: "14px", lineHeight: "1.6" }}><ReactMarkdown>{s.content}</ReactMarkdown></div>
          </div>
        );
        if (s.type === "security") return (
          <div key={i} style={{ background: "#1a0d00", border: "1px solid #ff8800", borderRadius: "12px", padding: "1.5rem" }}>
            <h3 style={{ color: "#ff8800", margin: "0 0 12px" }}>🔒 Security Issues</h3>
            <div style={{ color: "#ffd9aa", fontSize: "14px", lineHeight: "1.6" }}><ReactMarkdown>{s.content}</ReactMarkdown></div>
          </div>
        );
        if (s.type === "recommendations") return (
          <div key={i} style={{ background: "#00001a", border: "1px solid #4488ff", borderRadius: "12px", padding: "1.5rem" }}>
            <h3 style={{ color: "#4488ff", margin: "0 0 12px" }}>💡 Recommendations</h3>
            <div style={{ color: "#aaccff", fontSize: "14px", lineHeight: "1.6" }}><ReactMarkdown>{s.content}</ReactMarkdown></div>
          </div>
        );
        if (s.type === "code") {
          const codeMatch = s.content.match(/```(?:\w+)?\n?([\s\S]*?)```/);
          return (
            <div key={i} style={{ background: "#001a00", border: "1px solid #00ff88", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ color: "#00ff88", margin: "0 0 12px" }}>✅ Fixed Code</h3>
              {codeMatch ? <CodeBlock code={codeMatch[1]} /> : <ReactMarkdown>{s.content}</ReactMarkdown>}
            </div>
          );
        }
        return (
          <div key={i} style={{ background: "#111", border: "1px solid #333", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.6" }}><ReactMarkdown>{s.content}</ReactMarkdown></div>
          </div>
        );
      })}
    </div>
  );
};

const LandingPage = ({ onStart }) => {
  const codeSnippet = `from fastapi import FastAPI
from groq import Groq
import os

app = FastAPI()
client = Groq(
  api_key=os.getenv("GROQ_API_KEY")
)

@app.post("/review")
def review_code(code: str):
  response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{
      "role": "user",
      "content": f"Review: {code}"
    }]
  )
  return {"review": response}`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #c471ed 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(80px)" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1200px", width: "100%", gap: "4rem" }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", letterSpacing: "3px", marginBottom: "1rem", textTransform: "uppercase" }}>
            Introducing &nbsp;•&nbsp; <span style={{ color: "#fff", fontWeight: "bold" }}>Your AI Dev Partner</span>
          </p>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: "900", color: "#fff", margin: "0 0 1.5rem", lineHeight: "1", letterSpacing: "-2px", fontFamily: "Arial Black, sans-serif" }}>
            DEVMIND<br />AI
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.2rem", lineHeight: "1.6", marginBottom: "2.5rem", maxWidth: "450px" }}>
            The AI-Powered Platform for Developer Productivity
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            {["🔍 Code Review", "🐛 Bug Hunt", "📚 Dev Docs"].map((f) => (
              <span key={f} style={{ padding: "0.4rem 1rem", background: "rgba(255,255,255,0.15)", borderRadius: "20px", color: "#fff", fontSize: "13px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>{f}</span>
            ))}
          </div>
          <button onClick={onStart}
            style={{ padding: "1rem 3rem", background: "#fff", color: "#764ba2", border: "none", borderRadius: "50px", cursor: "pointer", fontWeight: "900", fontSize: "1.1rem", fontFamily: "Arial Black, sans-serif", letterSpacing: "1px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
            Get Started →
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ background: "#1a1a2e", borderRadius: "12px 12px 0 0", padding: "8px", border: "3px solid #333", width: "480px", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "#111", borderRadius: "8px 8px 0 0", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28ca41" }} />
                <span style={{ color: "#555", fontSize: "11px", marginLeft: "8px" }}>devmind-ai — main.py</span>
              </div>
              <div style={{ background: "#0d1117", borderRadius: "0 0 8px 8px", padding: "1rem", maxHeight: "280px", overflow: "hidden" }}>
                <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ background: "transparent", margin: 0, fontSize: "11px", lineHeight: "1.6" }}>
                  {codeSnippet}
                </SyntaxHighlighter>
              </div>
            </div>
            <div style={{ background: "#2a2a2a", height: "20px", borderRadius: "0 0 4px 4px", width: "480px" }} />
            <div style={{ background: "#222", height: "8px", borderRadius: "0 0 20px 20px", width: "520px", marginLeft: "-20px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState("landing");
  const [tab, setTab] = useState("review");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [error, setError] = useState("");
  const [docType, setDocType] = useState("readme");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setSections([]);
    try {
      let body, endpoint;
      if (tab === "review") { endpoint = "/review"; body = { code, language }; }
      else if (tab === "bughunt") { endpoint = "/bughunt"; body = { error, code, language }; }
      else { endpoint = "/devdocs"; body = { code, doc_type: docType, language }; }
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const rawText = data.review || data.solution || data.documentation;
      setSections(formatOutput(rawText, tab));
    } catch (e) {
      setSections([{ type: "raw", content: "Error connecting to API!" }]);
    }
    setLoading(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target.result);
    reader.readAsText(file);
  };

  if (page === "landing") return <LandingPage onStart={() => setPage("app")} />;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff", fontFamily: "'Courier New', monospace", backgroundImage: "radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)", backgroundSize: "40px 40px" }}>

      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ color: "#00ff88", margin: 0, fontSize: "1.5rem", letterSpacing: "2px", cursor: "pointer" }} onClick={() => setPage("landing")}>🧠 DEVMIND AI</h1>
        <p style={{ color: "#555", margin: 0, fontSize: "12px" }}>The All-in-One AI Platform for Developers</p>
      </div>

      {/* Body */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* Sidebar */}
        <div style={{ width: "220px", background: "#111", borderRight: "1px solid #222", padding: "1.5rem", flexShrink: 0 }}>
          <p style={{ color: "#555", fontSize: "11px", letterSpacing: "2px", marginBottom: "1.5rem" }}>TOOLS</p>
          {[
            { id: "review", icon: "🔍", label: "Code Review", desc: "Review & score your code", color: "#00ff88" },
            { id: "bughunt", icon: "🐛", label: "Bug Hunt", desc: "Find & fix bugs instantly", color: "#ff4444" },
            { id: "devdocs", icon: "📚", label: "Dev Docs", desc: "Generate documentation", color: "#4488ff" },
          ].map((t) => (
            <div key={t.id} onClick={() => { setTab(t.id); setSections([]); }}
              style={{ padding: "1rem", borderRadius: "10px", marginBottom: "0.75rem", cursor: "pointer", background: tab === t.id ? `${t.color}15` : "transparent", border: `1px solid ${tab === t.id ? t.color : "#222"}`, transition: "all 0.2s" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{t.icon}</div>
              <p style={{ color: tab === t.id ? t.color : "#fff", fontWeight: "bold", margin: "0 0 4px", fontSize: "13px" }}>{t.label}</p>
              <p style={{ color: "#555", fontSize: "11px", margin: 0, lineHeight: "1.4" }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "2rem", maxWidth: "900px" }}>

          {tab === "bughunt" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#ff4444", fontSize: "12px", letterSpacing: "1px" }}>ERROR MESSAGE</label>
              <input placeholder="Paste your error message here..." value={error} onChange={(e) => setError(e.target.value)}
                style={{ width: "100%", padding: "1rem", background: "#1a0000", color: "#ff4444", border: "1px solid #ff4444", borderRadius: "8px", marginTop: "4px", fontFamily: "monospace", fontSize: "13px", boxSizing: "border-box" }} />
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#555", fontSize: "12px", letterSpacing: "1px" }}>
              {tab === "bughunt" ? "YOUR CODE (OPTIONAL)" : "PASTE YOUR CODE"}
            </label>
            <textarea placeholder="Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)}
              style={{ width: "100%", height: "220px", padding: "1rem", background: "#111", color: "#00ff88", border: "1px solid #222", borderRadius: "8px", fontFamily: "monospace", fontSize: "13px", resize: "vertical", boxSizing: "border-box", lineHeight: "1.6", marginTop: "4px" }} />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ color: "#555", fontSize: "11px", display: "block", marginBottom: "4px" }}>LANGUAGE</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: "0.5rem 1rem", background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace" }}>
                {["python", "javascript", "java", "c++", "html", "css"].map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {tab === "devdocs" && (
              <div>
                <label style={{ color: "#555", fontSize: "11px", display: "block", marginBottom: "4px" }}>DOC TYPE</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  style={{ padding: "0.5rem 1rem", background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace" }}>
                  {["readme", "api", "comments"].map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ color: "#555", fontSize: "11px", display: "block", marginBottom: "4px" }}>UPLOAD</label>
              <label style={{ padding: "0.5rem 1rem", background: "#111", border: "1px solid #333", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "block", fontFamily: "monospace" }}>
                📁 Upload File
                <input type="file" accept=".py,.js,.html,.css,.java,.cpp" onChange={handleFile} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <label style={{ color: "#555", fontSize: "11px", display: "block", marginBottom: "4px" }}>ACTION</label>
              <button onClick={analyze} disabled={loading}
                style={{ padding: "0.5rem 2rem", background: loading ? "#333" : tab === "review" ? "#00ff88" : tab === "bughunt" ? "#ff4444" : "#4488ff", color: loading ? "#666" : "#000", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "15px", fontFamily: "monospace", letterSpacing: "1px" }}>
                {loading ? "⏳ Analyzing..." : "Analyze →"}
              </button>
            </div>
          </div>

          {sections.length > 0 && (
            <div>
              <div style={{ color: "#555", fontSize: "12px", letterSpacing: "1px", marginBottom: "1rem", borderTop: "1px solid #222", paddingTop: "1rem" }}>
                ANALYSIS RESULTS
              </div>
              <ResultCard sections={sections} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}