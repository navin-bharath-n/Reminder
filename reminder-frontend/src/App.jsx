import { useState } from "react";
import "./App.css";

const STEPS = [
  { label: "AI Parse", icon: "✨" },
  { label: "Details", icon: "📝" },
  { label: "Confirm", icon: "🚀" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://reminder-yr4g.onrender.com");

function getStatusClass(status) {
  if (!status) return "";
  if (status.startsWith("✅")) return "status-banner status-success";
  if (status.startsWith("❌")) return "status-banner status-error";
  return "status-banner status-info";
}

function App() {
  const [smartPrompt, setSmartPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [status, setStatus] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSmartParse = async () => {
    if (!smartPrompt.trim()) return;
    setLoading(true);
    setStatus("🧠 AI is parsing your reminder…");
    setActiveStep(1);

    try {
      const res = await fetch(`${API_BASE_URL}/api/parse-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: smartPrompt }),
      });

      const resData = await res.json();
      if (resData.success) {
        const { data } = resData;
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.purpose) setPurpose(data.purpose);
        if (data.message) setMessage(data.message);
        if (data.scheduledTime) setTargetTime(data.scheduledTime);
        setStatus("✨ Smart details filled! Please verify and submit.");
        setActiveStep(2);
      } else {
        setStatus(`❌ AI Error: ${resData.message || "Could not parse"}`);
        setActiveStep(1);
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus("❌ AI Parsing failed. Fill details manually.");
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("⏳ Scheduling your reminder…");
    setActiveStep(2);

    try {
      const res = await fetch(`${API_BASE_URL}/api/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, purpose, message, scheduledTime: targetTime }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(`✅ Reminder set! You'll be notified at ${new Date(data.remindAt).toLocaleString()}`);
        setActiveStep(2);
      } else {
        setStatus(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus("❌ Could not reach server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-card">

        {/* Header */}
        <div className="app-header">
          <div className="logo-icon">⏰</div>
          <h1 className="app-title">AI Reminder Scheduler</h1>
          <p className="app-subtitle">Smart notifications — email &amp; SMS</p>
        </div>

        {/* Steps */}
        <div className="steps">
          {STEPS.map((step, i) => (
            <div key={i} className={`step ${i <= activeStep ? "active" : ""}`}>
              <div className="step-dot">{step.icon}</div>
              <span className="step-text">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Smart AI Box */}
        <div className="smart-section">
          <div className="smart-label">
            <span>⚡ Smart Fill</span>
            <span className="smart-badge">AI POWERED</span>
          </div>
          <textarea
            id="smart-prompt"
            className="smart-textarea"
            placeholder='e.g. "Remind john@email.com at 3pm tomorrow about the project deadline"'
            value={smartPrompt}
            onChange={(e) => setSmartPrompt(e.target.value)}
          />
          <button
            id="btn-ai-parse"
            className="btn btn-ai"
            onClick={handleSmartParse}
            disabled={loading}
          >
            {loading ? "⏳ Parsing…" : "✨ Auto-Fill with AI"}
          </button>
        </div>

        <div className="divider" />

        {/* Manual Form */}
        <form id="reminder-form" className="reminder-form" onSubmit={handleSubmit}>

          {/* Row 1 */}
          <div className="form-row">
            <div className="field">
              <label htmlFor="email" className="field-label">
                <span className="icon">📧</span> Email
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone" className="field-label">
                <span className="icon">📱</span> Phone <span style={{opacity:0.5, fontWeight:400}}>(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                className="field-input"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="field">
              <label htmlFor="purpose" className="field-label">
                <span className="icon">🎯</span> Purpose
              </label>
              <input
                id="purpose"
                type="text"
                className="field-input"
                placeholder="e.g. Meeting, Deadline"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="target-time" className="field-label">
                <span className="icon">🕐</span> Target Time
              </label>
              <input
                id="target-time"
                type="datetime-local"
                className="field-input"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Message full width */}
          <div className="field">
            <label htmlFor="msg" className="field-label">
              <span className="icon">💬</span> Message
            </label>
            <input
              id="msg"
              type="text"
              className="field-input"
              placeholder="Your reminder message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button
            id="btn-submit"
            type="submit"
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? "⏳ Scheduling…" : "🚀 Set Reminder"}
          </button>
        </form>

        {/* Status */}
        {status && <p className={getStatusClass(status)}>{status}</p>}

        <p className="footer-note">
          🔒 Your data is never stored permanently &nbsp;·&nbsp; Reminders sent 30 min before
        </p>
      </div>
    </div>
  );
}

export default App;
