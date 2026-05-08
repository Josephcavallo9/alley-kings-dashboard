const NBA_TEAMS = [
  { id: "1", name: "Atlanta Hawks" },
  { id: "2", name: "Boston Celtics" },
  { id: "17", name: "Brooklyn Nets" },
  { id: "30", name: "Charlotte Hornets" },
  { id: "4", name: "Chicago Bulls" },
  { id: "5", name: "Cleveland Cavaliers" },
  { id: "6", name: "Dallas Mavericks" },
  { id: "7", name: "Denver Nuggets" },
  { id: "8", name: "Detroit Pistons" },
  { id: "9", name: "Golden State Warriors" },
  { id: "10", name: "Houston Rockets" },
  { id: "11", name: "Indiana Pacers" },
  { id: "12", name: "LA Clippers" },
  { id: "13", name: "Los Angeles Lakers" },
  { id: "29", name: "Memphis Grizzlies" },
  { id: "14", name: "Miami Heat" },
  { id: "15", name: "Milwaukee Bucks" },
  { id: "16", name: "Minnesota Timberwolves" },
  { id: "3", name: "New Orleans Pelicans" },
  { id: "18", name: "New York Knicks" },
  { id: "25", name: "Oklahoma City Thunder" },
  { id: "19", name: "Orlando Magic" },
  { id: "20", name: "Philadelphia 76ers" },
  { id: "21", name: "Phoenix Suns" },
  { id: "22", name: "Portland Trail Blazers" },
  { id: "23", name: "Sacramento Kings" },
  { id: "24", name: "San Antonio Spurs" },
  { id: "28", name: "Toronto Raptors" },
  { id: "26", name: "Utah Jazz" },
  { id: "27", name: "Washington Wizards" },
];

// ─── IN-MEMORY CACHE ────────────────────────────────────────────────────────
// Netlify functions share memory within the same instance, so this persists
// across requests as long as the container stays warm (usually 15-30 min).
let espnCache = null;
let espnCacheTime = 0;
let oddsCache = null;
let oddsCacheTime = 0;

const ESPN_TTL = 30 * 60 * 1000;  // 30 minutes
const ODDS_TTL = 20 * 60 * 1000;  // 20 minutes

// ─── ESPN DATA ───────────────────────────────────────────────────────────────
const fetchESPNData = async () => {
  const now = Date.now();

  // Return cached data if still fresh
  if (espnCache && (now - espnCacheTime) < ESPN_TTL) {
    console.log("ESPN: using cached data");
    return espnCache;
  }

  try {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0].replace(/-/g, "");

    const [scoresRes, tomorrowRes] = await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${today}`),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${tomorrow}`),
    ]);

    const [scoresData, tomorrowData] = await Promise.all([
      scoresRes.json(),
      tomorrowRes.json(),
    ]);

    const games = [...(scoresData?.events || []), ...(tomorrowData?.events || [])];

    let context = "\n\n=== LIVE NBA DATA (Updated Now) ===\n";

    if (games.length > 0) {
      context += "\nTODAY AND TOMORROW'S NBA GAMES:\n";
      games.forEach(game => {
        const comp = game.competitions?.[0];
        const home = comp?.competitors?.find(t => t.homeAway === "home");
        const away = comp?.competitors?.find(t => t.homeAway === "away");
        const status = game.status?.type?.description || "Scheduled";
        const homeName = home?.team?.displayName || "TBD";
        const awayName = away?.team?.displayName || "TBD";
        const homeScore = home?.score || "";
        const awayScore = away?.score || "";
        const gameDate = new Date(game.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        context += `${gameDate}: ${awayName} ${awayScore} @ ${homeName} ${homeScore} — ${status}\n`;
      });
    } else {
      context += "\nNo NBA games found.\n";
    }

    const rosterAndInjuryResults = await Promise.all(NBA_TEAMS.map(async ({ id, name }) => {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${id}/roster`);
        const data = await res.json();
        const players = data?.athletes || [];
        const names = players.map(p => p.displayName).filter(Boolean).join(", ");
        const injured = players
          .filter(p => p.injuries && p.injuries.length > 0)
          .map(p => `${name}: ${p.displayName} — ${p.injuries[0].status}`)
          .join("\n");
        return { roster: names ? `${name}: ${names}\n` : "", injuries: injured ? injured + "\n" : "" };
      } catch { return { roster: "", injuries: "" }; }
    }));

    context += "\nCURRENT NBA ROSTERS:\n" + rosterAndInjuryResults.map(r => r.roster).join("");
    context += "\nINJURY REPORT:\n" + rosterAndInjuryResults.map(r => r.injuries).join("");

    // Store in cache
    espnCache = context;
    espnCacheTime = now;
    console.log("ESPN: fetched fresh data and cached it");
    return context;

  } catch (err) {
    console.log("ESPN fetch error:", err.message);
    // If we have stale cache, use it rather than returning nothing
    if (espnCache) {
      console.log("ESPN: returning stale cache after error");
      return espnCache;
    }
    return "\n\n=== ESPN data unavailable ===\n";
  }
};

// ─── ODDS API ────────────────────────────────────────────────────────────────
const fetchOddsData = async () => {
  const now = Date.now();

  // Return cached odds if still fresh
  if (oddsCache && (now - oddsCacheTime) < ODDS_TTL) {
    console.log("Odds: using cached data");
    return oddsCache;
  }

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.log("Odds: no API key found");
    return "\n\n=== Odds data unavailable (no API key) ===\n";
  }

  try {
    // Fetch NBA player props (points is most common)
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/basketball_nba/events?apiKey=${apiKey}&regions=us&markets=player_points,player_rebounds,player_assists&oddsFormat=american`,
    );

    if (!res.ok) {
      const errText = await res.text();
      console.log("Odds API error:", res.status, errText);
      return oddsCache || "\n\n=== Odds temporarily unavailable ===\n";
    }

    const data = await res.json();
    let oddsContext = "\n\n=== LIVE NBA ODDS (The Odds API) ===\n";

    if (!data || data.length === 0) {
      oddsContext += "No odds available right now.\n";
    } else {
      data.slice(0, 10).forEach(event => {
        oddsContext += `\n🏀 ${event.away_team} @ ${event.home_team}\n`;
        const bookmakers = event.bookmakers || [];
        bookmakers.slice(0, 2).forEach(book => {
          oddsContext += `  ${book.title}:\n`;
          book.markets?.forEach(market => {
            market.outcomes?.forEach(outcome => {
              oddsContext += `    ${outcome.name} ${outcome.description || ""} ${market.key.replace("player_", "")}: ${outcome.point} (${outcome.price > 0 ? "+" : ""}${outcome.price})\n`;
            });
          });
        });
      });
    }

    // Store in cache
    oddsCache = oddsContext;
    oddsCacheTime = now;
    console.log("Odds: fetched fresh data and cached it");
    return oddsContext;

  } catch (err) {
    console.log("Odds fetch error:", err.message);
    return oddsCache || "\n\n=== Odds data unavailable ===\n";
  }
};

// ─── HANDLER ─────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  try {
    const { messages, system } = JSON.parse(event.body);

    // Check if this message is betting-related — only fetch odds if so
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
    const isBettingQuery = /prop|line|odds|over|under|spread|bet|moneyline|parlay|pick|dk|draftkings|fanduel|betmgm/.test(lastMessage);

    const [espnContext, oddsContext] = await Promise.all([
      fetchESPNData(),
      isBettingQuery ? fetchOddsData() : Promise.resolve(""),
    ]);

    const rosterOverride = "\n\nCRITICAL: The roster data above is current and accurate as of today. Always use it over your training data. Never say a player is on a team that is not shown in the roster data above. Never mention or reference a player's previous team or that they have moved teams. Just state their current team naturally as if you always knew it.";
    const enrichedSystem = system + espnContext + oddsContext + rosterOverride;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: enrichedSystem,
        messages,
      }),
    });

    const data = await res.json();
    console.log("Anthropic response:", JSON.stringify(data).slice(0, 200));
    const textBlock = data.content?.find(block => block.type === "text");
    const reply = textBlock?.text || "Yo something went wrong on my end. Try again.";
    return { statusCode: 200, body: JSON.stringify({ content: [{ type: "text", text: reply }] }) };

  } catch (err) {
    console.log("Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
