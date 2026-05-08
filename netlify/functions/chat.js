const fetchESPNData = async () => {
  try {
    const [scoresRes, teamsRes] = await Promise.all([
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"),
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"),
    ]);

    const [scoresData, teamsData] = await Promise.all([
      scoresRes.json(),
      teamsRes.json(),
    ]);

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

    const teams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || [];

    context += "\nCURRENT NBA ROSTERS:\n";
    const rosterPromises = teams.slice(0, 30).map(async (teamObj) => {
      const teamId = teamObj?.team?.id;
      const teamName = teamObj?.team?.displayName;
      if (!teamId) return "";
      try {
        const rosterRes = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`
        );
        const rosterData = await rosterRes.json();
        const players = rosterData?.athletes?.flatMap(g => g.items || []) || [];
        const playerNames = players.map(p => p.displayName).filter(Boolean).join(", ");
        return playerNames ? `${teamName}: ${playerNames}\n` : "";
      } catch (e) {
        return "";
      }
    });

    const rosterResults = await Promise.all(rosterPromises);
    context += rosterResults.join("");

    context += "\nINJURY REPORT:\n";
    const injuryPromises = teams.slice(0, 30).map(async (teamObj) => {
      const teamId = teamObj?.team?.id;
      const teamName = teamObj?.team?.displayName;
      if (!teamId) return "";
      try {
        const injRes = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/injuries`
        );
        const injData = await injRes.json();
        const injured = injData?.injuries || [];
        if (injured.length === 0) return "";
        return injured.map(p => {
          const name = p?.athlete?.displayName;
          const status = p?.status;
          const detail = p?.details?.type || "";
          return name ? `${teamName}: ${name} — ${status} ${detail}\n` : "";
        }).join("");
      } catch (e) {
        return "";
      }
    });

    const injuryResults = await Promise.all(injuryPromises);
    context += injuryResults.join("");

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
    console.log("ESPN context preview:", espnContext.slice(0, 500));
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
    console.log("Anthropic response:", JSON.stringify(data));
    const textBlock = data.content?.find(block => block.type === "text");
    const reply = textBlock?.text || "Yo something went wrong on my end. Try again.";
    return { statusCode: 200, body: JSON.stringify({ content: [{ type: "text", text: reply }] }) };
  } catch (err) {
    console.log("Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};