import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const PLAYERS = [
  { name: "Joe", color: "#22C55E", emoji: "👑" },
  { name: "Stevie", color: "#E8192C", emoji: "😤" },
  { name: "Will", color: "#3B82F6", emoji: "🧠" },
];

const points = (r) => (r.ats_wins || 0) + (r.special_hit ? 2 : 0);

const SectionHeader = ({ color, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
    <div style={{ width: 4, height: 28, background: color, borderRadius: 2 }} />
    <span style={{ fontSize: 22, fontWeight: 900 }}>{title}</span>
  </div>
);

const inputStyle = { background: "#F4F4F4", border: "1px solid #e5e5e5", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#111" };

export default function PickemLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    week: "", player: "Joe", ats_wins: 0, ats_losses: 0, ats_pushes: 0, special_pick: "", special_hit: false,
  });

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("pickem_results").select("*").order("week", { ascending: false });
    if (err) setError(err.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.week) { setError("Add a week number first."); return; }
    const { error: err } = await supabase
      .from("pickem_results")
      .upsert({ ...form, week: Number(form.week) }, { onConflict: "week,player" });
    if (err) setError(err.message);
    else { setError(""); setForm({ ...form, ats_wins: 0, ats_losses: 0, ats_pushes: 0, special_pick: "", special_hit: false }); load(); }
  };

  const standings = PLAYERS.map((p) => {
    const mine = rows.filter((r) => r.player === p.name);
    return {
      ...p,
      pts: mine.reduce((s, r) => s + points(r), 0),
      w: mine.reduce((s, r) => s + (r.ats_wins || 0), 0),
      l: mine.reduce((s, r) => s + (r.ats_losses || 0), 0),
      push: mine.reduce((s, r) => s + (r.ats_pushes || 0), 0),
      specials: mine.filter((r) => r.special_hit).length,
      weeks: mine.length,
    };
  }).sort((a, b) => b.pts - a.pts);

  const weeks = [...new Set(rows.map((r) => r.week))].sort((a, b) => b - a);
  const latest = weeks[0];
  const latestRows = rows.filter((r) => r.week === latest);
  const lastPlace = latestRows.length === PLAYERS.length ? [...latestRows].sort((a, b) => points(a) - points(b))[0] : null;

  return (
    <div style={{ padding: "14px 16px 30px" }}>
      <SectionHeader color="#F5A623" title="PICK'EM STANDINGS" />
      <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
        5 spread picks (1 pt each) + 1 Alley Kings Special prop (2 pts). Last place eats the punishment.
      </div>

      {loading ? (
        <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 10, marginBottom: 6 }}>
          {standings.map((s, i) => (
            <div key={s.name} className="member-card" style={{ borderColor: s.color }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{i === 0 && s.pts > 0 ? "🏆" : s.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.name}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#111" }}>{s.pts}<span style={{ fontSize: 10, color: "#888" }}> PTS</span></div>
              <div style={{ fontSize: 9, color: "#888" }}>ATS {s.w}-{s.l}{s.push ? `-${s.push}` : ""} · SPECIALS {s.specials}/{s.weeks}</div>
              <div style={{ height: 3, background: s.color, borderRadius: 2, marginTop: 6, width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {lastPlace && (
        <div style={{ background: "#FDECEE", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#E8192C" }}>
          WEEK {latest} PUNISHMENT: {lastPlace.player.toUpperCase()} 🫡
        </div>
      )}

      {weeks.length > 0 && (
        <>
          <SectionHeader color="#E8192C" title="WEEK BY WEEK" />
          {weeks.map((w) => (
            <div key={w} className="bet-card" style={{ padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#888", marginBottom: 8 }}>WEEK {w}</div>
              {rows.filter((r) => r.week === w).map((r) => {
                const p = PLAYERS.find((x) => x.name === r.player);
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: "1px solid #f0f0f0", fontSize: 13, flexWrap: "wrap" }}>
                    <span style={{ background: p?.color || "#888", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "3px 9px" }}>{r.player}</span>
                    <span style={{ fontWeight: 800 }}>{r.ats_wins}-{r.ats_losses}{r.ats_pushes ? `-${r.ats_pushes}` : ""} ATS</span>
                    <span style={{ color: "#888", flex: 1, minWidth: 120 }}>⭐ {r.special_pick || "—"} {r.special_hit ? "✅" : "❌"}</span>
                    <span style={{ fontWeight: 900 }}>{points(r)} pts</span>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      <SectionHeader color="#0A0A0A" title="LOG A WEEK" />
      <form onSubmit={save} className="bet-card" style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input style={{ ...inputStyle, width: 70 }} type="number" min="1" max="22" placeholder="Week" value={form.week}
          onChange={(e) => setForm({ ...form, week: e.target.value })} />
        <select style={inputStyle} value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })}>
          {PLAYERS.map((p) => <option key={p.name}>{p.name}</option>)}
        </select>
        {[["ats_wins", "W"], ["ats_losses", "L"], ["ats_pushes", "P"]].map(([k, label]) => (
          <label key={k} style={{ fontSize: 12, fontWeight: 800, color: "#888" }}>
            {label}{" "}
            <input style={{ ...inputStyle, width: 50 }} type="number" min="0" max="5" value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
          </label>
        ))}
        <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Alley Kings Special (prop)" value={form.special_pick}
          onChange={(e) => setForm({ ...form, special_pick: e.target.value })} />
        <label style={{ fontSize: 12, fontWeight: 800, color: "#888" }}>
          <input type="checkbox" checked={form.special_hit} onChange={(e) => setForm({ ...form, special_hit: e.target.checked })} /> HIT
        </label>
        <button type="submit" style={{ background: "#E8192C", color: "#fff", border: 0, borderRadius: 8, padding: "9px 16px", fontWeight: 900, fontSize: 12, letterSpacing: 1, cursor: "pointer" }}>
          SAVE
        </button>
        {error && <div style={{ width: "100%", color: "#E8192C", fontSize: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
