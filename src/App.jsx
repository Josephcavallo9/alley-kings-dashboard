import { useState, useEffect } from "react";
import { supabase } from './supabase';
const ODDS_API_KEY = process.env.REACT_APP_ODDS_API_KEY;

const storyFilters = ["ALL", "BREAKING", "CULTURE", "TRADES", "SCORES", "VIRAL"];
const clipFilters = ["ALL", "LIVE", "SCHEDULED", "DRAFTS"];
const betFilters = ["ALL", "PENDING", "WON", "LOST", "Joe", "Stevie", "Will"];

  const members = [
  { name: "Joe", color: "#22C55E", emoji: "👑", wins: 0, losses: 0, pending: 0, pnl: "$0.00" },
  { name: "Stevie", color: "#E8192C", emoji: "😤", wins: 0, losses: 0, pending: 0, pnl: "$0.00" },
  { name: "Will", color: "#3B82F6", emoji: "🧠", wins: 0, losses: 0, pending: 0, pnl: "$0.00" },
];

const SPORT_CONFIGS = [
  { key: "basketball_nba", label: "NBA", emoji: "🏀", color: "#F97316", espnSport: "nba" },
  { key: "icehockey_nhl", label: "NHL", emoji: "🏒", color: "#60a5fa", espnSport: "nhl" },
  { key: "americanfootball_nfl", label: "NFL", emoji: "🏈", color: "#4ade80", espnSport: "nfl" },
  { key: "baseball_mlb", label: "MLB", emoji: "⚾", color: "#f87171", espnSport: "mlb" },
  { key: "soccer_epl", label: "EPL", emoji: "⚽", color: "#facc15", espnSport: "soccer" },
];

const getESPNLogo = (teamName, sport) => {
  const nbaMap = {
    "Atlanta Hawks": "atl", "Boston Celtics": "bos", "Brooklyn Nets": "bkn",
    "Charlotte Hornets": "cha", "Chicago Bulls": "chi", "Cleveland Cavaliers": "cle",
    "Dallas Mavericks": "dal", "Denver Nuggets": "den", "Detroit Pistons": "det",
    "Golden State Warriors": "gsw", "Houston Rockets": "hou", "Indiana Pacers": "ind",
    "Los Angeles Clippers": "lac", "Los Angeles Lakers": "lal", "Memphis Grizzlies": "mem",
    "Miami Heat": "mia", "Milwaukee Bucks": "mil", "Minnesota Timberwolves": "min",
    "New Orleans Pelicans": "no", "New York Knicks": "ny", "Oklahoma City Thunder": "okc",
    "Orlando Magic": "orl", "Philadelphia 76ers": "phi", "Phoenix Suns": "phx",
    "Portland Trail Blazers": "por", "Sacramento Kings": "sac", "San Antonio Spurs": "sa",
    "Toronto Raptors": "tor", "Utah Jazz": "utah", "Washington Wizards": "wsh",
  };
  const nhlMap = {
    "Anaheim Ducks": "ana", "Arizona Coyotes": "ari", "Boston Bruins": "bos",
    "Buffalo Sabres": "buf", "Calgary Flames": "cgy", "Carolina Hurricanes": "car",
    "Chicago Blackhawks": "chi", "Colorado Avalanche": "col", "Columbus Blue Jackets": "cbj",
    "Dallas Stars": "dal", "Detroit Red Wings": "det", "Edmonton Oilers": "edm",
    "Florida Panthers": "fla", "Los Angeles Kings": "la", "Minnesota Wild": "min",
    "Montreal Canadiens": "mtl", "Nashville Predators": "nsh", "New Jersey Devils": "nj",
    "New York Islanders": "nyi", "New York Rangers": "nyr", "Ottawa Senators": "ott",
    "Philadelphia Flyers": "phi", "Pittsburgh Penguins": "pit", "San Jose Sharks": "sjs",
    "Seattle Kraken": "sea", "St. Louis Blues": "stl", "Tampa Bay Lightning": "tb",
    "Toronto Maple Leafs": "tor", "Vancouver Canucks": "van", "Vegas Golden Knights": "vgk",
    "Washington Capitals": "wsh", "Winnipeg Jets": "wpg", "Utah Mammoth": "utah",
  };
  const mlbMap = {
    "Arizona Diamondbacks": "ari", "Atlanta Braves": "atl", "Baltimore Orioles": "bal",
    "Boston Red Sox": "bos", "Chicago Cubs": "chc", "Chicago White Sox": "chw",
    "Cincinnati Reds": "cin", "Cleveland Guardians": "cle", "Colorado Rockies": "col",
    "Detroit Tigers": "det", "Houston Astros": "hou", "Kansas City Royals": "kc",
    "Los Angeles Angels": "laa", "Los Angeles Dodgers": "lad", "Miami Marlins": "mia",
    "Milwaukee Brewers": "mil", "Minnesota Twins": "min", "New York Mets": "nym",
    "New York Yankees": "nyy", "Oakland Athletics": "oak", "Philadelphia Phillies": "phi",
    "Pittsburgh Pirates": "pit", "San Diego Padres": "sd", "San Francisco Giants": "sf",
    "Seattle Mariners": "sea", "St. Louis Cardinals": "stl", "Tampa Bay Rays": "tb",
    "Texas Rangers": "tex", "Toronto Blue Jays": "tor", "Washington Nationals": "wsh",
  };
  const nflMap = {
    "Arizona Cardinals": "ari", "Atlanta Falcons": "atl", "Baltimore Ravens": "bal",
    "Buffalo Bills": "buf", "Carolina Panthers": "car", "Chicago Bears": "chi",
    "Cincinnati Bengals": "cin", "Cleveland Browns": "cle", "Dallas Cowboys": "dal",
    "Denver Broncos": "den", "Detroit Lions": "det", "Green Bay Packers": "gb",
    "Houston Texans": "hou", "Indianapolis Colts": "ind", "Jacksonville Jaguars": "jax",
    "Kansas City Chiefs": "kc", "Las Vegas Raiders": "lv", "Los Angeles Chargers": "lac",
    "Los Angeles Rams": "lar", "Miami Dolphins": "mia", "Minnesota Vikings": "min",
    "New England Patriots": "ne", "New Orleans Saints": "no", "New York Giants": "nyg",
    "New York Jets": "nyj", "Philadelphia Eagles": "phi", "Pittsburgh Steelers": "pit",
    "San Francisco 49ers": "sf", "Seattle Seahawks": "sea", "Tampa Bay Buccaneers": "tb",
    "Tennessee Titans": "ten", "Washington Commanders": "wsh",
  };
  let abbr = null;
  if (sport === "nba") abbr = nbaMap[teamName];
  else if (sport === "nhl") abbr = nhlMap[teamName];
  else if (sport === "mlb") abbr = mlbMap[teamName];
  else if (sport === "nfl") abbr = nflMap[teamName];
  if (!abbr) return null;
  return `https://a.espncdn.com/i/teamlogos/${sport}/500/scoreboard/${abbr}.png`;
};

const formatOdds = (price) => {
  if (!price) return "—";
  return price > 0 ? `+${price}` : `${price}`;
};

const getTeamAbbr = (name) => {
  if (!name) return "—";
  return name.split(" ").slice(-1)[0].slice(0, 3).toUpperCase();
};

const statusStyle = (status) => {
  if (status === "PUBLISHED" || status === "WON") return { bg: "#DCFCE7", text: "#22C55E" };
  if (status === "SCHEDULED" || status === "PENDING") return { bg: "#FEF3C7", text: "#D97706" };
  if (status === "DRAFT" || status === "LOST") return { bg: "#FEE2E2", text: "#E8192C" };
  return { bg: "#E5E5E5", text: "#888888" };
};

const categorizeArticle = (article) => {
  const title = (article.title || "").toLowerCase();
  if (title.includes("trade") || title.includes("sign") || title.includes("deal") || title.includes("contract")) return { type: "TRADES", emoji: "🔄", color: "#3B82F6" };
  if (title.includes("record") || title.includes("upset") || title.includes("injury") || title.includes("breaking")) return { type: "BREAKING", emoji: "⚡", color: "#E8192C" };
  if (title.includes("score") || title.includes("win") || title.includes("loss") || title.includes("beat")) return { type: "SCORES", emoji: "🏆", color: "#22C55E" };
  if (title.includes("culture") || title.includes("music") || title.includes("movie") || title.includes("celebrity")) return { type: "CULTURE", emoji: "🔥", color: "#F97316" };
  if (title.includes("viral") || title.includes("twitter") || title.includes("reaction") || title.includes("meme")) return { type: "VIRAL", emoji: "📱", color: "#A855F7" };
  return { type: "BREAKING", emoji: "⚡", color: "#E8192C" };
};

const TeamLogo = ({ teamName, sport, size = 32 }) => {
  const logoUrl = getESPNLogo(teamName, sport);
  const [imgError, setImgError] = useState(false);
  if (!logoUrl || imgError) {
    return (
      <div style={{ width: size, height: size, background: "#222", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 900, color: "#aaa", flexShrink: 0 }}>
        {getTeamAbbr(teamName)}
      </div>
    );
  }
  return <img src={logoUrl} alt={teamName} onError={() => setImgError(true)} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
};

export default function AlleyKingsDashboard() {
  const [activeTab, setActiveTab] = useState("BRIEFING");
  const [activeSport, setActiveSport] = useState("ALL");
  const [storyFilter, setStoryFilter] = useState("ALL");
  const [clipFilter, setClipFilter] = useState("ALL");
  const [betFilter, setBetFilter] = useState("ALL");
  const [dbBets, setDbBets] = useState([]);
  const [dbClips, setDbClips] = useState([]);
  const [articles, setArticles] = useState([]);
  const [games, setGames] = useState([]);
  const [scores, setScores] = useState([]);
  const [oddsTicker, setOddsTicker] = useState([]);
  const [tickerHeadlines, setTickerHeadlines] = useState(["Loading latest sports news..."]);
  const [loading, setLoading] = useState(true);
  const [oddsLoading, setOddsLoading] = useState(true);
useEffect(() => {
    const fetchDbData = async () => {
      const { data: betsData } = await supabase.from("bets").select("*").order("created_at", { ascending: false });
      const { data: clipsData } = await supabase.from("clips").select("*").order("created_at", { ascending: false });
      if (betsData) setDbBets(betsData);
      if (clipsData) setDbClips(clipsData);
    };
    fetchDbData();
  }, []);
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const allGames = [];
        const allScores = [];
        const allOddsTicker = [];
        for (const sport of SPORT_CONFIGS) {
          try {
            const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${sport.key}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american&dateFormat=iso`);
            const oddsData = await oddsRes.json();
            if (Array.isArray(oddsData)) {
              oddsData.slice(0, 4).forEach(g => {
                allGames.push({ ...g, sportConfig: sport });
                const bk = g.bookmakers?.[0];
                const mkt = bk?.markets?.find(m => m.key === "h2h");
                const awayOdds = mkt?.outcomes?.find(o => o.name === g.away_team)?.price;
                const homeOdds = mkt?.outcomes?.find(o => o.name === g.home_team)?.price;
                if (awayOdds && homeOdds) {
                  allOddsTicker.push(`${sport.emoji} ${getTeamAbbr(g.away_team)} ${formatOdds(awayOdds)} vs ${getTeamAbbr(g.home_team)} ${formatOdds(homeOdds)}`);
                }
              });
            }
          } catch (e) {}
          try {
            const scoresRes = await fetch(`https://api.the-odds-api.com/v4/sports/${sport.key}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=1`);
            const scoresData = await scoresRes.json();
            if (Array.isArray(scoresData)) {
              scoresData.filter(g => g.completed).slice(0, 3).forEach(g => {
                allScores.push({ ...g, sportConfig: sport });
              });
            }
          } catch (e) {}
        }
        setGames(allGames);
        setScores(allScores);
        setOddsTicker(allOddsTicker);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setOddsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/.netlify/functions/news`);
        const data = await res.json();
        if (data.results) {
          const filtered = data.results.filter(a => a.title && a.title !== "[Removed]").map(a => ({
            title: a.title,
            url: a.link,
            source: { name: a.source_id },
            publishedAt: a.pubDate,
          }));
          setArticles(filtered);
          setTickerHeadlines(filtered.slice(0, 8).map(a => `📰 ${a.title}`));
        }
      } catch (err) {
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredGames = activeSport === "ALL" ? games : games.filter(g => g.sportConfig.label === activeSport);
  const filteredScores = activeSport === "ALL" ? scores : scores.filter(g => g.sportConfig.label === activeSport);
  const filteredArticles = storyFilter === "ALL" ? articles : articles.filter(a => categorizeArticle(a).type === storyFilter);
  const filteredClips = clipFilter === "ALL" ? dbClips : dbClips.filter(c => clipFilter === "DRAFTS" ? c.status === "DRAFT" : c.status === clipFilter);
  const filteredBets = betFilter === "ALL" ? dbBets : ["PENDING", "WON", "LOST"].includes(betFilter) ? dbBets.filter(b => b.status === betFilter) : dbBets.filter(b => b.bettor === betFilter);

  const newsTickerString = tickerHeadlines.join("     •     ");
  const oddsTickerString = oddsTicker.length > 0 ? oddsTicker.join("          |          ") : "Loading odds...";

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", background: "#0A0A0A", minHeight: "100vh", maxWidth: "100%", margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .filter-scroll { display: flex; overflow-x: auto; gap: 8px; padding: 0 16px 8px; scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .sport-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .sport-scroll::-webkit-scrollbar { display: none; }
        .tab { flex: 1; text-align: center; padding: 14px 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab.active { color: #E8192C; border-bottom-color: #E8192C; }
        .filter-btn { flex-shrink: 0; padding: 5px 14px; border-radius: 20px; border: none; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .sport-btn { padding: 5px 12px; border-radius: 6px; border: 1px solid #2a2a2a; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .sport-btn.active { background: white; color: black; border-color: white; }
        .sport-btn:not(.active) { background: transparent; color: #888; }
        .story-row { background: white; padding: 14px 16px; border-bottom: 1px solid #F0F0F0; border-left: 3px solid; display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .story-row:hover { background: #fafafa; }
        .member-card { background: white; border-radius: 12px; padding: 12px; min-width: 120px; flex-shrink: 0; border: 2px solid; }
        .stat-card { background: white; border-radius: 12px; padding: 14px 10px; min-width: 100px; flex-shrink: 0; text-align: center; border-top: 3px solid; }
        .clip-card { background: white; border-radius: 12px; padding: 14px; }
        .bet-card {
  background: #fff;
  border-radius: 18px;
  border-left: 5px solid #e8192c;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}
        .news-ticker { overflow: hidden; background: #E8192C; padding: 7px 0; }
        .news-ticker-inner { display: inline-block; white-space: nowrap; animation: newsticker 90s linear infinite; }
        .odds-ticker { overflow: hidden; background: #141414; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 5px 0; }
        .odds-ticker-inner { display: inline-block; white-space: nowrap; animation: oddsticker 50s linear infinite; }
        @keyframes newsticker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        @keyframes oddsticker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        .score-card { background: #111; border-radius: 12px; padding: 14px; flex-shrink: 0; min-width: 175px; }
        .upcoming-card { background: #111; border-radius: 12px; padding: 14px; flex-shrink: 0; min-width: 175px; }
        @media (max-width: 600px) {
  .bet-card {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .bet-card > div:nth-child(2) {
    text-align: left !important;
    border-left: none !important;
    border-right: none !important;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    padding: 12px 0 !important;
  }

  .bet-card > div:nth-child(3) {
    text-align: left !important;
  }
}
      `}</style>
<div className="odds-ticker">
        <div className="odds-ticker-inner">
          <span style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, paddingRight: 40 }}>
            {oddsTickerString} &nbsp;&nbsp;&nbsp; {oddsTickerString}
          </span>
        </div>
      </div>
      <div style={{ background: "#0D0D0D", padding: "12px 24px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "white", borderRadius: 6, padding: "4px 10px" }}>
            <span style={{ fontWeight: 900, fontSize: 13 }}>ALLEY</span>
            <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 13 }}>KINGS</span>
          </div>
          <span style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: 2, flex: 1 }}>SCOREBOARD</span>
          <span style={{ color: "#555", fontSize: 10, fontWeight: 700 }}>{oddsLoading ? "Loading..." : `${scores.length} FINALS`}</span>
        </div>

        <div className="sport-scroll" style={{ marginBottom: 14 }}>
          {["ALL", ...SPORT_CONFIGS.map(s => `${s.emoji} ${s.label}`)].map((s, i) => (
            <button key={s} onClick={() => setActiveSport(i === 0 ? "ALL" : SPORT_CONFIGS[i - 1].label)}
              className={`sport-btn ${(i === 0 ? activeSport === "ALL" : activeSport === SPORT_CONFIGS[i - 1].label) ? "active" : ""}`}>
              {s}
            </button>
          ))}
        </div>

        {filteredScores.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>FINAL SCORES</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {filteredScores.map((game, i) => {
                const cfg = game.sportConfig;
                const home = game.scores?.find(s => s.name === game.home_team);
                const away = game.scores?.find(s => s.name === game.away_team);
                const homeScore = parseInt(home?.score || 0);
                const awayScore = parseInt(away?.score || 0);
                const homeWon = homeScore > awayScore;
                const gameDate = new Date(game.commence_time);
                const dateStr = gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <div key={i} className="score-card" style={{ borderTop: `2px solid ${cfg.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ color: cfg.color, fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>{cfg.emoji} {cfg.label} • FINAL</span>
                      <span style={{ color: "#444", fontSize: 9 }}>{dateStr}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TeamLogo teamName={game.home_team} sport={cfg.espnSport} size={28} />
                        <span style={{ color: homeWon ? "white" : "#555", fontSize: 13, fontWeight: homeWon ? 800 : 500 }}>{game.home_team?.split(" ").slice(-1)[0]}</span>
                      </div>
                      <span style={{ color: homeWon ? "white" : "#555", fontSize: 22, fontWeight: 900 }}>{home?.score || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TeamLogo teamName={game.away_team} sport={cfg.espnSport} size={28} />
                        <span style={{ color: !homeWon ? "white" : "#555", fontSize: 13, fontWeight: !homeWon ? 800 : 500 }}>{game.away_team?.split(" ").slice(-1)[0]}</span>
                      </div>
                      <span style={{ color: !homeWon ? "white" : "#555", fontSize: 22, fontWeight: 900 }}>{away?.score || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredGames.length > 0 && (
          <div>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>UPCOMING</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {filteredGames.map((game, i) => {
                const cfg = game.sportConfig;
                const bk = game.bookmakers?.[0];
                const mkt = bk?.markets?.find(m => m.key === "h2h");
                const homeOdds = mkt?.outcomes?.find(o => o.name === game.home_team)?.price;
                const awayOdds = mkt?.outcomes?.find(o => o.name === game.away_team)?.price;
                const gameDate = new Date(game.commence_time);
                const isToday = gameDate.toDateString() === new Date().toDateString();
                const timeStr = gameDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                const dateStr = gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <div key={i} className="upcoming-card" style={{ borderTop: `2px solid ${cfg.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ color: cfg.color, fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>{cfg.emoji} {cfg.label}</span>
                      <span style={{ color: "#555", fontSize: 9 }}>{isToday ? `🕐 ${timeStr}` : dateStr}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TeamLogo teamName={game.away_team} sport={cfg.espnSport} size={28} />
                        <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{game.away_team?.split(" ").slice(-1)[0]}</span>
                      </div>
                      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 800 }}>{formatOdds(awayOdds)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TeamLogo teamName={game.home_team} sport={cfg.espnSport} size={28} />
                        <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{game.home_team?.split(" ").slice(-1)[0]}</span>
                      </div>
                      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 800 }}>{formatOdds(homeOdds)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      

      <div className="news-ticker">
        <div className="news-ticker-inner">
          <span style={{ color: "white", fontSize: 11, fontWeight: 700, paddingRight: 60 }}>
            {newsTickerString} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {newsTickerString}
          </span>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "20px 20px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, background: "#FEE2E2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👑</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>DAILY <span style={{ color: "#E8192C" }}>BRIEFING</span></div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#888" }}>SPORTS CULTURE INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888" }}>LATEST EDITION</div>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()},<br />
              {new Date().toLocaleDateString("en-US", { month: "short" }).toUpperCase()} {new Date().getDate()},<br />
              {new Date().getFullYear()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          {[{ key: "BRIEFING", label: "📰 BRIEFING" }, { key: "CLIPS", label: "🎙️ PODCAST CLIPS" }, { key: "BETS", label: "🎲 OUR BETS" }].map(t => (
            <div key={t.key} className={`tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</div>
          ))}
        </div>

        {activeTab === "BRIEFING" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #eee" }}>
              <div style={{ width: 50, height: 50, background: "#FEE2E2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👑</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>ALLEY KINGS <span style={{ color: "#E8192C" }}>MEDIA</span></div>
                <div style={{ fontSize: 11, color: "#888" }}>Your daily dose of sports culture — curated stories from across the game.</div>
              </div>
            </div>
            <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "14px 16px" }}>
              {[
                { label: "TOTAL STORIES", value: articles.length || "—", color: "#E8192C" },
                { label: "BREAKING", value: articles.filter(a => categorizeArticle(a).type === "BREAKING").length || "—", color: "#E8192C" },
                { label: "TRADES", value: articles.filter(a => categorizeArticle(a).type === "TRADES").length || "—", color: "#3B82F6" },
                { label: "CULTURE", value: articles.filter(a => categorizeArticle(a).type === "CULTURE").length || "—", color: "#F97316" },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 10px" }}>
              <div style={{ width: 4, height: 28, background: "#E8192C", borderRadius: 2 }} />
              <span style={{ fontSize: 22, fontWeight: 900 }}>ALL STORIES</span>
              <span style={{ background: "#E8192C", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10 }}>{articles.length}</span>
            </div>
            <div className="filter-scroll">
              {storyFilters.map(f => (
                <button key={f} className="filter-btn" onClick={() => setStoryFilter(f)} style={{ background: storyFilter === f ? "#E8192C" : "#F4F4F4", color: storyFilter === f ? "white" : "#888" }}>{f}</button>
              ))}
            </div>
            {loading ? (
              <div style={{ padding: 30, textAlign: "center", color: "#888", fontSize: 13 }}>Loading latest stories...</div>
            ) : (
              <div>
                {filteredArticles.map((article, i) => {
                  const cat = categorizeArticle(article);
                  return (
                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div className="story-row" style={{ borderLeftColor: cat.color }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                            <span style={{ background: cat.color + "22", color: cat.color, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>{cat.emoji} {cat.type}</span>
                            <span style={{ color: "#E8192C", fontSize: 10, fontWeight: 800 }}>{article.source?.name || "ESPN"}</span>
                            <span style={{ color: "#bbb", fontSize: 9, marginLeft: "auto" }}>{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: "#111" }}>{article.title}</div>
                        </div>
                        <span style={{ color: "#ccc", fontSize: 16, marginTop: 2 }}>›</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "CLIPS" && (
          <div style={{ padding: "0 0 20px" }}>
            <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "14px 16px" }}>
              {[
                { label: "TOTAL CLIPS", value: "12", icon: "🎙️", color: "#E8192C" },
                { label: "TOTAL VIEWS", value: "202K", icon: "👁️", color: "#3B82F6" },
                { label: "TOTAL LIKES", value: "14.1K", icon: "❤️", color: "#F5A623" },
                { label: "PUBLISHED", value: "10", icon: "✅", color: "#22C55E" },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                  <div style={{ fontSize: 9, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888" }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 10px" }}>
              <div style={{ width: 4, height: 28, background: "#E8192C", borderRadius: 2 }} />
              <span style={{ fontSize: 22, fontWeight: 900 }}>CLIPS</span>
            </div>
            <div className="filter-scroll">
              {clipFilters.map(f => (
                <button key={f} className="filter-btn" onClick={() => setClipFilter(f)} style={{ background: clipFilter === f ? "#E8192C" : "#F4F4F4", color: clipFilter === f ? "white" : "#888" }}>{f}</button>
              ))}
            </div>
            <div style={{ padding: "10px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filteredClips.map(c => {
                const s = statusStyle(c.status);
                return (
                  <a key={c.id} href={c.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div className="clip-card" style={{ border: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ background: s.bg, color: s.text, fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>{c.status}</span>
                        <span style={{ fontSize: 9, color: "#888" }}>{c.date}</span>
                      </div>
                      <div style={{ width: "100%", height: 60, background: "#f4f4f4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 20 }}>🎧</div>
                      <div style={{ fontSize: 9, color: "#888", marginBottom: 4 }}>{c.ep}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2, marginBottom: 4, color: "#111" }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>{c.desc}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ background: "#EF4444", color: "white", fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>{c.tag}</span>
                        <span style={{ fontSize: 9, color: "#888" }}>⏱ {c.duration}</span>
                        <span style={{ fontSize: 9, color: "#888" }}>👁 {c.views}</span>
                        <span style={{ fontSize: 9, color: "#888" }}>❤️ {c.likes}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "BETS" && (
          <div style={{ padding: "0 0 30px" }}>
            <div style={{ padding: "14px 16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 4, height: 28, background: "#F5A623", borderRadius: 2 }} />
                <span style={{ fontSize: 22, fontWeight: 900 }}>LEADERBOARD</span>
              </div>
              <div style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 10 }}>
                {members.map(m => (
                  <div key={m.name} className="member-card" style={{ borderColor: m.color }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: m.color }}>{m.name}</div>
                    <div style={{ fontSize: 9, color: "#888", marginBottom: 6 }}>{m.wins}W {m.losses}L {m.pending}P</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: m.pnl.startsWith("+") ? "#22C55E" : m.pnl.startsWith("-") ? "#E8192C" : "#888" }}>{m.pnl}</div>
                    <div style={{ height: 3, background: m.color, borderRadius: 2, marginTop: 6, width: "60%" }} />
                  </div>
                ))}
              </div>
              <div style={{ background: "#F4F4F4", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#888" }}>CREW NET P&L:</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#22C55E" }}>+$111.22</span>
              </div>
            </div>
            <div style={{ padding: "0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 4, height: 28, background: "#E8192C", borderRadius: 2 }} />
                <span style={{ fontSize: 22, fontWeight: 900 }}>ALL BETS</span>
                <span style={{ background: "#E8192C", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10 }}>{dbBets.length}</span>
              </div>
              <div className="filter-scroll" style={{ margin: "0 -16px", paddingLeft: 16, paddingBottom: 10 }}>
                {betFilters.map(f => (
                  <button key={f} className="filter-btn" onClick={() => setBetFilter(f)} style={{ background: betFilter === f ? "#0A0A0A" : "#F4F4F4", color: betFilter === f ? "white" : "#888" }}>{f}</button>
                ))}
              </div>
             {filteredBets.map(b => {
  const s = statusStyle(b.status);
  const member = members.find(m => m.name === b.bettor);

  return (
    <div
      key={b.id}
      className="bet-card"
      style={{
        borderLeftColor: member?.color || "#E8192C",
        display: "grid",
        gridTemplateColumns: "1fr 90px 100px",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        marginBottom: 12,
        minHeight: 105,
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: member?.color || "#888",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {b.bettor}
          </span>

          <span
            style={{
              background: "#F4F4F4",
              color: "#777",
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {b.sport || "NBA"}
          </span>
        </div>

        <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>
          {b.type}
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#111",
            lineHeight: 1.25,
            maxWidth: "100%",
          }}
        >
          {b.detail}
        </div>

        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
          {b.odds}
        </div>

        {b.note && (
          <div
            style={{
              fontSize: 11,
              color: "#888",
              fontStyle: "italic",
              marginTop: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            💬 {b.note}
          </div>
        )}
      </div>

      {/* STAKE */}
      <div
        style={{
          textAlign: "center",
          borderLeft: "1px solid #eee",
          borderRight: "1px solid #eee",
          padding: "0 10px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "#888",
            fontWeight: 800,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          STAKE
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#111",
          }}
        >
          ${b.stake}
        </div>
      </div>

      {/* STATUS + TO WIN */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            display: "inline-block",
            background: s.bg,
            color: s.text,
            fontSize: 9,
            fontWeight: 900,
            borderRadius: 999,
            padding: "5px 9px",
            marginBottom: 12,
          }}
        >
          {b.status === "PENDING"
            ? "⏳ PENDING"
            : b.status === "WON"
            ? "✅ WON"
            : "❌ LOST"}
        </div>

        <div
          style={{
            fontSize: 9,
            color: "#888",
            fontWeight: 800,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          TO WIN
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#3B82F6",
          }}
        >
          ${b.toWin}
        </div>
      </div>
    </div>
  );
})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}