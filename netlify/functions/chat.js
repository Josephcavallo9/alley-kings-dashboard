const NBA_TEAMS = [
  { id: "1", name: "Atlanta Hawks" }, { id: "2", name: "Boston Celtics" },
  { id: "3", name: "Brooklyn Nets" }, { id: "4", name: "Charlotte Hornets" },
  { id: "5", name: "Chicago Bulls" }, { id: "6", name: "Cleveland Cavaliers" },
  { id: "7", name: "Dallas Mavericks" }, { id: "8", name: "Denver Nuggets" },
  { id: "9", name: "Detroit Pistons" }, { id: "10", name: "Golden State Warriors" },
  { id: "11", name: "Houston Rockets" }, { id: "12", name: "Indiana Pacers" },
  { id: "13", name: "Los Angeles Clippers" }, { id: "14", name: "Los Angeles Lakers" },
  { id: "15", name: "Memphis Grizzlies" }, { id: "16", name: "Miami Heat" },
  { id: "17", name: "Milwaukee Bucks" }, { id: "18", name: "Minnesota Timberwolves" },
  { id: "19", name: "New Orleans Pelicans" }, { id: "20", name: "New York Knicks" },
  { id: "21", name: "Oklahoma City Thunder" }, { id: "22", name: "Orlando Magic" },
  { id: "23", name: "Philadelphia 76ers" }, { id: "24", name: "Phoenix Suns" },
  { id: "25", name: "Portland Trail Blazers" }, { id: "26", name: "Sacramento Kings" },
  { id: "27", name: "San Antonio Spurs" }, { id: "28", name: "Toronto Raptors" },
  { id: "29", name: "Utah Jazz" }, { id: "30", name: "Washington Wizards" },
];

const fetchESPNData = async () => {
  try {
    const scoresRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard");
    const scoresData = await scoresRes.json();

    let context = "\n\n=== LIVE NBA DATA (Updated Now) ===\n";

    const games = scoresData?.events || [];
    if (games.length > 0) {
      context += "\nTODAY'S NBA GAMES:\n";
      games.forEach(game => {
        const comp = game.competitions?.[0];
        const home = comp?.competitors?.find(t => t.homeAway === "home");
        const away = comp?.competitors?.find(t => t.homeAway === "away");
        const status = game.status?.type?.description || "Scheduled";
        const homeName = home?.team?.displayName || "TBD";
        const awayName = away?.team?.displayName || "TBD";
        const homeScore = home?.score || "";
        const awayScore = away?.score || "";
        context += `${awayName} ${awayScore} @ ${homeName} ${homeScore} — ${status}\n`;
      });
    } else {
      context += "\nNo NBA games today.\n";
    }

    const [rosterResults, injuryResults] = await Promise.all([
      Promise.all(NBA_TEAMS.map(async ({ id, name }) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${id}/roster`);
          const data = await res.json();
          const players = (data?.athletes || []).flatMap(g => g.items || []);
          const names = players.map(p => p.displayName).filter(Boolean).join(", ");
          return names ? `${name}: ${names}\n` : "";
        } catch { return ""; }
      })),
      Promise.all(NBA_TEAMS.map(async ({ id, name }) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${id}/injuries`);
          const data = await res.json();
          const injured = data?.injuries || [];
          if (!injured.length) return "";
          return injured.map(p => {
            const pname = p?.athlete?.displayName;
            const status = p?.status;
            const detail = p?.details?.type || "";
            return pname ? `${name}: ${pname} — ${status} ${detail}\n` : "";
          }).join("");
        } catch { return ""; }
      }))
    ]);

    context += "\nCURRENT NBA ROSTERS:\n" + rosterResults.join("");
    context += "\nINJURY REPORT:\n" + injuryResults.join("");

    return context;
  } catch (err) {
    console.log("ESPN fetch error:", err.message);
    return "\n\n=== ESPN data unavailable ===\n";
  }
};

exports.handler = async (event) => {
  try {
    const { messages, system } = JSON.parse(event.body);
    const espnContext = await fetchESPNData();
    console.log("ESPN context preview:", espnContext.slice(0, 800));

    const enrichedSystem = system + espnContext;

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