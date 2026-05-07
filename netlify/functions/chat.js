const fetchESPNData = async () => {
  try {
    const [scoresRes, injuriesRes] = await Promise.all([
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"),
      fetch("https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/injuries?limit=300"),
    ]);

    const [scoresData, injuriesData] = await Promise.all([
      scoresRes.json(),
      injuriesRes.json(),
    ]);

    let context = "\n\n=== LIVE NBA DATA (Updated Now) ===\n";

    // Today's games
    const games = scoresData?.events || [];
    if (games.length > 0) {
      context += "\nTODAY'S NBA GAMES:\n";
      games.forEach(game => {
        const comp = game.competitions?.[0];
        const home = comp?.competitors?.find(t => t.homeAway === "home");
        const away = comp?.competitors?.find(t => t.homeAway === "away");
        const status = game.status?.type?.description || "Scheduled";
        const homeScore = home?.score || "";
        const awayScore = away?.score || "";
        const homeName = home?.team?.displayName || home?.team?.name || "TBD";
        const awayName = away?.team?.displayName || away?.team?.name || "TBD";
        context += `${awayName} ${awayScore} @ ${homeName} ${homeScore} — ${status}\n`;
      });
    } else {
      context += "\nNo NBA games today.\n";
    }

    // Rosters for today's teams
    if (games.length > 0) {
      context += "\nROSTERS FOR TODAY'S TEAMS:\n";
      for (const game of games.slice(0, 6)) {
        const competitors = game.competitions?.[0]?.competitors || [];
        for (const team of competitors) {
          const teamId = team.team?.id;
          const teamName = team.team?.displayName || team.team?.name;
          if (!teamId) continue;
          try {
            const rosterRes = await fetch(
              `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`
            );
            const rosterData = await rosterRes.json();
            const players = rosterData?.athletes?.flatMap(g => g.items || []) || [];
            const playerNames = players.map(p => p.displayName || p.fullName).filter(Boolean).join(", ");
            if (playerNames) context += `${teamName}: ${playerNames}\n`;
          } catch (e) {}
        }
      }
    }

    // Injuries - use team-specific endpoints
    context += "\nINJURY REPORT:\n";
    const teamsRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams");
    const teamsData = await teamsRes.json();
    const teams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || [];

    for (const teamObj of teams.slice(0, 10)) {
      const teamId = teamObj?.team?.id;
      const teamName = teamObj?.team?.displayName;
      if (!teamId) continue;
      try {
        const injRes = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/injuries`
        );
        const injData = await injRes.json();
        const injured = injData?.injuries || [];
        if (injured.length > 0) {
          injured.forEach(p => {
            const name = p?.athlete?.displayName;
            const status = p?.status;
            const detail = p?.details?.type || "";
            if (name) context += `${teamName}: ${name} — ${status} ${detail}\n`;
          });
        }
      } catch (e) {}
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