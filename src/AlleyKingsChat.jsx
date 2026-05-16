import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the Alley Kings Sports Analyst — a sharp, plugged-in assistant with the energy of a group chat full of die-hard sports fans. You work for Alley Kings, a sports and pop culture media brand.

Your job is to help users analyze any major sport including:
- NBA, NFL, MLB, and NHL
- Team matchups: recent form, injuries, head-to-head trends
- Player props: past performance, opponent defense, usage trends
- Spread/moneyline/totals: historical context, recent scoring trends
- Fantasy players: start/sit reasoning, matchup notes
- Bet slips: risk summary, entertainment and analytical perspective only

Your tone: casual, confident, opinionated, entertaining. Think: that friend who watches every game and always has a take. Never robotic. Never corporate. Use contractions. Be direct.

IMPORTANT RULES:
- You provide sports analytics, entertainment, and information only
- You are NOT a gambling service and do NOT guarantee outcomes
- Always add a brief disclaimer when discussing bets: "This is for entertainment and analysis only — not financial advice."
- If live odds, scores, rosters, or injury data are provided in the context, reference them specifically
- Keep responses punchy. No wall-of-text. Use short paragraphs.
- If you don't know something current, say so straight up and work with what you have
- If the user asks about a roster, players, injuries, or depth charts, answer directly using your knowledge. Do NOT mention whether games are scheduled today, that it is the offseason, or that live data is unavailable — just answer the question.`;


export default function AlleyKingsChat({ liveOdds = [], liveScores = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Yo, Alley Kings Analyst here 👑 Drop a matchup, player prop, bet slip, or fantasy question — NBA, NFL, MLB, NHL, I got you. What are we breaking down?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const buildLiveContext = () => {
    let ctx = "";
    if (liveScores.length > 0) {
      ctx += "\n\nLIVE/RECENT SCORES ON DASHBOARD:\n";
      liveScores.slice(0, 6).forEach((g) => {
        const home = g.scores?.find((s) => s.name === g.home_team);
        const away = g.scores?.find((s) => s.name === g.away_team);
        ctx += `${g.sportConfig?.label || ""}: ${g.away_team} ${away?.score ?? "?"} @ ${g.home_team} ${home?.score ?? "?"} (FINAL)\n`;
      });
    }
    if (liveOdds.length > 0) {
      ctx += "\n\nCURRENT ODDS ON DASHBOARD:\n";
      liveOdds.slice(0, 8).forEach((g) => {
        const bk = g.bookmakers?.[0];
        const mkt = bk?.markets?.find((m) => m.key === "h2h");
        const homeOdds = mkt?.outcomes?.find((o) => o.name === g.home_team)?.price;
        const awayOdds = mkt?.outcomes?.find((o) => o.name === g.away_team)?.price;
        if (homeOdds && awayOdds) {
          const fmt = (p) => (p > 0 ? `+${p}` : `${p}`);
          ctx += `${g.sportConfig?.label || ""}: ${g.away_team} (${fmt(awayOdds)}) @ ${g.home_team} (${fmt(homeOdds)})\n`;
        }
      });
    }
    return ctx;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const liveContext = buildLiveContext();
      const systemWithContext = SYSTEM_PROMPT + (liveContext ? `\n\nCURRENT LIVE DATA FROM DASHBOARD:${liveContext}` : "");

      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemWithContext,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Yo something went wrong on my end. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection dropped. Check your API key and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "Break down tonight's MLB matchups",
    "Best NBA player props right now?",
    "Analyze this parlay for me",
    "NHL or NFL start/sit help",
  ];

  return (
    <>
      <style>{`
        .ak-chat-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 58px;
          height: 58px;
          background: #E8192C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(232,25,44,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
        }
        .ak-chat-bubble:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(232,25,44,0.5);
        }
        .ak-chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 560px;
          background: #0D0D0D;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          z-index: 9998;
          border: 1px solid #222;
          overflow: hidden;
          animation: chatSlideIn 0.25s ease;
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ak-chat-header {
          background: #111;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #222;
          flex-shrink: 0;
        }
        .ak-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: #222 transparent;
        }
        .ak-chat-messages::-webkit-scrollbar { width: 4px; }
        .ak-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .ak-chat-messages::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .ak-msg-user {
          align-self: flex-end;
          background: #E8192C;
          color: white;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          font-size: 13px;
          line-height: 1.45;
          max-width: 85%;
          font-family: 'Barlow', sans-serif;
        }
        .ak-msg-assistant {
          align-self: flex-start;
          background: #1a1a1a;
          color: #eee;
          padding: 10px 14px;
          border-radius: 16px 16px 16px 4px;
          font-size: 13px;
          line-height: 1.55;
          max-width: 92%;
          border: 1px solid #2a2a2a;
          font-family: 'Barlow', sans-serif;
          white-space: pre-wrap;
        }
        .ak-msg-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #444;
          margin-bottom: 3px;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .ak-typing {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 12px 14px;
          background: #1a1a1a;
          border-radius: 16px 16px 16px 4px;
          align-self: flex-start;
          border: 1px solid #2a2a2a;
        }
        .ak-typing span {
          width: 6px;
          height: 6px;
          background: #555;
          border-radius: 50%;
          animation: akBounce 1.2s infinite;
        }
        .ak-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ak-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes akBounce {
          0%, 60%, 100% { transform: translateY(0); background: #555; }
          30% { transform: translateY(-5px); background: #E8192C; }
        }
        .ak-quick-prompts {
          display: flex;
          gap: 6px;
          padding: 0 14px 8px;
          overflow-x: auto;
          scrollbar-width: none;
          flex-shrink: 0;
        }
        .ak-quick-prompts::-webkit-scrollbar { display: none; }
        .ak-quick-btn {
          flex-shrink: 0;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #aaa;
          font-size: 10px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.5px;
          transition: all 0.15s;
        }
        .ak-quick-btn:hover {
          background: #E8192C22;
          border-color: #E8192C55;
          color: #E8192C;
        }
        .ak-chat-input-row {
          display: flex;
          gap: 8px;
          padding: 10px 14px 14px;
          border-top: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .ak-chat-input {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          color: white;
          font-size: 13px;
          padding: 10px 14px;
          resize: none;
          font-family: 'Barlow', sans-serif;
          outline: none;
          line-height: 1.4;
        }
        .ak-chat-input:focus { border-color: #E8192C55; }
        .ak-chat-input::placeholder { color: #444; }
        .ak-send-btn {
          width: 40px;
          height: 40px;
          background: #E8192C;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          align-self: flex-end;
          transition: background 0.15s, transform 0.1s;
        }
        .ak-send-btn:hover { background: #c41425; }
        .ak-send-btn:active { transform: scale(0.94); }
        .ak-send-btn:disabled { background: #333; cursor: not-allowed; }
        .ak-live-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 800;
          color: #22C55E;
          letter-spacing: 1px;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .ak-live-dot {
          width: 6px;
          height: 6px;
          background: #22C55E;
          border-radius: 50%;
          animation: akPulse 1.8s infinite;
        }
        @keyframes akPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 480px) {
          .ak-chat-panel {
            right: 12px;
            left: 12px;
            width: auto;
            bottom: 90px;
          }
          .ak-chat-bubble {
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>

      {open && (
        <div className="ak-chat-panel">
          <div className="ak-chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#FEE2E2", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👑</div>
              <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                  ALLEY KINGS <span style={{ color: "#E8192C" }}>ANALYST</span>
                </div>
                <div className="ak-live-badge">
                  <div className="ak-live-dot" />
                  {liveOdds.length > 0 ? `${liveOdds.length} GAMES LOADED` : "NBA · NFL · MLB · NHL"}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
          </div>

          <div className="ak-chat-messages">
            {messages.map((m, i) => (
              <div key={i}>
                <div className="ak-msg-label">{m.role === "user" ? "YOU" : "AK ANALYST"}</div>
                <div className={m.role === "user" ? "ak-msg-user" : "ak-msg-assistant"}>
  {m.role === "assistant" 
  ? m.content
      .replace(/:\s*\n/g, ": ")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n\s*\.\s*\n/g, " ")
      .replace(/\n\./g, ".")
      .replace(/\n{2,}/g, "\n")
      .replace(/^(\d) /gm, "$1: ")
      .replace(/^(C|LW|RW|D|G) /gm, "$1: ")
  : m.content}
</div>
              </div>
            ))}
            {loading && (
              <div>
                <div className="ak-msg-label">AK ANALYST</div>
                <div className="ak-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="ak-quick-prompts">
              {quickPrompts.map((q) => (
                <button key={q} className="ak-quick-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>{q}</button>
              ))}
            </div>
          )}

          <div className="ak-chat-input-row">
            <textarea
              ref={inputRef}
              className="ak-chat-input"
              rows={2}
              placeholder="Ask about any matchup, player prop, bet slip..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="ak-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button className="ak-chat-bubble" onClick={() => setOpen((o) => !o)} aria-label="Open Alley Kings Analyst">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
