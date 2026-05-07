const fetchESPNData = async () => {
  try {
    const [injuriesRes, scoresRes, teamsRes] = await Promise.all([
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries"),
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"),
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"),
    ]);

    const [injuriesData, scoresData, teamsData] = await Promise.all([
      injuriesRes.json(),
      scoresRes.json(),
      teamsRes.json(),
    ]);

    let context = "\n\n=== LIVE NBA DATA (Updated Now) ===\n";

    // Today's games
    const games = scoresData?.events || [];
    if (games.length > 0) {
      context += "\nTODAY'S NBA GAMES:\n";
      games.forEach(game => {
        const home = game.competitions?.[0]?.competitors?.find(t => t.homeAway === "home");
        const away = game.competitions?.[0]?.competitors?.find(t => t.homeAway === "away");
        const status = game.status?.type?.description || "";
        const homeScore = home?.score || "";
        const awayScore = away?.score || "";
        context += `${away?.team?.displayName} ${awayScore} @ ${home?.team?.displayName} ${homeScore} — ${status}\n`;
      });
    } else {
      context += "\nNo NBA games scheduled today.\n";
    }

    // Injury report
    const injuries = injuriesData?.injuries || [];
    if (injuries.length > 0) {
      context += "\nCURRENT NBA INJURY REPORT:\n";
      injuries.slice(0, 20).forEach(team => {
        const teamName = team.team?.displayName;
        const players = team.injuries || [];
        players.forEach(p => {
          context += `${teamName}: ${p.athlete?.displayName} — ${p.status} (${p.type || ""})\n`;
        });
      });
    }

    // Active rosters for today's teams
    if (games.length > 0) {
      context += "\nROSTERS FOR TODAY'S TEAMS:\n";
      for (const game of games.slice(0, 4)) {
        const competitors = game.competitions?.[0]?.competitors || [];
        for (const team of competitors) {
          const teamId = team.team?.id;
          const teamName = team.team?.displayName;
          try {
            const rosterRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`);
            const rosterData = await rosterRes.json();
            const players = rosterData?.athletes?.flatMap(g => g.items || []) || [];
            const playerNames = players.map(p => p.displayName).join(", ");
            context += `${teamName}: ${playerNames}\n`;
          } catch (e) {}
        }
      }
    }

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