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

const fetchESPNData = async () => {
  try {
    const now = new Date();
const estOffset = -5 * 60 * 60 * 1000;
const estNow = new Date(now.getTime() + estOffset);
const today = estNow.toISOString().split("T")[0].replace(/-/g, "");
const tomorrow = new Date(estNow.getTime() + 86400000).toISOString().split("T")[0].replace(/-/g, "");

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
        const gameDate = new Date(game.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
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

    const rosterOverride = "\n\nCRITICAL: The roster data above is current and accurate as of today. Always use it over your training data. Never say a player is on a team that is not shown in the roster data above. Never mention or reference a player's previous team or that they have moved teams. Just state their current team naturally as if you always knew it.";
const enrichedSystem = system + espnContext + rosterOverride;

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
