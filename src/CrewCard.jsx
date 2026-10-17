// Bookit-style crew card: big dark circle, emoji as the "headshot", pill tag on top,
// soft color glow instead of a hard outline.
export default function CrewCard({ emoji, name, color, tag, value, valueColor, sub, crowned }) {
  return (
    <div className="crew-card" style={{ "--glow": color }}>
      <div className="crew-circle">
        {tag && <div className="crew-tag">{tag}</div>}
        <div className="crew-emoji">{emoji}</div>
        {crowned && <div className="crew-crown">🏆</div>}
      </div>
      <div className="crew-name">{name}</div>
      {value !== undefined && <div className="crew-value" style={{ color: valueColor || "#fff" }}>{value}</div>}
      {sub && <div className="crew-sub">{sub}</div>}
    </div>
  );
}

export const crewCss = `
  .crew-row { display: flex; gap: 18px; overflow-x: auto; padding: 16px 4px 18px; justify-content: space-around; scrollbar-width: none; }
  .crew-row::-webkit-scrollbar { display: none; }
  .crew-card { flex: 0 0 auto; width: 170px; text-align: center; cursor: default; }
  .crew-circle {
    position: relative; width: 150px; height: 150px; margin: 0 auto 12px; border-radius: 50%;
    background: radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--glow) 28%, #141414) 0%, #0b0b0b 72%);
    border: 1px solid #262626;
    box-shadow: 0 0 36px color-mix(in srgb, var(--glow) 18%, transparent), inset 0 0 30px rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .crew-card:hover .crew-circle { transform: translateY(-4px) scale(1.03); box-shadow: 0 0 56px color-mix(in srgb, var(--glow) 38%, transparent), inset 0 0 30px rgba(0,0,0,0.6); }
  .crew-emoji { font-size: 68px; line-height: 1; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6)); }
  .crew-tag {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%); white-space: nowrap;
    background: rgba(38,38,38,0.88); border: 1px solid #3a3a3a; color: #fff; backdrop-filter: blur(4px);
    font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 4px 11px; border-radius: 999px;
  }
  .crew-crown { position: absolute; bottom: 6px; right: 14px; font-size: 26px; filter: drop-shadow(0 0 8px rgba(255,200,0,0.6)); }
  .crew-name { font-size: 24px; font-weight: 900; letter-spacing: 0.5px; color: #fff; line-height: 1; }
  .crew-value { font-size: 20px; font-weight: 900; margin-top: 4px; }
  .crew-sub { font-size: 10px; color: #888; font-weight: 700; letter-spacing: 1px; margin-top: 3px; }
`;
