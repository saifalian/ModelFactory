import React, { useState, useEffect, useRef, useCallback } from "react";

const T = {
  bg0: "#0a0e17", bg1: "#0f1623", bg2: "#141c2c", bg3: "#1a2538",
  border: "#202d44", borderB: "#2b3b55",
  amber: "#6366f1", amberD: "#4f46e5", green: "#10b981",
  red: "#ef4444", redD: "#7f1d1d", blue: "#3b82f6",
  cyan: "#0ea5e9", purple: "#8b5cf6",
  text: "#94a3b8", textB: "#cbd5e1", textD: "#475569", white: "#f1f5f9",
};

const sc = s => ({ trained: T.green, training: T.amber, untrained: T.textD, error: T.red }[s] || T.textD);
const sl = s => ({ trained: "● TRAINED", training: "◐ TRAINING", untrained: "○ NO DATA", error: "✗ ERROR" }[s] || s);

const MODELS_INIT = [
  {
    id: "m1", name: "open_coinglass", desc: "Open app & go fullscreen", type: "Click/Navigation",
    status: "trained", score: 94.2, bestScore: 94.2, videos: 12, images: 3, frames: 2847,
    attempts: 47, successRate: 91, region: "Full screen",
    actions: [
      {
        id: "a1", name: "Launch App Sequence", steps: 7, isReset: false,
        seq: [{ type: "key", key: "Win" }, { type: "wait", seconds: 0.5 }, { type: "type", text: "Coinglass" },
        { type: "key", key: "Enter" }, { type: "wait", seconds: 3 }, { type: "key", key: "F11" }]
      },
      {
        id: "a2", name: "Reset Sequence", steps: 5, isReset: true,
        seq: [{ type: "key", key: "Escape" }, { type: "key", key: "Escape" }, { type: "scroll", amount: -10 },
        { type: "click", x: 460, y: 55 }, { type: "wait", seconds: 1.5 }]
      },
    ],
    goals: ["goal_fullscreen.png", "goal_chart_ready.png"],
    history: [42, 51, 58, 63, 67, 71, 74, 77, 79, 82, 83, 85, 87, 88, 90, 91, 92, 93, 94, 94.2],
    runs: [{ date: "Today 14:32", status: "success", time: "2.3s" }, { date: "Today 11:18", status: "success", time: "1.9s" },
    { date: "Today 09:44", status: "fail", time: "--" }, { date: "Yesterday", status: "success", time: "2.1s" }],
    versions: [{ v: "v3", score: 94.2, date: "Today", active: true }, { v: "v2", score: 87.1, date: "Yesterday", active: false }],
    errors: { reset: 1, vision: 2, click: 0, ocr: 0, app: 1 },
    driftAlert: false, liveConfidence: 88,
  },
  {
    id: "m2", name: "click_clusters", desc: "Detect & click liquidity zones", type: "Visual Detection",
    status: "training", score: 78.3, bestScore: 81.2, videos: 34, images: 0, frames: 8421,
    attempts: 89, successRate: 74, region: "Chart canvas only",
    actions: [{
      id: "a3", name: "Reset Chart State", steps: 6, isReset: true,
      seq: [{ type: "key", key: "Escape" }, { type: "scroll", amount: -8 }, { type: "click", x: 150, y: 92 }, { type: "wait", seconds: 1 }]
    }],
    goals: ["goal_cluster_found.png"],
    history: [20, 28, 35, 40, 44, 48, 52, 56, 60, 63, 65, 68, 70, 72, 73, 75, 76, 77, 78, 78.3],
    runs: [{ date: "Today 15:01", status: "training", time: "--" }, { date: "Today 14:55", status: "success", time: "8.1s" }],
    versions: [{ v: "v2", score: 78.3, date: "Today", active: true }, { v: "v1", score: 60.1, date: "2 days ago", active: false }],
    errors: { reset: 3, vision: 6, click: 4, ocr: 3, app: 2 },
    driftAlert: false, liveConfidence: 78,
  },
  {
    id: "m3", name: "read_popup", desc: "OCR popup values after click", type: "Data Extraction",
    status: "trained", score: 91.7, bestScore: 91.7, videos: 8, images: 22, frames: 1203,
    attempts: 31, successRate: 89, region: "Popup area only",
    actions: [], goals: ["goal_popup_read.png"],
    history: [55, 62, 68, 73, 77, 80, 83, 85, 87, 88, 89, 90, 91, 91.7],
    runs: [{ date: "Today 14:33", status: "success", time: "0.4s" }, { date: "Today 11:19", status: "success", time: "0.3s" }],
    versions: [{ v: "v2", score: 91.7, date: "Today", active: true }],
    errors: { reset: 0, vision: 1, click: 0, ocr: 2, app: 0 },
    driftAlert: true, liveConfidence: 61,
  },
  {
    id: "m4", name: "assess_chart", desc: "Detect chart readiness state", type: "Visual Detection",
    status: "untrained", score: 0, bestScore: 0, videos: 0, images: 0, frames: 0,
    attempts: 0, successRate: 0, region: "Not set",
    actions: [], goals: [], history: [], runs: [], versions: [],
    errors: { reset: 0, vision: 0, click: 0, ocr: 0, app: 0 },
    driftAlert: false, liveConfidence: 0,
  },
];

const MACRO_INIT = {
  id: "mac1", name: "coinglass_full_agent",
  nodes: [
    { id: "n1", type: "model", modelId: "m1", x: 300, y: 60, label: "open_coinglass" },
    { id: "n2", type: "condition", x: 300, y: 160, label: "Chart visible?" },
    { id: "n3", type: "model", modelId: "m2", x: 300, y: 280, label: "click_clusters" },
    { id: "n4", type: "loop", x: 300, y: 380, label: "FOR EACH cluster" },
    { id: "n5", type: "model", modelId: "m3", x: 300, y: 480, label: "read_popup" },
    { id: "n6", type: "action", x: 300, y: 580, label: "Save to JSON" },
  ],
  edges: [
    { from: "n1", to: "n2" }, { from: "n2", to: "n3", label: "YES" },
    { from: "n3", to: "n4" }, { from: "n4", to: "n5" }, { from: "n5", to: "n6" }
  ]
};

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

const Chip = ({ children, color = T.amber }) => (
  <span style={{
    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 7px",
    background: `${color}15`, border: `1px solid ${color}35`, color, borderRadius: 2
  }}>{children}</span>
);

const Btn = ({ children, onClick, v = "ghost", color = T.amber, disabled = false, small = false, full = false, sx = {} }) => {
  const p = small ? "4px 10px" : "7px 16px";
  const fs = small ? 9 : 11;
  const styles = {
    solid: { background: color, borderColor: color, color: "#000" },
    outline: { background: "transparent", borderColor: `${color}50`, color },
    ghost: { background: "transparent", borderColor: "transparent", color: T.textD },
    danger: { background: T.redD, borderColor: T.red, color: T.red },
    green: { background: T.greenD || "#064e3b", borderColor: T.green, color: T.green },
  };
  return <button onClick={disabled ? undefined : onClick} style={{
    fontFamily: "'Courier New',monospace", fontSize: fs, fontWeight: 700,
    letterSpacing: "0.08em", padding: p, border: "1px solid", borderRadius: 2,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    whiteSpace: "nowrap", width: full ? "100%" : "auto",
    transition: "all 0.12s", ...styles[v], ...sx
  }}>{children}</button>;
};

const Inp = ({ value, onChange, placeholder, sx = {} }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{
      background: T.bg0, border: `1px solid ${T.border}`, color: T.white,
      fontFamily: "'Courier New',monospace", fontSize: 11, padding: "7px 10px",
      borderRadius: 2, outline: "none", width: "100%", boxSizing: "border-box", ...sx
    }} />
);

const Sel = ({ value, onChange, options, sx = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{
      background: T.bg2, border: `1px solid ${T.border}`, color: T.white,
      fontFamily: "'Courier New',monospace", fontSize: 11, padding: "6px 8px",
      borderRadius: 2, outline: "none", ...sx
    }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Sec = ({ label, children, sx = {} }) => (
  <div style={{ marginBottom: 18, ...sx }}>
    <div style={{
      fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 10,
      paddingBottom: 6, borderBottom: `1px solid ${T.border}`
    }}>{label}</div>
    {children}
  </div>
);

const MiniChart = ({ data = [], color = T.amber, h = 40 }) => {
  if (!data || data.length < 2) return <div style={{
    height: h, display: "flex", alignItems: "center",
    justifyContent: "center", color: T.textD, fontSize: 9
  }}>NO DATA</div>;
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - ((v - mn) / rng) * (h - 4) - 2}`).join(" ");
  return <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
    <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    <polyline points={`0,${h} ${pts} 100,${h}`} fill={`${color}15`} stroke="none" />
  </svg>;
};

const ScoreBar = ({ value, max = 100, color = T.amber, height = 4 }) => (
  <div style={{ background: T.bg0, height, borderRadius: 1, overflow: "hidden", width: "100%" }}>
    <div style={{
      height: "100%", width: `${Math.min(100, (value / max) * 100)}%`,
      background: `linear-gradient(90deg,${color}80,${color})`,
      transition: "width 0.5s ease", borderRadius: 1
    }} />
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
    <div onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 10,
      background: value ? T.amber : T.border, position: "relative", transition: "background 0.2s",
      cursor: "pointer", flexShrink: 0
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%", background: T.white,
        position: "absolute", top: 3, left: value ? 19 : 3, transition: "left 0.2s"
      }} />
    </div>
    {label && <span style={{ color: T.text, fontSize: 11 }}>{label}</span>}
  </label>
);

const InfoBanner = ({ children, color = T.blue }) => (
  <div style={{
    background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 2,
    padding: "10px 14px", marginBottom: 14, fontSize: 10, color: T.text, lineHeight: 1.7
  }}>
    <span style={{ color, fontWeight: 700 }}>ℹ </span>{children}
  </div>
);

const Modal = ({ title, onClose, children, width = 520 }) => (
  <div style={{
    position: "fixed", inset: 0, background: "#000c", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000
  }}>
    <div style={{
      background: T.bg2, border: `1px solid ${T.borderB}`, width,
      maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", borderRadius: 3,
      boxShadow: `0 0 60px #000a,0 0 0 1px ${T.amber}22`
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, background: T.bg2, zIndex: 1
      }}>
        <span style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>{title}</span>
        <button onClick={onClose} style={{
          background: "transparent", border: "none",
          color: T.textD, cursor: "pointer", fontSize: 18, lineHeight: 1
        }}>✕</button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

// ── NAVBAR ────────────────────────────────────────────────────────────────────

const NavBar = ({ screen, setScreen, models, setModels, selectedModel, setSelectedModel }) => {
  const [modelsOpen, setModelsOpen] = useState(true);
  const [macroOpen, setMacroOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newModel, setNewModel] = useState({ name: "", desc: "", type: "Click/Navigation", outputType: "Click coordinates" });

  const errCount = models.filter(m => m.status === "error").length;
  const driftCount = models.filter(m => m.driftAlert).length;

  const navBtn = (key, label, badge = 0) => (
    <button onClick={() => setScreen(key)} style={{
      width: "100%", textAlign: "left", padding: "10px 16px",
      background: screen === key ? `${T.amber}15` : "transparent",
      borderLeft: screen === key ? `2px solid ${T.amber}` : "2px solid transparent",
      outline: "none", borderTop: "none", borderRight: "none", borderBottom: "none",
      cursor: "pointer", color: screen === key ? T.amber : T.textD,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", transition: "all 0.12s",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>{label}</span>
      {badge > 0 && <span style={{
        background: T.red, color: T.white, fontSize: 8, fontWeight: 700,
        borderRadius: 10, padding: "1px 5px", minWidth: 14, textAlign: "center"
      }}>{badge}</span>}
    </button>
  );

  const handleCreateModel = () => {
    if (!newModel.name.trim()) return;
    const m = {
      id: `m${Date.now()}`, ...newModel, status: "untrained", score: 0, bestScore: 0,
      videos: 0, images: 0, frames: 0, attempts: 0, successRate: 0, region: "Not set",
      actions: [], goals: [], history: [], runs: [], versions: [],
      errors: { reset: 0, vision: 0, click: 0, ocr: 0, app: 0 }, driftAlert: false, liveConfidence: 0
    };
    setModels(p => [...p, m]);
    setShowCreate(false);
    setSelectedModel(m);
    setScreen("model");
    setNewModel({ name: "", desc: "", type: "Click/Navigation", outputType: "Click coordinates" });
  };

  return <>
    <div style={{
      width: 220, background: T.bg1, borderRight: `1px solid ${T.border}`,
      height: "100vh", position: "fixed", top: 0, left: 0, display: "flex", flexDirection: "column",
      overflowY: "auto", zIndex: 50
    }}>
      {/* Logo */}
      <div style={{
        padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer"
      }}
        onClick={() => setScreen("dashboard")}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: T.amber,
          boxShadow: `0 0 10px ${T.amber}`
        }} />
        <span style={{ color: T.white, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em" }}>
          ModelFactory</span>
      </div>

      <div style={{ padding: "8px 0", flex: 1 }}>
        {navBtn("dashboard", "⬡  DASHBOARD", errCount + driftCount)}

        {/* Models section */}
        <div style={{ marginTop: 4 }}>
          <div style={{
            display: "flex", alignItems: "center",
            borderLeft: screen === "models" ? `2px solid ${T.amber}` : "2px solid transparent"
          }}>
            <button onClick={() => setScreen("models")} style={{
              flex: 1, textAlign: "left", padding: "10px 16px", background: "transparent",
              border: "none", cursor: "pointer", color: screen === "models" ? T.amber : T.textD,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em"
            }}>
              ⊞  MODELS
            </button>
            <button onClick={() => setModelsOpen(p => !p)} style={{
              background: "transparent", border: "none", color: T.textD, cursor: "pointer",
              padding: "10px 12px 10px 4px", fontSize: 10
            }}>
              {modelsOpen ? "▾" : "▸"}
            </button>
          </div>
          {modelsOpen && <div style={{ paddingLeft: 8 }}>
            {models.map(m => (
              <div key={m.id}
                onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, model: m }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", cursor: "pointer",
                  background: selectedModel?.id === m.id && screen === "model" ? `${sc(m.status)}10` : "transparent",
                  borderLeft: `2px solid ${selectedModel?.id === m.id && screen === "model" ? sc(m.status) : "transparent"}`,
                }}
                onClick={() => { setSelectedModel(m); setScreen("model"); }}>
                <span style={{ color: sc(m.status), fontSize: 9, flexShrink: 0 }}>
                  {m.status === "trained" ? "●" : m.status === "training" ? "◐" : m.status === "error" ? "✗" : "○"}
                </span>
                <span style={{
                  color: selectedModel?.id === m.id && screen === "model" ? T.white : T.text,
                  fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {m.name}
                </span>
                {m.driftAlert && <span style={{ color: T.amber, fontSize: 9, marginLeft: "auto" }}>⚠</span>}
              </div>
            ))}
            <button onClick={() => setShowCreate(true)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
              background: "transparent", border: "none", cursor: "pointer",
              color: T.textD, fontSize: 10, width: "100%", textAlign: "left"
            }}>
              <span>+</span><span>Create New Model</span>
            </button>
          </div>}
        </div>

        {/* Macro Builder */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => setScreen("macro")} style={{
              flex: 1, textAlign: "left", padding: "10px 16px", background: "transparent",
              border: "none", borderLeft: screen === "macro" ? `2px solid ${T.amber}` : "2px solid transparent",
              cursor: "pointer", color: screen === "macro" ? T.amber : T.textD,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em"
            }}>
              ⬡  MACRO BUILDER
            </button>
            <button onClick={() => setMacroOpen(p => !p)} style={{
              background: "transparent", border: "none", color: T.textD,
              cursor: "pointer", padding: "10px 12px 10px 4px", fontSize: 10
            }}>
              {macroOpen ? "▾" : "▸"}
            </button>
          </div>
          {macroOpen && <div style={{ paddingLeft: 8 }}>
            <div onClick={() => setScreen("macro")} style={{
              padding: "7px 16px", cursor: "pointer", color: T.text, fontSize: 10
            }}>
              coinglass_full_agent
            </div>
            <div style={{ padding: "7px 16px", cursor: "pointer", color: T.textD, fontSize: 10 }}>
              + Create New Macro
            </div>
          </div>}
        </div>

        <div style={{ marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
          {navBtn("settings", "⚙  SETTINGS")}
        </div>
      </div>
    </div>

    {/* Context menu */}
    {ctxMenu && <>
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setCtxMenu(null)} />
      <div style={{
        position: "fixed", left: ctxMenu.x, top: ctxMenu.y, zIndex: 201,
        background: T.bg3, border: `1px solid ${T.borderB}`, borderRadius: 2,
        minWidth: 160, boxShadow: "0 4px 20px #0008"
      }}>
        {[
          { label: "Open", action: () => { setSelectedModel(ctxMenu.model); setScreen("model"); } },
          { label: "Begin Training", action: () => { } },
          { label: "Pause Training", action: () => { } },
          { label: "Stop Training", action: () => { } },
          null,
          { label: "Duplicate", action: () => { } },
          { label: "Delete", action: () => { }, danger: true },
        ].map((item, i) => item ?
          <button key={i} onClick={() => { item.action(); setCtxMenu(null); }} style={{
            display: "block", width: "100%", textAlign: "left", padding: "8px 14px",
            background: "transparent", border: "none", cursor: "pointer",
            color: item.danger ? T.red : T.text, fontSize: 11, fontFamily: "inherit"
          }}>
            {item.label}
          </button> :
          <div key={i} style={{ height: 1, background: T.border, margin: "2px 0" }} />
        )}
      </div>
    </>}

    {/* Create Model Modal */}
    {showCreate && <Modal title="CREATE NEW MODEL" onClose={() => setShowCreate(false)}>
      <Sec label="IDENTITY">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>MODEL NAME</div>
            <Inp value={newModel.name} onChange={v => setNewModel(p => ({ ...p, name: v }))} placeholder="e.g. click_clusters" />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>DESCRIPTION</div>
            <Inp value={newModel.desc} onChange={v => setNewModel(p => ({ ...p, desc: v }))} placeholder="What does this model do?" />
          </div>
        </div>
      </Sec>
      <Sec label="TASK TYPE (check all that apply)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Visual Detection", "Click / Navigation", "Data Extraction",
            "Settings Adjustment", "Yes / No Decision", "Sequence of Actions"].map(t => (
              <label key={t} style={{
                display: "flex", gap: 6, alignItems: "center", cursor: "pointer",
                padding: "6px 10px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
              }}>
                <input type="checkbox" style={{ accentColor: T.amber }} />
                <span style={{ color: T.text, fontSize: 10 }}>{t}</span>
              </label>
            ))}
        </div>
      </Sec>
      <Sec label="OUTPUT TYPE (check all that apply)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Click coordinates (x,y)", "Swipe / Drag", "Scroll amount", "Keyboard input",
            "Type text", "Numeric value", "Yes / No", "Extracted text", "Ranked list",
            "Wait duration", "App action", "Conditional branch"].map(t => (
              <label key={t} style={{
                display: "flex", gap: 6, alignItems: "center", cursor: "pointer",
                padding: "6px 10px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
              }}>
                <input type="checkbox" style={{ accentColor: T.cyan }} />
                <span style={{ color: T.text, fontSize: 10 }}>{t}</span>
              </label>
            ))}
        </div>
      </Sec>
      <div style={{
        padding: "10px 12px", background: T.bg3, border: `1px solid ${T.border}`,
        borderRadius: 2, marginBottom: 16, fontSize: 10, color: T.textD, lineHeight: 1.7
      }}>
        📂 Auto-creates: <span style={{ color: T.amber }}>models/{newModel.name || "model_name"}/</span>
        <br />reference/ · extracted/ · labeled/ · augmented/ · goals/ · checkpoints/ · best/ · logs/ · attempts/ · test_data/ · live_recordings/ · results/
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="ghost" onClick={() => setShowCreate(false)}>CANCEL</Btn>
        <Btn v="solid" onClick={handleCreateModel} disabled={!newModel.name.trim()}>CREATE MODEL →</Btn>
      </div>
    </Modal>}
  </>;
};

// ── TRAFFIC LIGHT OVERLAY ─────────────────────────────────────────────────────

const TrafficOverlay = ({ models, onOpen }) => {
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef(null);
  const trainingModels = models.filter(m => m.status === "training");
  const errModels = models.filter(m => m.status === "error");
  const overallStatus = errModels.length > 0 ? "error" : trainingModels.length > 0 ? "training" : "paused";
  const dotColor = { training: T.green, error: T.red, paused: T.amber }[overallStatus];

  if (trainingModels.length === 0 && errModels.length === 0) return null;

  if (collapsed) return (
    <div onClick={() => setCollapsed(false)} style={{
      position: "fixed", left: pos.x, top: pos.y,
      width: 20, height: 20, borderRadius: "50%", background: dotColor, cursor: "pointer",
      zIndex: 9999, boxShadow: `0 0 12px ${dotColor}`,
      animation: overallStatus === "training" ? "overlayPulse 1.5s infinite" :
        overallStatus === "error" ? "overlayFlash 0.5s infinite" : "none"
    }} />
  );

  return (
    <div style={{
      position: "fixed", left: pos.x, top: pos.y, width: 190,
      background: T.bg2, border: `1px solid ${dotColor}50`, borderRadius: 4,
      boxShadow: `0 4px 20px #000a,0 0 0 1px ${dotColor}30`, zIndex: 9999,
      fontFamily: "'Courier New',monospace", cursor: "move", userSelect: "none"
    }}
      onMouseDown={e => {
        const startX = e.clientX - pos.x, startY = e.clientY - pos.y;
        const move = ev => setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
        const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
      }}>
      {/* Header */}
      <div style={{
        padding: "8px 10px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
            animation: overallStatus === "training" ? "overlayPulse 1.5s infinite" :
              overallStatus === "error" ? "overlayFlash 0.5s infinite" : "none"
          }} />
          <span style={{ color: T.white, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>
            {overallStatus === "training" ? "TRAINING" : overallStatus === "error" ? "ERROR" : "PAUSED"}
          </span>
        </div>
        <button onClick={() => setCollapsed(true)} style={{
          background: "transparent", border: "none", color: T.textD, cursor: "pointer", fontSize: 12
        }}>—</button>
      </div>
      {/* Models */}
      {trainingModels.map(m => (
        <div key={m.id} style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.white, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, fontSize: 9, color: T.textD }}>
            <span>Attempt: <span style={{ color: T.amber }}>{m.attempts}</span></span>
            <span>Score: <span style={{ color: T.green }}>{m.score.toFixed(1)}</span></span>
            <span>Best: <span style={{ color: T.cyan }}>{m.bestScore.toFixed(1)}</span></span>
            <span>SR: <span style={{ color: T.text }}>{m.successRate}%</span></span>
          </div>
        </div>
      ))}
      {errModels.map(m => (
        <div key={m.id} style={{
          padding: "8px 10px", borderBottom: `1px solid ${T.border}`,
          background: `${T.red}10`
        }}>
          <div style={{ color: T.red, fontSize: 10, fontWeight: 700 }}>{m.name}</div>
          <div style={{ color: T.textD, fontSize: 9 }}>Error — needs attention</div>
        </div>
      ))}
      {/* Buttons */}
      <div style={{ padding: "8px 10px", display: "flex", gap: 6 }}>
        <Btn small v="outline" sx={{ flex: 1, fontSize: 9 }}>⏸ Pause</Btn>
        <Btn small v="danger" sx={{ flex: 1, fontSize: 9 }}>■ Stop</Btn>
        <Btn small v="outline" color={T.cyan} onClick={onOpen} sx={{ flex: 1, fontSize: 9 }}>↗</Btn>
      </div>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

const Dashboard = ({ models, setScreen, setSelectedModel }) => {
  const [view, setView] = useState("training");
  const [activeTab, setActiveTab] = useState("all");
  const [logs, setLogs] = useState([
    "[14:32:01] click_clusters  Attempt 47 started",
    "[14:32:02] click_clusters  Master Reset running",
    "[14:32:03] click_clusters  Verify: popup clear ✓",
    "[14:32:04] click_clusters  Verify: heatmap found ✓",
    "[14:32:05] click_clusters  Confirm: match 82% ✓",
    "[14:32:06] click_clusters  Model attempting task...",
    "[14:32:09] click_clusters  Performance: 78.3 — no new best",
    "[14:32:09] click_clusters  Snapshot saved (att.47)",
    "[14:33:01] read_popup      Live run: XRPUSDT 15m ✓ 0.4s",
  ]);
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const trained = models.filter(m => m.status === "trained").length;
  const training = models.filter(m => m.status === "training").length;
  const drifting = models.filter(m => m.driftAlert).length;

  return <div style={{ padding: 24 }}>
    {/* Stats */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
      {[
        { l: "TOTAL MODELS", v: models.length, c: T.amber },
        { l: "TRAINED", v: trained, c: T.green },
        { l: "IN TRAINING", v: training, c: T.amber },
        { l: "DRIFT ALERTS", v: drifting, c: drifting > 0 ? T.red : T.textD },
      ].map(({ l, v, c }) => (
        <div key={l} style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          padding: "10px 14px", borderRadius: 2, borderLeft: `3px solid ${c}`
        }}>
          <div style={{ color: c, fontSize: 20, fontWeight: 700 }}>{v}</div>
          <div style={{ color: T.textD, fontSize: 8, letterSpacing: "0.12em" }}>{l}</div>
        </div>
      ))}
    </div>

    {/* View toggle */}
    <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${T.border}` }}>
      {["training", "daily"].map(v => (
        <button key={v} onClick={() => setView(v)} style={{
          padding: "8px 18px", background: "transparent", border: "none",
          borderBottom: view === v ? `2px solid ${T.amber}` : "2px solid transparent",
          color: view === v ? T.amber : T.textD, cursor: "pointer",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit"
        }}>
          {v === "training" ? "TRAINING VIEW" : "DAILY OPERATIONS"}
        </button>
      ))}
    </div>

    {view === "training" ? <>
      {/* Model cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
        gap: 12, marginBottom: 20
      }}>
        {models.map(m => {
          const c = sc(m.status);
          return <div key={m.id} style={{
            background: T.bg2, border: `1px solid ${T.border}`,
            borderTop: `2px solid ${c}`, borderRadius: 2, padding: 14, cursor: "pointer"
          }}
            onClick={() => { setSelectedModel(m); setScreen("model"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ color: T.white, fontSize: 12, fontWeight: 700 }}>{m.name}</div>
                <div style={{ color: T.textD, fontSize: 9 }}>{m.desc}</div>
              </div>
              <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{sl(m.status)}</span>
            </div>
            <div style={{ height: 28, marginBottom: 8 }}><MiniChart data={m.history} color={c} h={28} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
              {[
                { l: "SCORE", v: m.score > 0 ? m.score.toFixed(1) : "—", c },
                { l: "BEST", v: m.bestScore > 0 ? m.bestScore.toFixed(1) : "—", c: T.green },
                { l: "ATTEMPTS", v: m.attempts, c: T.textB },
                { l: "SR%", v: m.successRate > 0 ? `${m.successRate}%` : "—", c: T.textB },
              ].map(({ l, v, c: vc }) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ color: vc, fontSize: 12, fontWeight: 700 }}>{v}</div>
                  <div style={{ color: T.textD, fontSize: 7, letterSpacing: "0.1em" }}>{l}</div>
                </div>
              ))}
            </div>
            <ScoreBar value={m.score} color={c} />
            {m.driftAlert && <div style={{
              marginTop: 8, padding: "4px 8px", background: `${T.amber}15`,
              border: `1px solid ${T.amber}40`, borderRadius: 2, fontSize: 9, color: T.amber
            }}>
              ⚠ Drift detected — confidence dropping
            </div>}
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              {m.status === "training" ? <>
                <Btn small v="outline" sx={{ flex: 1, fontSize: 9 }}>⏸ Pause</Btn>
                <Btn small v="danger" sx={{ flex: 1, fontSize: 9 }}>■ Stop</Btn>
              </> : <>
                <Btn small v="outline" color={T.green} sx={{ flex: 1, fontSize: 9 }}>▶ Run</Btn>
                <Btn small v="outline" sx={{ flex: 1, fontSize: 9 }}>↺ Retrain</Btn>
              </>}
            </div>
          </div>;
        })}
      </div>

      {/* Terminal */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 2 }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {["all", ...models.filter(m => m.status === "training").map(m => m.name)].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 14px", background: "transparent", border: "none",
              borderBottom: activeTab === tab ? `2px solid ${T.amber}` : "2px solid transparent",
              color: activeTab === tab ? T.amber : T.textD, cursor: "pointer",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit"
            }}>
              {tab.toUpperCase()}
            </button>
          ))}
          <div style={{ marginLeft: "auto", padding: "7px 10px", display: "flex", gap: 8 }}>
            <Btn small v="ghost" sx={{ fontSize: 9 }}>Clear</Btn>
            <Btn small v="ghost" sx={{ fontSize: 9 }}>Export</Btn>
            <Btn small v="ghost" sx={{ fontSize: 9 }}>⏸ Scroll</Btn>
          </div>
        </div>
        <div ref={logRef} style={{
          height: 160, overflowY: "auto", padding: "8px 12px",
          fontFamily: "'Courier New',monospace", fontSize: 10, lineHeight: 1.8
        }}>
          {logs.filter(l => activeTab === "all" || l.includes(activeTab)).map((l, i) => (
            <div key={i} style={{
              color: l.includes("✓") || l.includes("saved") ? T.green :
                l.includes("Error") || l.includes("failed") ? T.red : T.textD
            }}>{l}</div>
          ))}
        </div>
      </div>
    </> : <>
      {/* Daily ops view */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Sec label="TODAY'S RUNS">
          {[
            { pair: "XRPUSDT", tf: "15m", status: "success", time: "2.3s", score: 91 },
            { pair: "BTCUSDT", tf: "1h", status: "success", time: "3.1s", score: 88 },
            { pair: "ETHUSDT", tf: "4h", status: "fail", time: "--", score: 0 },
          ].map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "8px 12px", marginBottom: 4,
              background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: r.status === "success" ? T.green : T.red, fontSize: 12 }}>
                  {r.status === "success" ? "✓" : "✗"}
                </span>
                <span style={{ color: T.white, fontSize: 11, fontWeight: 700 }}>{r.pair}</span>
                <span style={{ color: T.textD, fontSize: 10 }}>{r.tf}</span>
                <span style={{ color: T.textD, fontSize: 10 }}>{r.time}</span>
                {r.score > 0 && <span style={{ color: T.amber, fontSize: 10 }}>{r.score}pts</span>}
              </div>
              {r.status === "fail" && <Btn small v="outline" color={T.red}>Debug</Btn>}
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <Btn v="solid" full>▶ Run Agent Now</Btn>
          </div>
        </Sec>
        <Sec label="AGENT HEALTH">
          {models.filter(m => m.status === "trained" || m.status === "training").map(m => (
            <div key={m.id} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "8px 12px", marginBottom: 4,
              background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
            }}>
              <div>
                <div style={{ color: T.textB, fontSize: 11 }}>{m.name}</div>
                <div style={{ fontSize: 9, color: m.driftAlert ? T.amber : T.green }}>
                  {m.driftAlert ? `⚠ Declining (avg ${m.liveConfidence}%)` :
                    `● Confident (avg ${m.liveConfidence}%)`}
                </div>
              </div>
              {m.driftAlert && <Btn small v="outline" color={T.amber}>Retrain</Btn>}
            </div>
          ))}
        </Sec>
      </div>
    </>}
  </div>;
};

// ── DATA TAB ──────────────────────────────────────────────────────────────────

const DataTab = ({ model, updateModel }) => {
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [augmenting, setAugmenting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const doExtract = () => {
    setExtracting(true); setProgress(0);
    const iv = setInterval(() => setProgress(p => {
      if (p >= 100) {
        clearInterval(iv); setExtracting(false);
        updateModel({ frames: model.videos * 237 }); return 100;
      }
      return p + 2;
    }), 40);
  };

  const doHealthCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setCheckResult({ dups: 47, imbalance: true, corrupted: 0, total: model.frames });
    }, 1500);
  };

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Sec label="SCREEN REGION">
      <div style={{
        background: T.bg3, border: `1px solid ${T.border}`, padding: "12px 14px",
        borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 3 }}>
            This model only looks at this screen area</div>
          <div style={{ color: T.amber, fontSize: 11, fontFamily: "monospace" }}>
            {model.region || "Not defined yet"}</div>
        </div>
        <Btn small v="outline">🎯 Define Region</Btn>
      </div>
      <div style={{ marginTop: 6, fontSize: 9, color: T.textD, lineHeight: 1.7 }}>
        click_clusters → chart canvas only &nbsp;|&nbsp;
        read_popup → popup area only &nbsp;|&nbsp;
        open_coinglass → full screen
      </div>
    </Sec>

    <Sec label="REFERENCE FOLDER">
      <div style={{
        background: T.bg3, border: `1px solid ${T.border}`, padding: "10px 14px",
        borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ color: T.amber, fontSize: 10, fontFamily: "monospace" }}>
          📂 models/{model.name}/reference/</span>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small v="outline">Open Folder</Btn>
          <Btn small v="ghost">Copy Path</Btn>
        </div>
      </div>
    </Sec>

    <Sec label="ADD FILES">
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false);
          updateModel({ videos: model.videos + e.dataTransfer.files.length });
        }}
        style={{
          border: `2px dashed ${dragging ? T.amber : T.border}`, borderRadius: 3,
          padding: "28px", display: "flex", flexDirection: "column", alignItems: "center",
          gap: 8, cursor: "pointer", background: dragging ? `${T.amber}08` : T.bg0, transition: "all 0.2s"
        }}>
        <div style={{ fontSize: 24 }}>🎬</div>
        <div style={{ color: dragging ? T.amber : T.textD, fontSize: 12 }}>Drop videos or images here</div>
        <div style={{ color: T.textD, fontSize: 10 }}>.mp4 · .avi · .mov · .png · .jpg</div>
        <Btn small v="outline" sx={{ marginTop: 4 }}>Browse Files</Btn>
      </div>
      {model.videos > 0 && <div style={{ marginTop: 8, color: T.green, fontSize: 10 }}>
        ✓ {model.videos} videos loaded ({model.images} images)</div>}
    </Sec>

    <Sec label="PREPROCESSING PIPELINE">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>COLOR SPACE</div>
            <Sel value="RGB" onChange={() => { }}
              options={[{ value: "RGB", label: "RGB" }, { value: "Grayscale", label: "Grayscale" }, { value: "HSV", label: "HSV" }]}
              sx={{ width: "100%" }} />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>NORMALIZE</div>
            <Sel value="0-1" onChange={() => { }}
              options={[{ value: "0-1", label: "0 to 1" }, { value: "-1-1", label: "-1 to 1" }, { value: "none", label: "None" }]}
              sx={{ width: "100%" }} />
          </div>
        </div>
        <Toggle value={true} onChange={() => { }} label="Contrast enhancement (helps dark heatmaps)" />
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <Btn small v="outline">Preview on Sample Frame</Btn>
          <Btn small v="ghost">Save Config</Btn>
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: T.green }}>
          ✓ Same pipeline applies during training AND live inference</div>
      </div>
    </Sec>

    <Sec label="FRAME EXTRACTION">
      {extracting ? <>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: T.textD }}>
          <span>Extracting frames...</span>
          <span style={{ color: T.amber }}>{progress}%</span>
        </div>
        <ScoreBar value={progress} color={T.amber} height={6} />
      </> : <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {model.frames > 0 ? <span style={{ color: T.green, fontSize: 11 }}>
            ✓ {model.frames.toLocaleString()} frames ready</span> :
            <span style={{ color: T.textD, fontSize: 11 }}>No frames extracted yet</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {model.frames > 0 && <Btn small v="ghost">View Frames</Btn>}
          <Btn small v="outline" onClick={doExtract} disabled={model.videos === 0}>
            Extract All Frames</Btn>
        </div>
      </div>}
    </Sec>

    <Sec label="DATA AUGMENTATION">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[
            { l: "Brightness ±20%", on: true }, { l: "Color jitter ±15%", on: true },
            { l: "Zoom ±10%", on: true }, { l: "Horizontal flip", on: true },
            { l: "Rotation", on: false }, { l: "Gaussian noise", on: false },
          ].map(({ l, on }) => (
            <label key={l} style={{
              display: "flex", gap: 6, alignItems: "center", cursor: "pointer",
              padding: "5px 10px", background: on ? `${T.amber}10` : T.bg2,
              border: `1px solid ${on ? T.amber + "40" : T.border}`, borderRadius: 2
            }}>
              <input type="checkbox" defaultChecked={on} style={{ accentColor: T.amber }} />
              <span style={{ color: on ? T.amber : T.textD, fontSize: 10 }}>{l}</span>
            </label>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.textD, marginBottom: 10 }}>
          Current: <span style={{ color: T.textB }}>{model.frames}</span> samples →
          After augmentation: <span style={{ color: T.green }}>{model.frames * 4}</span> samples (4×)
        </div>
        <Btn small v="outline" onClick={() => { setAugmenting(true); setTimeout(() => setAugmenting(false), 2000); }}>
          {augmenting ? "Augmenting..." : "Apply Augmentation"}</Btn>
      </div>
    </Sec>

    <Sec label="DATASET HEALTH CHECK">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: T.textD, fontSize: 11 }}>Run before training to validate data quality</span>
        <Btn small v="outline" onClick={doHealthCheck} disabled={model.frames === 0 || checking}>
          {checking ? "Scanning..." : "Run Health Check"}</Btn>
      </div>
      {checkResult && <div style={{
        background: T.bg3, border: `1px solid ${T.border}`,
        padding: 12, borderRadius: 2, fontSize: 10, lineHeight: 1.8
      }}>
        <div style={{ color: T.green }}>✓ No corrupted images</div>
        <div style={{ color: T.green }}>✓ All images correct size (224×224)</div>
        {checkResult.dups > 0 && <div style={{ color: T.amber }}>
          ⚠ {checkResult.dups} near-duplicate frames detected
          &nbsp;<Btn small v="outline" color={T.amber} sx={{ fontSize: 8, padding: "1px 6px" }}>Remove Duplicates</Btn>
        </div>}
        {checkResult.imbalance && <div style={{ color: T.amber }}>
          ⚠ Click imbalance: 68% clicks in center-right
          &nbsp;<Btn small v="ghost" sx={{ fontSize: 8, padding: "1px 6px" }}>View Details</Btn>
        </div>}
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <Btn small v="solid">Fix All Issues</Btn>
          <Btn small v="ghost">Continue Anyway</Btn>
        </div>
      </div>}
    </Sec>
  </div>;
};

// ── RESET TAB ─────────────────────────────────────────────────────────────────

const ResetTab = ({ model }) => {
  const [threshold, setThreshold] = useState(75);
  const [onFail, setOnFail] = useState("retry");
  const [testResult, setTestResult] = useState(null);

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <InfoBanner>
      The reset system runs automatically before EVERY training attempt.
      Three layers guarantee the app is in a clean known state before each attempt begins.
      Without this, training corrupts itself with broken starting states.
    </InfoBanner>

    <Sec label="MASTER RESET — Layer 1">
      <div style={{ background: T.bg3, border: `1px solid ${T.cyan}30`, borderRadius: 2, padding: 14 }}>
        <div style={{ color: T.textD, fontSize: 10, lineHeight: 1.7, marginBottom: 10 }}>
          Runs first. Replays your recorded sequence from the Actions tab
          to force the app back to a known clean state. Uses fixed steps
          that work from ANY broken state.
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>ACTIVE RESET SEQUENCE</div>
          <Sel value="Reset Chart State" onChange={() => { }}
            options={[
              ...model.actions.filter(a => a.isReset).map(a => ({ value: a.id, label: a.name })),
              { value: "none", label: "— not set —" }
            ]} sx={{ width: "100%" }} />
        </div>
        {model.actions.filter(a => a.isReset).map(seq => (
          <div key={seq.id} style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {(seq.seq || []).map((s, i) => (
              <span key={i} style={{
                fontSize: 9, padding: "2px 7px", background: T.bg2,
                border: `1px solid ${T.border}`, borderRadius: 2, color: T.textD
              }}>
                {s.type === "key" ? `⌨️ ${s.key}` : s.type === "scroll" ? `🖱️ scroll(${s.amount})` :
                  s.type === "click" ? `👆 (${s.x},${s.y})` : s.type === "wait" ? `⏱️ ${s.seconds}s` : s.type}
              </span>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small v="outline" color={T.cyan}>Change Sequence</Btn>
          <Btn small v="outline" color={T.green}>▶ Test Master Reset</Btn>
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: T.green }}>Last test: ✓ Completed in 2.3s</div>
      </div>
    </Sec>

    <Sec label="VERIFY — Layer 2">
      <div style={{ background: T.bg3, border: `1px solid ${T.amber}30`, borderRadius: 2, padding: 14 }}>
        <div style={{ color: T.textD, fontSize: 10, lineHeight: 1.7, marginBottom: 12 }}>
          Runs after Master Reset. Instant pixel-level checks that confirm
          the reset actually worked. No AI — pure image analysis.
          Fast and reliable.
        </div>
        {[
          { l: "No popup visible", desc: "Detects white boxes or tooltips" },
          { l: "Heatmap data present", desc: "Red pixels > 5% of chart area" },
          { l: "Chart not over-zoomed", desc: "Red coverage < 60%" },
          { l: "App window focused", desc: "Window is foreground and active" },
        ].map(({ l, desc }) => (
          <div key={l} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}`
          }}>
            <div>
              <span style={{ color: T.textB, fontSize: 11 }}>✓ {l}</span>
              <div style={{ color: T.textD, fontSize: 9 }}>{desc}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Toggle value={true} onChange={() => { }} />
              <Btn small v="ghost" sx={{ fontSize: 9 }}>Test</Btn>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <Btn small v="outline">+ Add Custom Check</Btn>
          <Btn small v="outline" color={T.green}>▶ Run All Checks Now</Btn>
        </div>
        <div style={{
          marginTop: 8, padding: "8px 10px", background: `${T.amber}10`,
          border: `1px solid ${T.amber}30`, borderRadius: 2, fontSize: 9, color: T.textD
        }}>
          If any check fails → auto-recovery (scroll out + Escape) → re-check once → if still failing → trigger Confirm alert
        </div>
      </div>
    </Sec>

    <Sec label="CONFIRM — Layer 3">
      <div style={{ background: T.bg3, border: `1px solid ${T.green}30`, borderRadius: 2, padding: 14 }}>
        <div style={{ color: T.textD, fontSize: 10, lineHeight: 1.7, marginBottom: 12 }}>
          Final gate before each attempt is allowed to start.
          Compares current screenshot to your Success Reference images
          from the Goals tab. Only allows attempt if screen looks correct.
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>USING GOAL IMAGE</div>
          <div style={{ color: T.green, fontSize: 11 }}>
            {model.goals[0] || "⚠ No goal image — set one in Goals tab"}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: 6, fontSize: 10
          }}>
            <span style={{ color: T.text }}>Required match threshold</span>
            <span style={{ color: T.amber, fontWeight: 700 }}>{threshold}%</span>
          </div>
          <input type="range" min={50} max={99} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: "100%", accentColor: T.amber }} />
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 9, color: T.textD, marginTop: 4
          }}>
            <span>50% lenient</span><span>99% strict</span>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 6 }}>ON CONFIRM FAIL</div>
          {[
            { v: "retry", l: "Retry Master Reset (up to 3×)", recommended: true },
            { v: "skip", l: "Skip this attempt" },
            { v: "pause", l: "Pause training and alert me" },
          ].map(({ v, l, recommended }) => (
            <label key={v} style={{
              display: "flex", gap: 8, alignItems: "center",
              marginBottom: 6, cursor: "pointer"
            }}>
              <input type="radio" name="onfail" value={v}
                checked={onFail === v} onChange={() => setOnFail(v)}
                style={{ accentColor: T.amber }} />
              <span style={{ color: T.text, fontSize: 10 }}>{l}</span>
              {recommended && <Chip color={T.green}>recommended</Chip>}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small v="outline" color={T.green}
            onClick={() => setTestResult({ score: 84, pass: true })}>
            ▶ Test Confirm Now
          </Btn>
        </div>
        {testResult && <div style={{
          marginTop: 8, fontSize: 10,
          color: testResult.pass ? T.green : T.red
        }}>
          {testResult.pass ? `✓ ${testResult.score}% match — PASSES threshold` :
            `✗ ${testResult.score}% match — BELOW threshold`}
        </div>}
      </div>
    </Sec>
  </div>;
};

// ── TRAIN TAB ─────────────────────────────────────────────────────────────────

const TrainTab = ({ model, updateModel }) => {
  const [running, setRunning] = useState(model.status === "training");
  const [paused, setPaused] = useState(false);
  const [iter, setIter] = useState(model.attempts);
  const [score, setScore] = useState(model.score);
  const [best, setBest] = useState(model.bestScore);
  const [hist, setHist] = useState(model.history);
  const [log, setLog] = useState(["System ready. Configure settings and press BEGIN TRAINING LOOP."]);
  const [mode, setMode] = useState("self-improving");
  const [stopCond, setStopCond] = useState("manual");
  const [stopVal, setStopVal] = useState("95");
  const [resetStatus, setResetStatus] = useState("idle");
  const [tfVariety, setTfVariety] = useState({ XRPUSDT_15m: true, BTCUSDT_1h: true, ETHUSDT_4h: true });
  const [pipelineTrain, setPipelineTrain] = useState(false);
  const [scheduler, setScheduler] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [overfit, setOverfit] = useState({ train: 78.3, val: 76.1, gap: 2.2, status: "healthy" });
  const timerRef = useRef(null);
  const logRef = useRef(null);

  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString();
    setLog(p => [...p.slice(-60), `[${time}] ${msg}`]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 30);
  }, []);

  const startTraining = (hw = 'cpu') => {
    setRunning(true); setPaused(false);
    addLog(`Begin Training Loop started — ${hw === 'gpu' ? 'GPU Accelerated' : 'CPU Standard'} Mode`);
    addLog(`Stop condition: ${stopCond === "manual" ? "Manual stop" : `Score ≥ ${stopVal}`}`);
    timerRef.current = setInterval(() => {
      setIter(i => {
        const ni = i + 1;
        const rseq = ["resetting", "verifying", "ready"];
        rseq.forEach((s, idx) => setTimeout(() => setResetStatus(s), idx * 400));
        setTimeout(() => setResetStatus("idle"), 1400);
        setScore(s => {
          const noise = (Math.random() - 0.3) * 3;
          const trend = (100 - s) * 0.07;
          const ns = Math.max(0, Math.min(100, s + trend + noise));
          setBest(b => {
            if (ns > b) { addLog(`✓ New best! ${ns.toFixed(1)} — model saved`); return ns; }
            return b;
          });
          setHist(h => [...h.slice(-49), ns]);
          if (ni % 5 === 0) addLog(`Attempt ${ni}: score=${ns.toFixed(1)}`);
          setOverfit(o => ({ ...o, train: ns, val: ns - Math.random() * 3, gap: Math.random() * 4 }));
          updateModel({ score: ns, attempts: ni, status: "training" });
          return ns;
        });
        return ni;
      });
    }, 1600);
  };

  const stopTraining = () => {
    setRunning(false); clearInterval(timerRef.current);
    addLog("Training stopped — Training Snapshot saved");
    updateModel({ status: best > 80 ? "trained" : "training" });
  };

  const resetColors = { idle: T.textD, resetting: T.amber, verifying: T.cyan, ready: T.green };
  const trend = hist.length >= 5 ? hist[hist.length - 1] - hist[hist.length - 5] : 0;

  return <div style={{ display: "flex", gap: 16 }}>
    {/* Left config */}
    <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Sec label="TRAINING MODE">
        {[
          { v: "self-improving", l: "Self-Improving Loop", d: "Reset & retry until perfect" },
          { v: "single", l: "Single Pass", d: "Train once on dataset" },
          { v: "finetune", l: "Fine-tune Existing", d: "Improve current model" },
        ].map(({ v, l, d }) => (
          <label key={v} style={{
            display: "flex", gap: 8, padding: "8px 10px", marginBottom: 4,
            background: mode === v ? `${T.amber}12` : T.bg3,
            border: `1px solid ${mode === v ? T.amber + "40" : T.border}`,
            borderRadius: 2, cursor: "pointer"
          }}>
            <input type="radio" name="mode" value={v} checked={mode === v}
              onChange={() => setMode(v)} style={{ accentColor: T.amber, marginTop: 2 }} />
            <div>
              <div style={{ color: mode === v ? T.amber : T.textB, fontSize: 11, fontWeight: 700 }}>{l}</div>
              <div style={{ color: T.textD, fontSize: 9 }}>{d}</div>
            </div>
          </label>
        ))}
      </Sec>

      <Sec label="STOP CONDITION">
        {[
          { v: "manual", l: "Run forever (manual stop)" },
          { v: "score", l: "Stop at score:" },
          { v: "attempts", l: "Stop after attempts:" },
          { v: "satisfied", l: "Stop when I say so" },
        ].map(({ v, l }) => (
          <label key={v} style={{
            display: "flex", gap: 8, alignItems: "center",
            marginBottom: 6, cursor: "pointer"
          }}>
            <input type="radio" name="stop" value={v} checked={stopCond === v}
              onChange={() => setStopCond(v)} style={{ accentColor: T.amber }} />
            <span style={{ color: T.text, fontSize: 10 }}>{l}</span>
            {(v === "score" || v === "attempts") && stopCond === v &&
              <Inp value={stopVal} onChange={setStopVal} sx={{ width: 55, fontSize: 10, padding: "3px 6px" }} />}
          </label>
        ))}
      </Sec>

      <Sec label="TRAINING VARIETY">
        <div style={{ fontSize: 9, color: T.textD, marginBottom: 8, lineHeight: 1.6 }}>
          Rotate through pairs/timeframes so model learns general patterns, not pair-specific ones.
        </div>
        {Object.entries(tfVariety).map(([k, v]) => (
          <label key={k} style={{
            display: "flex", gap: 8, alignItems: "center",
            marginBottom: 4, cursor: "pointer"
          }}>
            <input type="checkbox" checked={v}
              onChange={e => setTfVariety(p => ({ ...p, [k]: e.target.checked }))}
              style={{ accentColor: T.amber }} />
            <span style={{ color: T.text, fontSize: 10 }}>{k.replace("_", " ")}</span>
          </label>
        ))}
        <Btn small v="ghost" sx={{ marginTop: 4 }}>+ Add Pair</Btn>
      </Sec>

      <Sec label="PIPELINE TRAINING">
        <Toggle value={pipelineTrain} onChange={setPipelineTrain}
          label="Train alongside another model" />
        {pipelineTrain && <div style={{ marginTop: 8 }}>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>PAIRED WITH</div>
          <Sel value="assess_chart" onChange={() => { }}
            options={[{ value: "assess_chart", label: "assess_chart" }, { value: "m1", label: "open_coinglass" }]}
            sx={{ width: "100%" }} />
          <div style={{ marginTop: 6, fontSize: 9, color: T.textD, lineHeight: 1.6 }}>
            Both models rewarded from combined pipeline result. Better coordination.
          </div>
        </div>}
      </Sec>

      <Sec label="AUTO-RECORD LIVE RUNS">
        <Toggle value={autoRecord} onChange={setAutoRecord}
          label="Save every attempt as replay" />
        {autoRecord && <div style={{ marginTop: 6, fontSize: 9, color: T.textD, lineHeight: 1.6 }}>
          ✓ Successful runs auto-added to training data<br />
          Model improves from real usage over time
        </div>}
      </Sec>

      <Sec label="TRAINING SCHEDULER">
        <Toggle value={scheduler} onChange={setScheduler} label="Scheduled training" />
        {scheduler && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>START TIME</div>
            <Inp value="02:00 AM" onChange={() => { }} />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>MAX ATTEMPTS</div>
            <Inp value="50" onChange={() => { }} sx={{ width: "100%" }} />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>STOP BY</div>
            <Inp value="06:00 AM" onChange={() => { }} />
          </div>
        </div>}
      </Sec>

      {!running ?
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn v="solid" full onClick={() => startTraining('cpu')} sx={{ fontSize: 11, padding: 12 }}>
            ▶ START TRAINING (CPU)
          </Btn>
          <Btn v="solid" color={T.cyan} full onClick={() => startTraining('gpu')} sx={{ fontSize: 11, padding: 12 }}>
            🚀 GPU TRAIN
          </Btn>
        </div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="outline" onClick={() => setPaused(p => !p)} sx={{ flex: 1 }}>
              {paused ? "▶ RESUME" : "⏸ PAUSE"}
            </Btn>
            <Btn v="danger" onClick={stopTraining} sx={{ flex: 1 }}>■ STOP</Btn>
          </div>
          <Btn v="green" full onClick={() => { stopTraining(); addLog("✅ User satisfied — best model saved"); }}>
            ✓ I AM SATISFIED — SAVE & STOP
          </Btn>
        </div>
      }
    </div>

    {/* Right monitor */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {[
          { l: "ATTEMPT", v: iter, c: T.blue },
          { l: "SCORE", v: score > 0 ? score.toFixed(1) : "—", c: sc(model.status) },
          { l: "BEST", v: best > 0 ? best.toFixed(1) : "—", c: T.green },
          {
            l: "TREND", v: trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1),
            c: trend > 1 ? T.green : trend < -1 ? T.red : T.textD
          },
        ].map(({ l, v, c }) => (
          <div key={l} style={{
            background: T.bg3, border: `1px solid ${T.border}`,
            padding: "10px 12px", borderRadius: 2, borderTop: `2px solid ${c}`
          }}>
            <div style={{ color: c, fontSize: 18, fontWeight: 700 }}>{v}</div>
            <div style={{ color: T.textD, fontSize: 8, letterSpacing: "0.1em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 12, borderRadius: 2 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: 6, fontSize: 9, color: T.textD
        }}>
          <span>PERFORMANCE HISTORY</span>
          <span>{hist.length} attempts</span>
        </div>
        <MiniChart data={hist} color={sc(model.status)} h={70} />
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 4, fontSize: 9, color: T.textD
        }}>
          <span>0</span>
          <span style={{ color: T.amber }}>Target: {stopVal}</span>
          <span>100</span>
        </div>
      </div>

      {/* Reset pipeline */}
      {running && <div style={{
        display: "flex", gap: 6, alignItems: "center", padding: "8px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2, fontSize: 9
      }}>
        <span style={{ color: T.textD, marginRight: 4 }}>RESET PIPELINE:</span>
        {["idle", "resetting", "verifying", "ready"].map((s, i) => <React.Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: resetStatus === s ? resetColors[s] : T.border,
              boxShadow: resetStatus === s ? `0 0 6px ${resetColors[s]}` : "none",
              transition: "all 0.3s"
            }} />
            <span style={{
              color: resetStatus === s ? resetColors[s] : T.textD,
              textTransform: "uppercase"
            }}>{s}</span>
          </div>
          {i < 3 && <span key={`arr${i}`} style={{ color: T.border }}>›</span>}
        </React.Fragment>)}
      </div>}

      {/* Overfitting monitor */}
      <div style={{
        background: T.bg3, border: `1px solid ${overfit.gap > 8 ? T.red : T.border}`,
        padding: 12, borderRadius: 2
      }}>
        <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.1em", marginBottom: 8 }}>
          OVERFITTING MONITOR</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { l: "Training", v: overfit.train.toFixed(1), c: T.amber },
            { l: "Validation", v: overfit.val.toFixed(1), c: T.cyan },
            { l: "Gap", v: overfit.gap.toFixed(1), c: overfit.gap > 8 ? T.red : T.green },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ color: c, fontSize: 14, fontWeight: 700 }}>{v}</div>
              <div style={{ color: T.textD, fontSize: 8 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: overfit.gap > 8 ? T.red : T.green }}>
          {overfit.gap > 8 ? "⚠ Overfitting detected — consider stopping" : "✓ No overfitting detected"}
        </div>
      </div>

      {/* Log */}
      <div style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 2, flex: 1 }}>
        <div style={{
          padding: "6px 12px", borderBottom: `1px solid ${T.border}`,
          fontSize: 9, color: T.textD, letterSpacing: "0.1em", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span>TRAINING LOG</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn small v="ghost" sx={{ fontSize: 8 }}>Clear</Btn>
            <Btn small v="ghost" sx={{ fontSize: 8 }}>Export</Btn>
          </div>
        </div>
        <div ref={logRef} style={{
          height: 140, overflowY: "auto", padding: "8px 12px",
          fontFamily: "'Courier New',monospace", fontSize: 10, lineHeight: 1.8
        }}>
          {log.map((l, i) => (
            <div key={i} style={{
              color: l.includes("✓") || l.includes("✅") ? T.green :
                l.includes("✗") || l.includes("Error") ? T.red : T.textD
            }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  </div>;
};

// ── SCORING TAB ───────────────────────────────────────────────────────────────

const ScoringTab = () => {
  const [mode, setMode] = useState("auto");
  const [l1, setL1] = useState(true);
  const [l2, setL2] = useState(true);
  const [l3, setL3] = useState(true);
  const [diminish, setDiminish] = useState(true);
  const [curriculum, setCurriculum] = useState(true);
  const [penaltyWeight, setPenaltyWeight] = useState(50);
  const [timing, setTiming] = useState("dense");
  const [confidence, setConfidence] = useState(65);

  const rewards = [
    { name: "Cluster found", cond: "cluster_count > 0", pts: 10 },
    { name: "Value read correctly", cond: "ocr_success", pts: 15 },
    { name: "Cluster > 1M USD", cond: "max_value > 1000000", pts: 35 },
    { name: "Found biggest wall", cond: "found_largest", pts: 50 },
    { name: "Completed < 30s", cond: "duration < 30", pts: 20 },
  ];
  const penalties = [
    { name: "Missed wall > 1M", cond: "missed_large", pts: 30 },
    { name: "Wrong area click", cond: "outside_zone", pts: 15 },
    { name: "Took > 60 seconds", cond: "duration > 60", pts: 20 },
    { name: "App crashed", cond: "app_error", pts: 50 },
  ];

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Sec label="SCORING MODE">
      {[
        { v: "auto", l: "Auto-Score", d: "Works immediately — no configuration needed" },
        { v: "manual", l: "Manual Rules", d: "Configure your own rewards and penalties" },
        { v: "goal", l: "Goal Match Only", d: "Uses only Success Reference images" },
      ].map(({ v, l, d }) => (
        <label key={v} style={{
          display: "flex", gap: 10, padding: "10px 12px", marginBottom: 6,
          background: mode === v ? `${T.amber}12` : T.bg3,
          border: `1px solid ${mode === v ? T.amber + "40" : T.border}`,
          borderRadius: 2, cursor: "pointer", alignItems: "flex-start"
        }}>
          <input type="radio" name="smode" value={v} checked={mode === v}
            onChange={() => setMode(v)} style={{ accentColor: T.amber, marginTop: 2 }} />
          <div>
            <div style={{ color: mode === v ? T.amber : T.textB, fontSize: 11, fontWeight: 700 }}>{l}</div>
            <div style={{ color: T.textD, fontSize: 9 }}>{d}</div>
          </div>
        </label>
      ))}
    </Sec>

    <Sec label="AUTO-SCORE BREAKDOWN">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 12, borderRadius: 2 }}>
        {[
          { l: "Task completed without error", pts: "+40" },
          { l: "Output produced (not empty)", pts: "+30" },
          { l: "Completed within time limit", pts: "+20" },
          { l: "Goal image match", pts: "+10" },
        ].map(({ l, pts }) => (
          <div key={l} style={{
            display: "flex", justifyContent: "space-between",
            padding: "5px 0", borderBottom: `1px solid ${T.border}`, fontSize: 10
          }}>
            <span style={{ color: T.text }}>{l}</span>
            <span style={{ color: T.green, fontWeight: 700 }}>{pts}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span style={{ color: T.textD }}>Total possible:</span>
          <span style={{ color: T.amber, fontWeight: 700 }}>100 points</span>
        </div>
      </div>
    </Sec>

    {mode === "manual" && <>
      <Sec label="LAYER 1 — GOAL IMAGE MATCH">
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 12px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          <div>
            <div style={{ color: T.textB, fontSize: 11 }}>Goal Image Similarity</div>
            <div style={{ color: T.textD, fontSize: 9 }}>Auto-compares attempt result to Success Reference</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: T.textD, fontSize: 10 }}>Weight: 30%</span>
            <Toggle value={l1} onChange={setL1} />
          </div>
        </div>
      </Sec>

      <Sec label="LAYER 2 — REWARD RULES">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: T.textD, fontSize: 10 }}>Weight: 50%</span>
          <Toggle value={l2} onChange={setL2} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ color: T.green, fontSize: 9, letterSpacing: "0.1em", marginBottom: 6 }}>
              REWARDS</div>
            {rewards.map(r => (
              <div key={r.name} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "6px 8px", marginBottom: 3,
                background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
              }}>
                <div>
                  <div style={{ color: T.textB, fontSize: 10 }}>{r.name}</div>
                  <div style={{ color: T.textD, fontSize: 8 }}>{r.cond}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>+{r.pts}</span>
                  <Btn small v="ghost" color={T.red} sx={{ fontSize: 8, padding: "1px 5px" }}>✕</Btn>
                </div>
              </div>
            ))}
            <Btn small v="outline" color={T.green} sx={{ marginTop: 4 }}>+ Add Reward</Btn>
          </div>
          <div>
            <div style={{ color: T.red, fontSize: 9, letterSpacing: "0.1em", marginBottom: 6 }}>
              PENALTIES</div>
            {penalties.map(p => (
              <div key={p.name} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "6px 8px", marginBottom: 3,
                background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
              }}>
                <div>
                  <div style={{ color: T.textB, fontSize: 10 }}>{p.name}</div>
                  <div style={{ color: T.textD, fontSize: 8 }}>{p.cond}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: T.red, fontSize: 11, fontWeight: 700 }}>-{p.pts}</span>
                  <Btn small v="ghost" color={T.red} sx={{ fontSize: 8, padding: "1px 5px" }}>✕</Btn>
                </div>
              </div>
            ))}
            <Btn small v="outline" color={T.red} sx={{ marginTop: 4 }}>+ Add Penalty</Btn>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: 6, fontSize: 10
          }}>
            <span style={{ color: T.text }}>Penalty weight</span>
            <span style={{ color: T.amber }}>{penaltyWeight < 40 ? "1:1 balanced" : penaltyWeight < 70 ? "1:2 strict" : "1:3 very strict"}</span>
          </div>
          <input type="range" min={30} max={80} value={penaltyWeight}
            onChange={e => setPenaltyWeight(Number(e.target.value))}
            style={{ width: "100%", accentColor: T.amber }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.textD, marginTop: 4 }}>
            <span>Lenient</span><span>Strict</span>
          </div>
        </div>
      </Sec>

      <Sec label="LAYER 3 — BEHAVIOR ANALYSIS">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: T.textD, fontSize: 10 }}>Weight: 20% — automatic, no config needed</span>
          <Toggle value={l3} onChange={setL3} />
        </div>
        {["Click spread analysis", "Sequence quality", "Retry detection", "Time distribution", "State management"].map(c => (
          <div key={c} style={{
            display: "flex", justifyContent: "space-between",
            padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 10
          }}>
            <span style={{ color: T.text }}>✓ {c}</span>
            <Toggle value={true} onChange={() => { }} />
          </div>
        ))}
      </Sec>
    </>}

    <Sec label="DIMINISHING RETURNS">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", padding: "10px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div>
          <div style={{ color: T.textB, fontSize: 11, marginBottom: 3 }}>
            Prevents clicking same area repeatedly for easy points</div>
          <div style={{ color: T.textD, fontSize: 9, lineHeight: 1.6 }}>
            2nd click same area: 10% of reward<br />
            3rd click same area: penalty instead
          </div>
        </div>
        <Toggle value={diminish} onChange={setDiminish} />
      </div>
    </Sec>

    <Sec label="CURRICULUM MODE">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 10
      }}>
        <div>
          <div style={{ color: T.textB, fontSize: 11 }}>Start easy, get harder as model improves</div>
          <div style={{ color: T.textD, fontSize: 9 }}>Prevents overwhelming model early in training</div>
        </div>
        <Toggle value={curriculum} onChange={setCurriculum} />
      </div>
      {curriculum && [
        { phase: "Phase 1", range: "Attempts 1-20", layers: "Layer 1 only" },
        { phase: "Phase 2", range: "Attempts 21-60", layers: "Layers 1 + 2" },
        { phase: "Phase 3", range: "Attempts 61+", layers: "All layers" },
      ].map(({ phase, range, layers }) => (
        <div key={phase} style={{
          display: "flex", gap: 12, padding: "7px 10px",
          marginBottom: 4, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          <span style={{ color: T.amber, fontSize: 10, fontWeight: 700, width: 60 }}>{phase}</span>
          <span style={{ color: T.textD, fontSize: 10, width: 100 }}>{range}</span>
          <span style={{ color: T.text, fontSize: 10 }}>{layers}</span>
        </div>
      ))}
    </Sec>

    <Sec label="REWARD TIMING">
      {[
        { v: "dense", l: "Dense", d: "Score after every action — faster learning" },
        { v: "sparse", l: "Sparse", d: "Score at attempt end only — better strategy" },
        { v: "mixed", l: "Mixed", d: "Score at key checkpoints" },
      ].map(({ v, l, d }) => (
        <label key={v} style={{ display: "flex", gap: 8, marginBottom: 6, cursor: "pointer" }}>
          <input type="radio" name="timing" value={v} checked={timing === v}
            onChange={() => setTiming(v)} style={{ accentColor: T.amber }} />
          <span style={{ color: T.text, fontSize: 10 }}><strong style={{ color: T.textB }}>{l}</strong> — {d}</span>
        </label>
      ))}
    </Sec>

    <Sec label="CONFIDENCE THRESHOLD">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}>
          <span style={{ color: T.text }}>Only act if model confidence above:</span>
          <span style={{ color: T.amber, fontWeight: 700 }}>{confidence}%</span>
        </div>
        <input type="range" min={30} max={95} value={confidence}
          onChange={e => setConfidence(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.amber, marginBottom: 8 }} />
        <div style={{ fontSize: 9, color: T.textD, lineHeight: 1.7 }}>
          Below {confidence}%: model skips rather than guesses<br />
          Estimated improvement: +8% success rate
        </div>
        <Btn small v="outline" color={T.cyan} sx={{ marginTop: 8 }}>Apply Recommended: 68%</Btn>
      </div>
    </Sec>

    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Btn v="ghost">Reset to Defaults</Btn>
      <Btn v="outline">Copy from Model ▼</Btn>
      <Btn v="solid">Save Scoring Config</Btn>
    </div>
  </div>;
};

// ── GOALS TAB ─────────────────────────────────────────────────────────────────

const GoalsTab = ({ model }) => {
  const [threshold, setThreshold] = useState(75);
  const [heatmap, setHeatmap] = useState(false);

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <InfoBanner>
      Upload screenshots showing what success looks like. After each training
      attempt the system compares the result to these images. Closer match = higher score.
      Also used by the Confirm layer of the Reset system to verify clean starting state.
    </InfoBanner>

    <Sec label="SUCCESS REFERENCE IMAGES">
      <div style={{
        border: `2px dashed ${T.border}`, borderRadius: 3, padding: "24px",
        textAlign: "center", marginBottom: 12, cursor: "pointer", background: T.bg0
      }}>
        <div style={{ fontSize: 20, marginBottom: 6 }}>🎯</div>
        <div style={{ color: T.textD, fontSize: 11 }}>
          Drop screenshots of what success looks like</div>
        <div style={{ color: T.textD, fontSize: 9, marginTop: 4 }}>
          Take screenshots when Coinglass is in perfect starting state</div>
        <Btn small v="outline" sx={{ marginTop: 10 }}>Browse Files</Btn>
      </div>
      {model.goals.map(g => (
        <div key={g} style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "10px 12px", marginBottom: 6,
          background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              width: 48, height: 36, background: `linear-gradient(135deg,${T.bg2},${T.bg0})`,
              border: `1px solid ${T.border}`, borderRadius: 2, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 14
            }}>🎯</div>
            <div>
              <div style={{ color: T.textB, fontSize: 11 }}>{g}</div>
              <div style={{ color: T.green, fontSize: 9 }}>Last match: 82% ✓</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn small v="ghost">Preview</Btn>
            <Btn small v="ghost" color={T.red}>Remove</Btn>
          </div>
        </div>
      ))}
    </Sec>

    <Sec label="SIMILARITY THRESHOLD">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
          <span style={{ color: T.text }}>Match required to count as success</span>
          <span style={{ color: T.amber, fontWeight: 700 }}>{threshold}%</span>
        </div>
        <input type="range" min={50} max={99} value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.amber }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.textD, marginTop: 4 }}>
          <span>50% — lenient</span><span>99% — strict</span>
        </div>
      </div>
    </Sec>

    <Sec label="CONFIDENCE HEATMAP">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ color: T.textD, fontSize: 10, lineHeight: 1.7, marginBottom: 10 }}>
          Visual map showing where the model is confident vs uncertain across the chart.
          Deep green = high confidence. Yellow = uncertain. Nothing = model sees nothing here.
          Use to identify which areas need more training data.
        </div>
        <Btn small v="outline" onClick={() => setHeatmap(true)}>
          🔥 Generate Confidence Heatmap</Btn>
        {heatmap && <div style={{
          marginTop: 10, padding: "10px", background: T.bg0,
          border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {["Deep green = very confident", "Light green = moderate",
              "Yellow = uncertain"].map(l => (
                <span key={l} style={{
                  fontSize: 8, color: T.textD, padding: "2px 6px",
                  background: T.bg3, borderRadius: 2
                }}>{l}</span>
              ))}
          </div>
          <div style={{
            height: 80, background: `linear-gradient(135deg,
            ${T.green}40 0%,${T.green}20 30%,${T.amber}20 60%,transparent 80%)`,
            borderRadius: 2, display: "flex", alignItems: "center",
            justifyContent: "center", color: T.textD, fontSize: 10
          }}>
            [Heatmap visualization — runs on live Coinglass screen]
          </div>
        </div>}
      </div>
    </Sec>

    <Sec label="TEST GOAL MATCHING">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div style={{ fontSize: 10, color: T.textD }}>
          Compare your current screen to goal images right now</div>
        <Btn small v="outline">Test Current Screen</Btn>
      </div>
      {model.goals.length > 0 && <div style={{
        marginTop: 8, padding: "8px 12px",
        background: T.bg0, borderRadius: 2, fontSize: 10, color: T.green
      }}>
        ✓ Best match: 84% to "{model.goals[0]}" — PASSES threshold ({threshold}%)
      </div>}
    </Sec>
  </div>;
};

// ── RESULTS TAB ───────────────────────────────────────────────────────────────

const ResultsTab = ({ model }) => {
  const [compare, setCompare] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const errTotal = Object.values(model.errors).reduce((a, b) => a + b, 0);

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Sec label="MODEL VERSIONS">
      {model.versions.length === 0 ?
        <div style={{ color: T.textD, fontSize: 11 }}>No versions yet — train the model first.</div> :
        model.versions.map(v => (
          <div key={v.v} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "10px 14px", marginBottom: 6,
            background: v.active ? `${T.green}10` : T.bg3,
            border: `1px solid ${v.active ? T.green + "40" : T.border}`, borderRadius: 2
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: v.active ? T.green : T.textD, fontSize: 13, fontWeight: 700 }}>{v.v}</span>
              {v.active && <Chip color={T.green}>ACTIVE</Chip>}
              <span style={{ color: T.text, fontSize: 11 }}>
                Score: <strong style={{ color: T.amber }}>{v.score}</strong></span>
              <span style={{ color: T.textD, fontSize: 10 }}>{v.date}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!v.active && <Btn small v="outline">Activate</Btn>}
              <Btn small v="ghost">Export</Btn>
              {!v.active && <Btn small v="ghost" color={T.red}>Delete</Btn>}
            </div>
          </div>
        ))
      }
    </Sec>

    <Sec label="SESSION COMPARISON">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div style={{ fontSize: 10, color: T.textD }}>
          Compare two versions side-by-side with attempt replays</div>
        <Btn small v="outline" onClick={() => setCompare(!compare)}>
          {compare ? "Close" : "Compare Versions"}</Btn>
      </div>
      {compare && <div style={{
        marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 10
      }}>
        {["v2", "v3"].map(v => (
          <div key={v} style={{
            background: T.bg3, border: `1px solid ${T.border}`,
            padding: 12, borderRadius: 2, textAlign: "center"
          }}>
            <div style={{ color: T.textB, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{v}</div>
            <div style={{
              height: 60, background: `linear-gradient(135deg,${T.bg2},${T.bg0})`,
              borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
              color: T.textD, fontSize: 9
            }}>Attempt replay preview</div>
            <Btn small v="outline" sx={{ marginTop: 8, width: "100%", fontSize: 9 }}>
              ▶ Play Replay</Btn>
          </div>
        ))}
      </div>}
    </Sec>

    <Sec label="PERFORMANCE">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { l: "SUCCESS RATE", v: `${model.successRate}%`, c: model.successRate > 85 ? T.green : T.amber },
          { l: "BEST SCORE", v: model.bestScore > 0 ? model.bestScore.toFixed(1) : "—", c: T.amber },
          { l: "TOTAL ATTEMPTS", v: model.attempts, c: T.blue },
        ].map(({ l, v, c }) => (
          <div key={l} style={{
            background: T.bg3, border: `1px solid ${T.border}`,
            padding: 12, borderRadius: 2, textAlign: "center", borderTop: `2px solid ${c}`
          }}>
            <div style={{ color: c, fontSize: 20, fontWeight: 700 }}>{v}</div>
            <div style={{ color: T.textD, fontSize: 8, letterSpacing: "0.1em" }}>{l}</div>
          </div>
        ))}
      </div>
    </Sec>

    <Sec label="ERROR ANALYSIS">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: 10, fontSize: 10
        }}>
          <span style={{ color: T.textD }}>Total failures: {errTotal}</span>
          {errTotal > 0 && <span style={{ color: T.amber, fontSize: 9 }}>
            Most common: {Object.entries(model.errors).sort((a, b) => b[1] - a[1])[0]?.[0]} errors
          </span>}
        </div>
        {Object.entries(model.errors).map(([type, count]) => (
          <div key={type} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 10
          }}>
            <span style={{ color: T.text, textTransform: "capitalize" }}>{type} errors</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: count > 3 ? T.red : count > 0 ? T.amber : T.green, fontWeight: 700 }}>
                {count}</span>
              {count > 0 && <Btn small v="ghost" sx={{ fontSize: 8 }}>View</Btn>}
            </div>
          </div>
        ))}
        {errTotal > 0 && <div style={{
          marginTop: 10, padding: "8px",
          background: `${T.amber}10`, border: `1px solid ${T.amber}30`,
          borderRadius: 2, fontSize: 9, color: T.textD, lineHeight: 1.6
        }}>
          💡 Top suggestion: Add more varied training videos to reduce vision errors
        </div>}
      </div>
    </Sec>

    <Sec label="TEST MODEL ON NEW DATA">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ color: T.textD, fontSize: 10, marginBottom: 10, lineHeight: 1.6 }}>
          Drop screenshots the model has never seen. Shows predictions with confidence circles.
          This is your honest real-world performance score.
        </div>
        <div style={{
          border: `2px dashed ${T.border}`, borderRadius: 2, padding: "20px",
          textAlign: "center", cursor: "pointer", marginBottom: 10
        }}>
          <div style={{ color: T.textD, fontSize: 11 }}>Drop new screenshots here</div>
          <Btn small v="outline" sx={{ marginTop: 8 }}>Browse</Btn>
        </div>
        <Btn small v="outline" sx={{ width: "100%" }}>
          Evaluate on Locked Test Set (5% held-back data)</Btn>
        <div style={{ marginTop: 8, fontSize: 9, color: T.textD, lineHeight: 1.6 }}>
          Test set performance: honest final score not inflated by training data
        </div>
      </div>
    </Sec>

    <Sec label="ATTEMPT REPLAYS">
      {model.runs.map((r, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "8px 12px", marginBottom: 4,
          background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: r.status === "success" ? T.green : r.status === "fail" ? T.red : T.amber }}>
              {r.status === "success" ? "✓" : r.status === "fail" ? "✗" : "◐"}</span>
            <span style={{ color: T.text, fontSize: 11 }}>{r.date}</span>
            {r.time !== "--" && <span style={{ color: T.textD, fontSize: 10 }}>{r.time}</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn small v="ghost">▶ Replay</Btn>
            {r.status === "fail" && <Btn small v="ghost" color={T.amber}>Debug</Btn>}
          </div>
        </div>
      ))}
    </Sec>

    <Sec label="MODEL DRIFT MONITOR">
      <div style={{
        background: model.driftAlert ? `${T.amber}10` : T.bg3,
        border: `1px solid ${model.driftAlert ? T.amber + "40" : T.border}`,
        padding: 14, borderRadius: 2
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ color: model.driftAlert ? T.amber : T.green, fontSize: 11, fontWeight: 700 }}>
              {model.driftAlert ? "⚠ Drift Detected" : "● Healthy"}
            </div>
            <div style={{ color: T.textD, fontSize: 9 }}>
              Avg confidence last 20 runs: {model.liveConfidence}%
              {model.driftAlert ? " (was 84%)" : ""}
            </div>
          </div>
          {model.driftAlert && <Btn small v="outline" color={T.amber}>Begin Retraining</Btn>}
        </div>
        <div style={{ height: 30 }}>
          <MiniChart
            data={[88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 61]}
            color={model.driftAlert ? T.amber : T.green} h={30} />
        </div>
      </div>
    </Sec>

    <Sec label="PAIR SPECIALIZATION">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ color: T.textD, fontSize: 10, marginBottom: 10, lineHeight: 1.6 }}>
          Create pair-specific variants for 15-20% higher accuracy on that pair.
          Base model works on all pairs.
        </div>
        {["XRP", "BTC", "ETH", "SOL"].map(pair => (
          <div key={pair} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 10
          }}>
            <span style={{ color: T.text }}>{model.name}_{pair}</span>
            <Btn small v="outline" color={T.purple} sx={{ fontSize: 9 }}>Create Variant</Btn>
          </div>
        ))}
      </div>
    </Sec>

    <Sec label="EXPORT">
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" sx={{ flex: 1 }}>Export Model (.keras)</Btn>
        <Btn v="outline" color={T.cyan} sx={{ flex: 1 }}>Export Standalone Agent</Btn>
      </div>
      <div style={{ marginTop: 6, fontSize: 9, color: T.textD }}>
        Standalone agent runs without this platform: python agent.py XRPUSDT 15m
      </div>
    </Sec>

    <Sec label="BACKUP">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div style={{ fontSize: 10 }}>
          <div style={{ color: T.green }}>✓ Last backup: Today 00:00</div>
          <div style={{ color: T.textD, fontSize: 9 }}>Next: Tomorrow 00:00 · 7 days kept</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small v="outline">Backup Now</Btn>
          <Btn small v="ghost">View Backups</Btn>
        </div>
      </div>
    </Sec>
  </div>;
};

// ── ACTIONS TAB ───────────────────────────────────────────────────────────────

const ActionsTab = ({ model, updateModel }) => {
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [newStep, setNewStep] = useState({ type: "click", x: "", y: "", key: "", seconds: "0.5", amount: "" });
  const [newSeqName, setNewSeqName] = useState("");
  const [showNewSeq, setShowNewSeq] = useState(false);
  const timerRef = useRef(null);

  const startRec = () => { setRecording(true); setRecSec(0); timerRef.current = setInterval(() => setRecSec(s => s + 1), 1000); };
  const stopRec = () => { setRecording(false); clearInterval(timerRef.current); };
  const icons = { click: "👆", key: "⌨️", scroll: "🖱️", wait: "⏱️", drag: "↔️", type: "📝" };

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <InfoBanner color={T.cyan}>
      <strong>What is this tab?</strong> Actions are fixed steps that do NOT need a model
      — they are always the same regardless of screen state. Your reset sequence lives here
      and runs automatically before every training attempt. Record live or add steps manually.
    </InfoBanner>

    <Sec label="LIVE RECORDER">
      <div style={{
        padding: 14, background: T.bg3,
        border: `1px solid ${recording ? T.amber : T.border}`, borderRadius: 2, transition: "border 0.2s"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: recording ? 10 : 0
        }}>
          <div>
            <div style={{ color: T.textB, fontSize: 11, marginBottom: 2 }}>Record actions live on screen</div>
            <div style={{ color: T.textD, fontSize: 9 }}>
              Minimize this app, perform the task, come back and Stop.
              Every click, keypress, scroll and timing is captured automatically.</div>
          </div>
          {!recording ?
            <Btn v="solid" onClick={startRec}>● START RECORDING</Btn> :
            <Btn v="danger" onClick={stopRec}>■ STOP ({recSec}s)</Btn>}
        </div>
        {recording && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: T.red,
            animation: "overlayPulse 1s infinite"
          }} />
          <span style={{ color: T.red, fontSize: 10, fontWeight: 700 }}>
            RECORDING — perform your task in Coinglass now...</span>
        </div>}
      </div>
    </Sec>

    <Sec label="SAVED SEQUENCES">
      {model.actions.length === 0 &&
        <div style={{ color: T.textD, fontSize: 11, padding: "10px 0" }}>
          No sequences yet. Record or add steps manually below.</div>}
      {model.actions.map(seq => (
        <div key={seq.id} style={{
          background: T.bg3,
          border: `1px solid ${T.border}`,
          borderLeft: `3px solid ${seq.isReset ? T.cyan : T.amber}`,
          borderRadius: 2, marginBottom: 8, overflow: "hidden"
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "10px 12px",
            borderBottom: `1px solid ${T.border}`
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: T.white, fontSize: 11, fontWeight: 700 }}>{seq.name}</span>
              {seq.isReset && <Chip color={T.cyan}>RESET SEQUENCE</Chip>}
              <span style={{ color: T.textD, fontSize: 10 }}>
                {seq.seq?.length || seq.steps} steps</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small v="outline" color={T.green}>▶ Play</Btn>
              <Btn small v="ghost">✏ Edit</Btn>
              <Btn small v="ghost" color={T.red}>🗑</Btn>
            </div>
          </div>
          {seq.seq && seq.seq.length > 0 &&
            <div style={{ padding: "8px 12px", display: "flex", gap: 4, flexWrap: "wrap" }}>
              {seq.seq.map((s, i) => (
                <span key={i} style={{
                  fontSize: 9, padding: "2px 7px",
                  background: T.bg2, border: `1px solid ${T.border}`,
                  borderRadius: 2, color: T.textD
                }}>
                  {icons[s.type] || "⚙"} {s.type}
                  {s.x !== undefined ? ` (${s.x},${s.y})` : ""}
                  {s.key ? ` ${s.key}` : ""}
                  {s.seconds ? ` ${s.seconds}s` : ""}
                  {s.amount ? ` ${s.amount}` : ""}
                </span>
              ))}
            </div>}
        </div>
      ))}
      {showNewSeq ?
        <div style={{ display: "flex", gap: 8 }}>
          <Inp value={newSeqName} onChange={setNewSeqName} placeholder="Sequence name" />
          <Btn small v="solid">Add</Btn>
          <Btn small v="ghost" onClick={() => setShowNewSeq(false)}>Cancel</Btn>
        </div> :
        <Btn small v="outline" onClick={() => setShowNewSeq(true)}>+ New Sequence</Btn>}
    </Sec>

    <Sec label="ADD STEP MANUALLY">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ marginBottom: 10, fontSize: 9, color: T.textD, lineHeight: 1.6 }}>
          Add individual steps without re-recording everything. Pick from Screen captures
          coordinates automatically — no guessing pixel numbers.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {["click", "double_click", "right_click", "drag", "scroll", "key", "wait", "type"].map(t => (
            <label key={t} style={{
              display: "flex", gap: 5, alignItems: "center", cursor: "pointer",
              padding: "5px 8px", background: newStep.type === t ? `${T.amber}15` : T.bg2,
              border: `1px solid ${newStep.type === t ? T.amber + "40" : T.border}`, borderRadius: 2
            }}>
              <input type="radio" name="stype" value={t} checked={newStep.type === t}
                onChange={() => setNewStep(p => ({ ...p, type: t }))} style={{ accentColor: T.amber }} />
              <span style={{ color: newStep.type === t ? T.amber : T.textD, fontSize: 10 }}>{t}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          {["click", "double_click", "right_click", "drag"].includes(newStep.type) && <>
            <div>
              <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>X</div>
              <Inp value={newStep.x} onChange={v => setNewStep(p => ({ ...p, x: v }))}
                placeholder="540" sx={{ width: 65 }} />
            </div>
            <div>
              <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>Y</div>
              <Inp value={newStep.y} onChange={v => setNewStep(p => ({ ...p, y: v }))}
                placeholder="380" sx={{ width: 65 }} />
            </div>
            <Btn small v="outline" color={T.cyan}>🎯 Pick from Screen</Btn>
          </>}
          {newStep.type === "key" &&
            <div style={{ flex: 1 }}>
              <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>KEY / SHORTCUT</div>
              <Inp value={newStep.key} onChange={v => setNewStep(p => ({ ...p, key: v }))}
                placeholder="Escape, F11, ctrl+shift+r" />
            </div>}
          {newStep.type === "wait" &&
            <div>
              <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>SECONDS</div>
              <Inp value={newStep.seconds} onChange={v => setNewStep(p => ({ ...p, seconds: v }))}
                placeholder="1.5" sx={{ width: 80 }} />
            </div>}
          {newStep.type === "scroll" &&
            <div>
              <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>AMOUNT (-=down)</div>
              <Inp value={newStep.amount} onChange={v => setNewStep(p => ({ ...p, amount: v }))}
                placeholder="-5" sx={{ width: 80 }} />
            </div>}
          <Btn small v="solid">Add Step</Btn>
        </div>
      </div>
    </Sec>

    <Sec label="CONDITIONAL LOGIC">
      <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 14, borderRadius: 2 }}>
        <div style={{ color: T.textD, fontSize: 10, marginBottom: 10, lineHeight: 1.6 }}>
          Define different behaviors based on screen conditions.
          Model checks condition first, then runs the right sequence.
        </div>
        {[
          { cond: "App is OPEN", action: "Focus Window sequence" },
          { cond: "App is CLOSED", action: "Launch App sequence" },
        ].map(({ cond, action }) => (
          <div key={cond} style={{
            display: "flex", gap: 8, alignItems: "center",
            marginBottom: 8, fontSize: 10, flexWrap: "wrap"
          }}>
            <span style={{ color: T.textD }}>IF</span>
            <span style={{
              background: T.bg2, border: `1px solid ${T.border}`,
              padding: "3px 10px", borderRadius: 2, color: T.amber
            }}>{cond}</span>
            <span style={{ color: T.textD }}>→</span>
            <span style={{
              background: T.bg2, border: `1px solid ${T.border}`,
              padding: "3px 10px", borderRadius: 2, color: T.textB
            }}>{action}</span>
            <Btn small v="ghost" color={T.red} sx={{ fontSize: 9, padding: "2px 6px" }}>✕</Btn>
          </div>
        ))}
        <Btn small v="outline" sx={{ marginTop: 4 }}>+ Add Condition</Btn>
      </div>
    </Sec>
  </div>;
};

// ── LABEL TAB ─────────────────────────────────────────────────────────────────

const LabelTab = ({ model }) => {
  const reviewed = model.frames > 0 ? Math.floor(model.frames * 0.42) : 0;
  const clicks = model.frames > 0 ? Math.floor(model.frames * 0.15) : 0;
  const pct = model.frames > 0 ? Math.round((reviewed / model.frames) * 100) : 0;

  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Sec label="AUTO-DETECTION">
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div>
          <div style={{ color: T.textB, fontSize: 11, marginBottom: 2 }}>Automatic event detection</div>
          <div style={{ color: T.textD, fontSize: 10 }}>
            Detects popup appearances, clicks, scroll events from video footage</div>
        </div>
        <Btn v="outline" disabled={model.frames === 0}>Run Auto-Label</Btn>
      </div>
      {model.frames > 0 && <div style={{
        marginTop: 6, padding: "6px 10px",
        background: `${T.green}10`, border: `1px solid ${T.green}30`, borderRadius: 2,
        color: T.green, fontSize: 10
      }}>
        ✓ {Math.floor(model.frames * 0.42).toLocaleString()} events auto-detected
      </div>}
    </Sec>

    <Sec label="MANUAL REVIEW">
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10 }}>
          <span style={{ color: T.textD }}>
            Reviewed: {reviewed.toLocaleString()} / {model.frames.toLocaleString()}</span>
          <span style={{ color: T.amber }}>{pct}%</span>
        </div>
        <ScoreBar value={pct} color={T.amber} height={6} />
      </div>
      <Btn v="outline" disabled={model.frames === 0}>Open Label Tool →</Btn>
      <div style={{
        marginTop: 8, padding: "8px 10px", background: T.bg3,
        border: `1px solid ${T.border}`, borderRadius: 2, fontSize: 9, color: T.textD, lineHeight: 1.8
      }}>
        C=click &nbsp; S=slider &nbsp; Z=zoom &nbsp; P=pan &nbsp; X=skip<br />
        D/→=next &nbsp; A/←=prev &nbsp; Q=save and quit
      </div>
    </Sec>

    <Sec label="LABEL CONSISTENCY CHECKER">
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 12px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2
      }}>
        <div style={{ fontSize: 10, color: T.textD }}>
          Finds similar frames labeled with different actions. Cleaner labels = better model.</div>
        <Btn small v="outline" disabled={model.frames === 0}>Run Checker</Btn>
      </div>
    </Sec>

    <Sec label="LABEL SUMMARY">
      {[
        { l: "Clicks labeled", v: clicks, c: T.green },
        { l: "Scroll / zoom", v: model.frames > 0 ? Math.floor(model.frames * 0.03) : 0, c: T.blue },
        { l: "No-action frames", v: model.frames > 0 ? Math.floor(model.frames * 0.42) : 0, c: T.textD },
        { l: "Unlabeled", v: model.frames > 0 ? 47 : 0, c: T.red },
      ].map(({ l, v, c }) => (
        <div key={l} style={{
          display: "flex", justifyContent: "space-between",
          padding: "7px 0", borderBottom: `1px solid ${T.border}`, fontSize: 11
        }}>
          <span style={{ color: T.text }}>{l}</span>
          <span style={{ color: c, fontWeight: 700 }}>{v.toLocaleString()}</span>
        </div>
      ))}
    </Sec>

    <Sec label="COMPILE TRAINING DATA">
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px",
        background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 2, marginBottom: 8
      }}>
        <div style={{ fontSize: 10, color: T.textD }}>
          Splits into train (80%) / validation (15%) / test (5% locked)</div>
        <Btn v="outline" disabled={clicks === 0}>Compile Training Data →</Btn>
      </div>
      {clicks > 0 && <div style={{ fontSize: 9, color: T.textD, lineHeight: 1.8 }}>
        Training set: {Math.floor(clicks * 0.8)} · Validation: {Math.floor(clicks * 0.15)} ·
        Test (locked): {Math.floor(clicks * 0.05)}
      </div>}
    </Sec>
  </div>;
};

// ── MODEL DASHBOARD ───────────────────────────────────────────────────────────

const TABS = ["Data", "Label", "Actions", "Reset", "Train", "Scoring", "Goals", "Results"];

const ModelDashboard = ({ model, updateModel, onBack }) => {
  const [tab, setTab] = useState("Train");
  const c = sc(model.status);
  const content = {
    Data: <DataTab model={model} updateModel={updateModel} />,
    Label: <LabelTab model={model} />,
    Actions: <ActionsTab model={model} updateModel={updateModel} />,
    Reset: <ResetTab model={model} />,
    Train: <TrainTab model={model} updateModel={updateModel} />,
    Scoring: <ScoringTab />,
    Goals: <GoalsTab model={model} />,
    Results: <ResultsTab model={model} />,
  };
  return <div>
    <div style={{
      background: T.bg1, borderBottom: `1px solid ${T.border}`,
      padding: "12px 24px", display: "flex", alignItems: "center", gap: 16
    }}>
      <Btn small v="ghost" onClick={onBack} sx={{ borderColor: T.border, color: T.textD }}>← BACK</Btn>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.white, fontSize: 15, fontWeight: 700 }}>{model.name}</span>
          <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{sl(model.status)}</span>
          <Chip color={T.blue}>{model.type}</Chip>
          {model.driftAlert && <Chip color={T.amber}>⚠ DRIFT</Chip>}
        </div>
        <div style={{ color: T.textD, fontSize: 10, marginTop: 2 }}>{model.desc}</div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[
          { l: "Score", v: model.score > 0 ? model.score.toFixed(1) : "—", c },
          { l: "Videos", v: model.videos, c: T.textB },
          { l: "Frames", v: model.frames.toLocaleString(), c: T.textB },
          { l: "Attempts", v: model.attempts, c: T.textB },
        ].map(({ l, v, c: vc }) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ color: vc, fontSize: 14, fontWeight: 700 }}>{v}</div>
            <div style={{ color: T.textD, fontSize: 8 }}>{l}</div>
          </div>
        ))}
      </div>
      <Btn v="outline" color={T.green}>▶ RUN MODEL</Btn>
    </div>
    <div style={{ display: "flex", background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: "0 24px" }}>
      {TABS.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{
          background: "transparent", border: "none",
          borderBottom: tab === t ? `2px solid ${T.amber}` : "2px solid transparent",
          color: tab === t ? T.amber : T.textD, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.1em", padding: "10px 14px", cursor: "pointer",
          transition: "all 0.12s", fontFamily: "inherit"
        }}>
          {t.toUpperCase()}
        </button>
      ))}
    </div>
    <div style={{ padding: 24, maxWidth: 1100 }}>{content[tab]}</div>
  </div>;
};

// ── MACRO BUILDER ─────────────────────────────────────────────────────────────

const MacroBuilder = ({ models }) => {
  const [macroName, setMacroName] = useState("coinglass_full_agent");
  const [nodes, setNodes] = useState(MACRO_INIT.nodes);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dryRunning, setDryRunning] = useState(false);
  const [activeNodeIdx, setActiveNodeIdx] = useState(-1);

  const nodeColors = { model: T.green, condition: T.amber, loop: T.blue, action: T.textD, parallel: T.purple };
  const nodeIcons = { model: "⊞", condition: "◆", loop: "↺", action: "⚙", parallel: "⟦⟧" };

  const runDryRun = () => {
    setDryRunning(true); setActiveNodeIdx(0);
    nodes.forEach((_, i) => setTimeout(() => setActiveNodeIdx(i), i * 700));
    setTimeout(() => { setDryRunning(false); setActiveNodeIdx(-1); }, nodes.length * 700 + 500);
  };

  const sn = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const sm = sn?.modelId ? models.find(m => m.id === sn.modelId) : null;

  return <div style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ color: T.textD, fontSize: 9, letterSpacing: "0.15em", marginBottom: 6 }}>
          MACRO BUILDER</div>
        <input value={macroName} onChange={e => setMacroName(e.target.value)}
          style={{
            background: "transparent", border: "none",
            borderBottom: `1px solid ${T.border}`, color: T.white,
            fontFamily: "'Courier New',monospace", fontSize: 16, fontWeight: 700,
            padding: "4px 0", outline: "none", width: 280
          }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" onClick={runDryRun} disabled={dryRunning}>
          {dryRunning ? "◐ RUNNING..." : "▶ DRY RUN"}</Btn>
        <Btn v="outline">💾 SAVE MACRO</Btn>
        <Btn v="solid">🚀 LAUNCH AGENT</Btn>
      </div>
    </div>

    <div style={{ display: "flex", gap: 16 }}>
      {/* Canvas */}
      <div style={{ flex: 1 }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 12,
          padding: "8px 12px", background: T.bg2,
          border: `1px solid ${T.border}`, borderRadius: 2
        }}>
          {[
            { t: "model", l: "+ Model" },
            { t: "condition", l: "+ Condition" },
            { t: "loop", l: "+ Loop" },
            { t: "parallel", l: "+ Parallel" },
            { t: "action", l: "+ Action" },
          ].map(({ t, l }) => (
            <Btn key={t} small v="outline" color={nodeColors[t]}
              onClick={() => setNodes(p => [...p, {
                id: `n${Date.now()}`, type: t,
                modelId: null, x: p.length, label: l.replace("+ ", "")
              }])}>
              {l}
            </Btn>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <Btn small v="ghost">↩ Undo</Btn>
            <Btn small v="ghost">↪ Redo</Btn>
            <Btn small v="ghost">⊡ Fit All</Btn>
          </div>
        </div>

        {/* Flow */}
        <div style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 2, padding: 20, minHeight: 500, position: "relative"
        }}>
          {/* Start */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              background: T.bg3, border: `1px solid ${T.border}`,
              padding: "6px 20px", borderRadius: 2, color: T.textD, fontSize: 10
            }}>
              START</div>

            {nodes.map((node, i) => {
              const active = dryRunning && activeNodeIdx === i;
              const done = dryRunning && activeNodeIdx > i;
              const nc = nodeColors[node.type] || T.textD;
              const ni = nodeIcons[node.type] || "⚙";
              const nm = node.modelId ? models.find(m => m.id === node.modelId) : null;
              return <div key={node.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", width: "100%"
              }}>
                {/* Connector line */}
                <div style={{
                  width: 2, height: 20,
                  background: done ? T.green : T.border, transition: "background 0.3s"
                }} />
                {/* Node */}
                <div onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  style={{
                    width: "100%", maxWidth: 460, padding: "12px 16px",
                    background: active ? `${nc}15` : done ? `${T.green}08` :
                      selectedNode === node.id ? `${nc}12` : T.bg3,
                    border: `1px solid ${active ? nc : done ? T.green :
                      selectedNode === node.id ? nc + "60" : T.border}`,
                    borderLeft: `3px solid ${nc}`,
                    borderRadius: 2, cursor: "pointer", transition: "all 0.25s",
                    boxShadow: active ? `0 0 20px ${nc}30` : "none"
                  }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 4
                  }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: nc, fontSize: 14 }}>{ni}</span>
                      <span style={{
                        color: active ? T.white : done ? T.green : T.textB,
                        fontSize: 12, fontWeight: 700
                      }}>{node.label}</span>
                      {nm && <span style={{ color: sc(nm.status), fontSize: 9 }}>
                        {sl(nm.status)}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn small v="ghost" sx={{ fontSize: 9 }}>⚙</Btn>
                      <Btn small v="ghost" color={T.red} sx={{ fontSize: 9 }}
                        onClick={e => { e.stopPropagation(); setNodes(p => p.filter(n => n.id !== node.id)); }}>
                        ✕</Btn>
                    </div>
                  </div>
                  {nm && <Chip color={T.blue}>{nm.type}</Chip>}
                  {active && <div style={{
                    marginTop: 8, fontSize: 9, color: nc,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", background: nc,
                      animation: "overlayPulse 0.8s infinite"
                    }} />
                    Running...
                  </div>}
                  {done && <div style={{ marginTop: 6, fontSize: 9, color: T.green }}>✓ Completed</div>}
                </div>
              </div>;
            })}

            {/* Add node button */}
            <div style={{ width: 2, height: 20, background: T.border }} />
            <div style={{
              border: `1px dashed ${T.border}`, padding: "6px 24px",
              borderRadius: 2, color: T.textD, fontSize: 10, cursor: "pointer"
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = T.amber;
                e.currentTarget.style.color = T.amber;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.textD;
              }}>
              + ADD STEP
            </div>
            <div style={{ width: 2, height: 20, background: T.border }} />
            <div style={{
              background: T.bg3, border: `1px solid ${T.border}`,
              padding: "6px 20px", borderRadius: 2, color: T.textD, fontSize: 10
            }}>
              END → SAVE JSON
            </div>
          </div>
        </div>

        {/* Macro settings */}
        <div style={{
          marginTop: 12, background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 2, padding: 16
        }}>
          <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 12 }}>
            MACRO SETTINGS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              {
                l: "ON STEP FAIL", el: <Sel value="stop" onChange={() => { }} options={[
                  { value: "stop", label: "Stop macro" }, { value: "retry", label: "Retry 3×" },
                  { value: "skip", label: "Skip step" }]} sx={{ width: "100%" }} />
              },
              { l: "MAX TOTAL TIME", el: <Inp value="120" onChange={() => { }} sx={{ width: "100%" }} /> },
              { l: "SAVE OUTPUT TO", el: <Inp value="data/output.json" onChange={() => { }} sx={{ width: "100%" }} /> },
            ].map(({ l, el }) => (
              <div key={l}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>{l}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 20 }}>
            <Toggle value={false} onChange={() => { }} label="Parallel execution" />
            <Toggle value={true} onChange={() => { }} label="Notify on error" />
            <Toggle value={false} onChange={() => { }} label="Run on schedule" />
          </div>
        </div>
      </div>

      {/* Properties + Add models panel */}
      <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Properties */}
        <div style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 2, padding: 14
        }}>
          <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 12 }}>
            {sn ? "PROPERTIES — " + sn.label.toUpperCase() : "PROPERTIES"}</div>
          {sn ? <>
            {sm && <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>MODEL STATUS</div>
                <div style={{ color: sc(sm.status), fontSize: 11 }}>{sl(sm.status)} ({sm.score.toFixed(1)})</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>ON SUCCESS</div>
                <Sel value="continue" onChange={() => { }} options={[
                  { value: "continue", label: "Continue" }, { value: "skip", label: "Skip next" }]}
                  sx={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>ON FAILURE</div>
                <Sel value="retry" onChange={() => { }} options={[
                  { value: "retry", label: "Retry 3×" }, { value: "skip", label: "Skip" },
                  { value: "stop", label: "Stop macro" }]} sx={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>TIMEOUT (sec)</div>
                <Inp value="30" onChange={() => { }} sx={{ width: "100%" }} />
              </div>
              <Btn small v="outline" full sx={{ marginBottom: 6 }}>Open Model</Btn>
            </>}
            {sn.type === "condition" && <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>CHECK</div>
                <Sel value="output" onChange={() => { }} options={[
                  { value: "output", label: "Model output value" },
                  { value: "bool", label: "Returns true/false" },
                  { value: "count", label: "Count > threshold" }]}
                  sx={{ width: "100%" }} />
              </div>
              <Btn small v="outline" full>Test Condition Now</Btn>
            </>}
            {sn.type === "loop" && <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>LOOP TYPE</div>
                <Sel value="until" onChange={() => { }} options={[
                  { value: "until", label: "Repeat Until" },
                  { value: "foreach", label: "For Each" }]}
                  sx={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>MAX LOOPS</div>
                <Inp value="5" onChange={() => { }} sx={{ width: "100%" }} />
              </div>
            </>}
          </> :
            <div style={{ color: T.textD, fontSize: 10, lineHeight: 1.7 }}>
              Click any node in the pipeline to configure its properties.
            </div>}
        </div>

        {/* Add models */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 2, padding: 14 }}>
          <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 12 }}>
            ADD TO PIPELINE</div>
          {models.map(m => (
            <div key={m.id} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "7px 0",
              borderBottom: `1px solid ${T.border}`
            }}>
              <div>
                <div style={{ color: T.textB, fontSize: 10, fontWeight: 700 }}>{m.name}</div>
                <div style={{ color: sc(m.status), fontSize: 8 }}>{sl(m.status)}</div>
              </div>
              <Btn small v="outline"
                onClick={() => setNodes(p => [...p, {
                  id: `n${Date.now()}`, type: "model",
                  modelId: m.id, x: p.length, label: m.name
                }])}>
                + Add</Btn>
            </div>
          ))}
        </div>

        {/* Dependency map */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 2, padding: 14 }}>
          <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 10 }}>
            DEPENDENCY MAP</div>
          <div style={{ fontSize: 9, color: T.textD, fontFamily: "monospace", lineHeight: 2 }}>
            open_coinglass<br />
            &nbsp;└── assess_chart<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── click_clusters<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── read_popup
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: T.amber }}>
            Retrain open_coinglass? 3 downstream models affected.
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 2, padding: 14 }}>
          <div style={{ fontSize: 9, color: T.textD, letterSpacing: "0.15em", marginBottom: 10 }}>
            PIPELINE SUMMARY</div>
          {[
            { l: "Steps", v: nodes.length, c: T.textB },
            { l: "Trained", v: nodes.filter(n => models.find(m => m.id === n.modelId)?.status === "trained").length, c: T.green },
            { l: "Untrained", v: nodes.filter(n => models.find(m => m.id === n.modelId)?.status === "untrained").length, c: T.red },
          ].map(({ l, v, c }) => (
            <div key={l} style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 6, fontSize: 10
            }}>
              <span style={{ color: T.textD }}>{l}</span>
              <span style={{ color: c, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>;
};

// ── SETTINGS ──────────────────────────────────────────────────────────────────

const SettingsScreen = () => {
  const [ollama, setOllama] = useState(false);
  const [backup, setBackup] = useState(true);
  const [scheduler, setScheduler] = useState(false);
  const [drift, setDrift] = useState(true);

  return <div style={{ padding: 24, maxWidth: 700 }}>
    <div style={{ color: T.textD, fontSize: 9, letterSpacing: "0.15em", marginBottom: 20 }}>SETTINGS</div>

    <Sec label="COINGLASS DESKTOP APP">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>APPLICATION PATH</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Inp value="C:\Program Files\Coinglass\Coinglass.exe" onChange={() => { }} />
            <Btn small v="outline">Browse</Btn>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small v="outline">Test Launch</Btn>
          <Btn small v="outline">Re-Calibrate UI</Btn>
        </div>
      </div>
    </Sec>

    <Sec label="TESSERACT OCR">
      <div style={{ display: "flex", gap: 8 }}>
        <Inp value="C:\Program Files\Tesseract-OCR\tesseract.exe" onChange={() => { }} />
        <Btn small v="outline">Browse</Btn>
        <Btn small v="outline">Test OCR</Btn>
      </div>
    </Sec>

    <Sec label="OLLAMA (OPTIONAL — FOR SUMMARIES ONLY)">
      <Toggle value={ollama} onChange={setOllama} label="Enable Ollama" />
      {ollama && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>MODEL</div>
            <Inp value="qwen3.5:0.8b" onChange={() => { }} />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>KEEP_ALIVE</div>
            <Inp value="0" onChange={() => { }} sx={{ width: 60 }} />
          </div>
        </div>
        <Btn small v="outline">Test Ollama Connection</Btn>
      </div>}
    </Sec>

    <Sec label="TRAINING DEFAULTS">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { l: "Auto-save frequency", v: "10 attempts" },
          { l: "Max attempts", v: "200" },
          { l: "Popup wait (sec)", v: "0.7" },
          { l: "Attempt timeout (sec)", v: "60" },
          { l: "Default confidence threshold", v: "65%" },
          { l: "Frames per video extract", v: "every 5" },
        ].map(({ l, v }) => (
          <div key={l}>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>{l.toUpperCase()}</div>
            <Inp value={v} onChange={() => { }} sx={{ width: "100%" }} />
          </div>
        ))}
      </div>
    </Sec>

    <Sec label="BACKUP SYSTEM">
      <Toggle value={backup} onChange={setBackup} label="Automatic backups" />
      {backup && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>BACKUP LOCATION</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Inp value="D:\Backups\ModelFactory\" onChange={() => { }} />
            <Btn small v="outline">Browse</Btn>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>SCHEDULE</div>
            <Sel value="daily" onChange={() => { }} options={[
              { value: "daily", label: "Daily at midnight" },
              { value: "weekly", label: "Weekly" },
              { value: "manual", label: "Manual only" }]} sx={{ width: "100%" }} />
          </div>
          <div>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>KEEP LAST</div>
            <Inp value="7" onChange={() => { }} sx={{ width: 60 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small v="outline" color={T.green}>Backup Now</Btn>
          <Btn small v="ghost">View Backups</Btn>
        </div>
        <div style={{ fontSize: 9, color: T.textD, lineHeight: 1.6 }}>
          Backs up: model weights · training snapshots · recordings · datasets · config
        </div>
      </div>}
    </Sec>

    <Sec label="TRAINING SCHEDULER">
      <Toggle value={scheduler} onChange={setScheduler} label="Scheduled overnight training" />
      {scheduler && <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[{ l: "START TIME", v: "02:00 AM" }, { l: "MAX ATTEMPTS", v: "50" },
        { l: "STOP BY", v: "06:00 AM" }, { l: "DEFAULT PAIRS", v: "XRPUSDT 15m" }].map(({ l, v }) => (
          <div key={l}>
            <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>{l}</div>
            <Inp value={v} onChange={() => { }} sx={{ width: "100%" }} />
          </div>
        ))}
      </div>}
    </Sec>

    <Sec label="DRIFT DETECTION">
      <Toggle value={drift} onChange={setDrift} label="Monitor model confidence in live runs" />
      {drift && <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>ALERT THRESHOLD</div>
          <Inp value="15% drop" onChange={() => { }} sx={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ color: T.textD, fontSize: 9, marginBottom: 4 }}>CHECK AFTER EVERY</div>
          <Inp value="20 live runs" onChange={() => { }} sx={{ width: "100%" }} />
        </div>
      </div>}
    </Sec>

    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
      <Btn v="ghost">Reset Defaults</Btn>
      <Btn v="solid">Save All Settings</Btn>
    </div>
  </div>;
};

// ── ROOT APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [models, setModels] = useState(MODELS_INIT);
  const [selectedModel, setSelectedModel] = useState(null);

  const updateModel = useCallback((id, changes) => {
    setModels(p => p.map(m => m.id === id ? { ...m, ...changes } : m));
    setSelectedModel(p => p?.id === id ? { ...p, ...changes } : p);
  }, []);

  const content = () => {
    if (screen === "model" && selectedModel) {
      const live = models.find(m => m.id === selectedModel.id) || selectedModel;
      return <ModelDashboard model={live} updateModel={c => updateModel(live.id, c)}
        onBack={() => setScreen("dashboard")} />;
    }
    if (screen === "macro") return <MacroBuilder models={models} />;
    if (screen === "settings") return <SettingsScreen />;
    return <Dashboard models={models} setScreen={setScreen} setSelectedModel={m => { setSelectedModel(m); setScreen("model"); }} />;
  };

  return <div style={{
    background: T.bg0, minHeight: "100vh",
    fontFamily: "'Courier New',Courier,monospace", color: T.text
  }}>
    <style>{`
      * { box-sizing:border-box; }
      ::-webkit-scrollbar { width:4px; height:4px; }
      ::-webkit-scrollbar-track { background:${T.bg0}; }
      ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:2px; }
      @keyframes overlayPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
      @keyframes overlayFlash { 0%,100%{opacity:1;} 50%{opacity:0;} }
    `}</style>

    <NavBar screen={screen} setScreen={setScreen} models={models}
      setModels={setModels} selectedModel={selectedModel}
      setSelectedModel={setSelectedModel} />

    <TrafficOverlay models={models} onOpen={() => setScreen("dashboard")} />

    <div style={{ marginLeft: 220, minHeight: "100vh" }}>
      {content()}
    </div>
  </div>;
}
