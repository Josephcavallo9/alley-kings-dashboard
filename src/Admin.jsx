import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "alleykings2024";

const MEMBERS = ["Jay", "Marcus", "Deon", "Stevie", "Will"];
const SPORTS = ["NBA", "NFL", "MLB", "NHL", "Soccer", "UFC", "Golf", "Other"];
const BET_STATUSES = ["PENDING", "WON", "LOST"];
const CLIP_STATUSES = ["PUBLISHED", "SCHEDULED", "DRAFT"];
const TAGS = ["NBA", "NFL", "MLB", "NHL", "UFC", "Golf", "Culture", "Other"];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("BETS");
  const [bets, setBets] = useState([]);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [newBet, setNewBet] = useState({
    bettor: "Jay", sport: "NBA", type: "Moneyline", detail: "",
    stake: "", to_win: "", odds: "", status: "PENDING", note: ""
  });

  const [newClip, setNewClip] = useState({
    title: "", episode: "", status: "DRAFT", tag: "NFL",
    duration: "", views: "—", likes: "—", url: "", date: "", description: ""
  });

  useEffect(() => {
    if (authed) {
      fetchBets();
      fetchClips();
    }
  }, [authed]);

  const fetchBets = async () => {
    const { data } = await supabase.from("bets").select("*").order("created_at", { ascending: false });
    setBets(data || []);
  };

  const fetchClips = async () => {
    const { data } = await supabase.from("clips").select("*").order("created_at", { ascending: false });
    setClips(data || []);
  };

  const addBet = async () => {
    if (!newBet.detail || !newBet.stake) { setMessage("Fill in bet detail and stake"); return; }
    setLoading(true);
    const { error } = await supabase.from("bets").insert([{
      ...newBet,
      stake: parseFloat(newBet.stake),
      to_win: parseFloat(newBet.to_win) || 0,
    }]);
    if (!error) {
      setMessage("Bet added!");
      setNewBet({ bettor: "Jay", sport: "NBA", type: "Moneyline", detail: "", stake: "", to_win: "", odds: "", status: "PENDING", note: "" });
      fetchBets();
    } else {
      setMessage("Error: " + error.message);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const deleteBet = async (id) => {
    await supabase.from("bets").delete().eq("id", id);
    fetchBets();
  };

  const updateBetStatus = async (id, status) => {
    await supabase.from("bets").update({ status }).eq("id", id);
    fetchBets();
  };

  const addClip = async () => {
    if (!newClip.title) { setMessage("Fill in clip title"); return; }
    setLoading(true);
    const { error } = await supabase.from("clips").insert([newClip]);
    if (!error) {
      setMessage("Clip added!");
      setNewClip({ title: "", episode: "", status: "DRAFT", tag: "NFL", duration: "", views: "—", likes: "—", url: "", date: "", description: "" });
      fetchClips();
    } else {
      setMessage("Error: " + error.message);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const deleteClip = async (id) => {
    await supabase.from("clips").delete().eq("id", id);
    fetchClips();
  };

  const updateClipStatus = async (id, status) => {
    await supabase.from("clips").update({ status }).eq("id", id);
    fetchClips();
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e5e5",
    fontSize: 13, fontFamily: "Barlow, sans-serif", marginBottom: 8, outline: "none"
  };

  const selectStyle = { ...inputStyle, background: "white" };

  const btnStyle = (color = "#E8192C") => ({
    background: color, color: "white", border: "none", borderRadius: 8,
    padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 4
  });

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 32, width: 300, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👑</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>ALLEY KINGS</div>
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 24 }}>ADMIN PANEL</div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            style={{ ...inputStyle, textAlign: "center" }}
          />
          <button onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : setMessage("Wrong password")}
            style={btnStyle()}>
            Enter
          </button>
          {message && <div style={{ color: "#E8192C", fontSize: 12, marginTop: 8 }}>{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Barlow Condensed, sans-serif", background: "#f4f4f4", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: "#0A0A0A", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>ALLEY KINGS </span>
          <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 18 }}>ADMIN</span>
        </div>
        <button onClick={() => setAuthed(false)} style={{ background: "transparent", color: "#888", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "white", borderBottom: "1px solid #eee" }}>
        {["BETS", "CLIPS"].map(t => (
          <div key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, textAlign: "center", padding: "14px 0", fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: "pointer", color: activeTab === t ? "#E8192C" : "#888", borderBottom: activeTab === t ? "2px solid #E8192C" : "2px solid transparent" }}>
            {t === "BETS" ? "🎲 BETS" : "🎙️ CLIPS"}
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: message.includes("Error") ? "#FEE2E2" : "#DCFCE7", color: message.includes("Error") ? "#E8192C" : "#16a34a", padding: "10px 16px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          {message}
        </div>
      )}

      {/* BETS TAB */}
      {activeTab === "BETS" && (
        <div style={{ padding: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>➕ ADD NEW BET</div>
            <select value={newBet.bettor} onChange={e => setNewBet({ ...newBet, bettor: e.target.value })} style={selectStyle}>
              {MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={newBet.sport} onChange={e => setNewBet({ ...newBet, sport: e.target.value })} style={selectStyle}>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Bet type (Moneyline, Spread, O/U)" value={newBet.type} onChange={e => setNewBet({ ...newBet, type: e.target.value })} style={inputStyle} />
            <input placeholder="Bet detail (e.g. Celtics -4.5)" value={newBet.detail} onChange={e => setNewBet({ ...newBet, detail: e.target.value })} style={inputStyle} />
            <input placeholder="Odds (e.g. -110)" value={newBet.odds} onChange={e => setNewBet({ ...newBet, odds: e.target.value })} style={inputStyle} />
            <input placeholder="Stake ($)" type="number" value={newBet.stake} onChange={e => setNewBet({ ...newBet, stake: e.target.value })} style={inputStyle} />
            <input placeholder="To win ($)" type="number" value={newBet.to_win} onChange={e => setNewBet({ ...newBet, to_win: e.target.value })} style={inputStyle} />
            <select value={newBet.status} onChange={e => setNewBet({ ...newBet, status: e.target.value })} style={selectStyle}>
              {BET_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder='Note (e.g. "Celtics locked in tonight")' value={newBet.note} onChange={e => setNewBet({ ...newBet, note: e.target.value })} style={inputStyle} />
            <button onClick={addBet} disabled={loading} style={btnStyle()}>{loading ? "Adding..." : "Add Bet"}</button>
          </div>

          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, color: "#333" }}>ALL BETS ({bets.length})</div>
          {bets.map(b => (
            <div key={b.id} style={{ background: "white", borderRadius: 10, padding: 12, marginBottom: 10, borderLeft: "4px solid #E8192C" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{b.bettor} — {b.detail}</span>
                <span style={{ fontSize: 11, color: b.status === "WON" ? "#22C55E" : b.status === "LOST" ? "#E8192C" : "#D97706", fontWeight: 700 }}>{b.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontFamily: "Barlow, sans-serif" }}>{b.sport} • {b.type} • ${b.stake} to win ${b.to_win} {b.odds}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {BET_STATUSES.map(s => (
                  <button key={s} onClick={() => updateBetStatus(b.id, s)}
                    style={{ flex: 1, padding: "5px 0", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "none", cursor: "pointer", background: b.status === s ? "#0A0A0A" : "#f4f4f4", color: b.status === s ? "white" : "#888" }}>
                    {s}
                  </button>
                ))}
                <button onClick={() => deleteBet(b.id)} style={{ padding: "5px 10px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "none", cursor: "pointer", background: "#FEE2E2", color: "#E8192C" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLIPS TAB */}
      {activeTab === "CLIPS" && (
        <div style={{ padding: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>➕ ADD NEW CLIP</div>
            <input placeholder="Title" value={newClip.title} onChange={e => setNewClip({ ...newClip, title: e.target.value })} style={inputStyle} />
            <input placeholder="Episode (e.g. EP. 48 — NBA Playoffs)" value={newClip.episode} onChange={e => setNewClip({ ...newClip, episode: e.target.value })} style={inputStyle} />
            <input placeholder="Description" value={newClip.description} onChange={e => setNewClip({ ...newClip, description: e.target.value })} style={inputStyle} />
            <input placeholder="YouTube/TikTok URL" value={newClip.url} onChange={e => setNewClip({ ...newClip, url: e.target.value })} style={inputStyle} />
            <input placeholder="Duration (e.g. 3:30)" value={newClip.duration} onChange={e => setNewClip({ ...newClip, duration: e.target.value })} style={inputStyle} />
            <input placeholder="Date (e.g. Apr 22)" value={newClip.date} onChange={e => setNewClip({ ...newClip, date: e.target.value })} style={inputStyle} />
            <input placeholder="Views (e.g. 19.3K)" value={newClip.views} onChange={e => setNewClip({ ...newClip, views: e.target.value })} style={inputStyle} />
            <input placeholder="Likes (e.g. 1.4K)" value={newClip.likes} onChange={e => setNewClip({ ...newClip, likes: e.target.value })} style={inputStyle} />
            <select value={newClip.tag} onChange={e => setNewClip({ ...newClip, tag: e.target.value })} style={selectStyle}>
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={newClip.status} onChange={e => setNewClip({ ...newClip, status: e.target.value })} style={selectStyle}>
              {CLIP_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={addClip} disabled={loading} style={btnStyle()}>{loading ? "Adding..." : "Add Clip"}</button>
          </div>

          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, color: "#333" }}>ALL CLIPS ({clips.length})</div>
          {clips.map(c => (
            <div key={c.id} style={{ background: "white", borderRadius: 10, padding: 12, marginBottom: 10, borderLeft: "4px solid #E8192C" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{c.title}</span>
                <span style={{ fontSize: 11, color: c.status === "PUBLISHED" ? "#22C55E" : c.status === "SCHEDULED" ? "#D97706" : "#888", fontWeight: 700 }}>{c.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontFamily: "Barlow, sans-serif" }}>{c.episode} • {c.tag} • {c.duration}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {CLIP_STATUSES.map(s => (
                  <button key={s} onClick={() => updateClipStatus(c.id, s)}
                    style={{ flex: 1, padding: "5px 0", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "none", cursor: "pointer", background: c.status === s ? "#0A0A0A" : "#f4f4f4", color: c.status === s ? "white" : "#888" }}>
                    {s}
                  </button>
                ))}
                <button onClick={() => deleteClip(c.id)} style={{ padding: "5px 10px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "none", cursor: "pointer", background: "#FEE2E2", color: "#E8192C" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}