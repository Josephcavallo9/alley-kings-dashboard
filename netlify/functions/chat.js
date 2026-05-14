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

const NFL_TEAMS = [
  { id: "22", name: "Arizona Cardinals" },
  { id: "1", name: "Atlanta Falcons" },
  { id: "33", name: "Baltimore Ravens" },
  { id: "2", name: "Buffalo Bills" },
  { id: "29", name: "Carolina Panthers" },
  { id: "3", name: "Chicago Bears" },
  { id: "4", name: "Cincinnati Bengals" },
  { id: "5", name: "Cleveland Browns" },
  { id: "6", name: "Dallas Cowboys" },
  { id: "7", name: "Denver Broncos" },
  { id: "8", name: "Detroit Lions" },
  { id: "9", name: "Green Bay Packers" },
  { id: "34", name: "Houston Texans" },
  { id: "11", name: "Indianapolis Colts" },
  { id: "30", name: "Jacksonville Jaguars" },
  { id: "12", name: "Kansas City Chiefs" },
  { id: "13", name: "Las Vegas Raiders" },
  { id: "24", name: "Los Angeles Chargers" },
  { id: "14", name: "Los Angeles Rams" },
  { id: "15", name: "Miami Dolphins" },
  { id: "16", name: "Minnesota Vikings" },
  { id: "17", name: "New England Patriots" },
  { id: "18", name: "New Orleans Saints" },
  { id: "19", name: "New York Giants" },
  { id: "20", name: "New York Jets" },
  { id: "21", name: "Philadelphia Eagles" },
  { id: "23", name: "Pittsburgh Steelers" },
  { id: "25", name: "San Francisco 49ers" },
  { id: "26", name: "Seattle Seahawks" },
  { id: "27", name: "Tampa Bay Buccaneers" },
  { id: "28", name: "Tennessee Titans" },
  { id: "10", name: "Washington Commanders" },
];

const MLB_TEAMS = [
  { id: "1", name: "Los Angeles Angels" },
  { id: "2", name: "Houston Astros" },
  { id: "3", name: "Oakland Athletics" },
  { id: "4", name: "Toronto Blue Jays" },
  { id: "5", name: "Atlanta Braves" },
  { id: "6", name: "Milwaukee Brewers" },
  { id: "7", name: "St. Louis Cardinals" },
  { id: "8", name: "Chicago Cubs" },
  { id: "9", name: "Seattle Mariners" },
  { id: "10", name: "Washington Nationals" },
  { id: "11", name: "New York Mets" },
  { id: "12", name: "Philadelphia Phillies" },
  { id: "13", name: "Miami Marlins" },
  { id: "14", name: "New York Yankees" },
  { id: "15", name: "San Francisco Giants" },
  { id: "16", name: "Cleveland Guardians" },
  { id: "17", name: "Detroit Tigers" },
  { id: "18", name: "Boston Red Sox" },
  { id: "19", name: "Colorado Rockies" },
  { id: "20", name: "Kansas City Royals" },
  { id: "21", name: "Chicago White Sox" },
  { id: "22", name: "Minnesota Twins" },
  { id: "23", name: "Pittsburgh Pirates" },
  { id: "24", name: "Tampa Bay Rays" },
  { id: "25", name: "Texas Rangers" },
  { id: "26", name: "Baltimore Orioles" },
  { id: "27", name: "San Diego Padres" },
  { id: "28", name: "Cincinnati Reds" },
  { id: "29", name: "Arizona Diamondbacks" },
  { id: "30", name: "Los Angeles Dodgers" },
];

const NHL_TEAMS = [
  { id: "25", name: "Anaheim Ducks" },
  { id: "1", name: "Boston Bruins" },
  { id: "2", name: "Buffalo Sabres" },
  { id: "3", name: "Calgary Flames" },
  { id: "4", name: "Carolina Hurricanes" },
  { id: "5", name: "Chicago Blackhawks" },
  { id: "6", name: "Colorado Avalanche" },
  { id: "7", name: "Columbus Blue Jackets" },
  { id: "8", name: "Dallas Stars" },
  { id: "9", name: "Detroit Red Wings" },
  { id: "10", name: "Edmonton Oilers" },
  { id: "26", name: "Florida Panthers" },
  { id: "11", name: "Los Angeles Kings" },
  { id: "12", name: "Minnesota Wild" },
  { id: "13", name: "Montreal Canadiens" },
  { id: "14", name: "Nashville Predators" },
  { id: "15", name: "New Jersey Devils" },
  { id: "16", name: "New York Islanders" },
  { id: "17", name: "New York Rangers" },
  { id: "18", name: "Ottawa Senators" },
  { id: "19", name: "Philadelphia Flyers" },
  { id: "20", name: "Pittsburgh Penguins" },
  { id: "28", name: "San Jose Sharks" },
  { id: "21", name: "Seattle Kraken" },
  { id: "22", name: "St. Louis Blues" },
  { id: "23", name: "Tampa Bay Lightning" },
  { id: "24", name: "Toronto Maple Leafs" },
  { id: "27", name: "Utah Hockey Club" },
  { id: "29", name: "Vancouver Canucks" },
  { id: "30", name: "Vegas Golden Knights" },
  { id: "31", name: "Washington Capitals" },
  { id: "32", name: "Winnipeg Jets" },
];

// ─── ESPN FETCHERS ────────────────────────────────────────────────────────────

const getDateStrings = () => {
  const now = new Date();
  const estOffset = -5 * 60 * 60 * 1000;
  const estNow = new Date(now.getTime() + estOffset);
  const today = estNow.toISOString().split("T")[0].replace(/-/g, "");
  const tomorrow = new Date(estNow.getTime() + 86400000).toISOString().split("T")[0].replace(/-/g, "");
  return { today, tomorrow };
};

const fetchScoreboard = async (sport, league) => {
  const { today, tomorrow } = getDateStrings();
  try {
    const [todayRes, tomorrowRes] = await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${today}`),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${tomorrow}`),
    ]);
    const [todayData, tomorrowData] = await Promise.all([todayRes.json(), tomorrowRes.json()]);
    return [...(todayData?.events || []), ...(tomorrowData?.events || [])];
  } catch {
    return [];
  }
};

const extractPlayers = (data) => {
  const athletes = data?.athletes || [];
  // NFL (and some other sports) return athletes grouped: [{position: "Offense", items: [...]}, ...]
  // NBA returns a flat array of player objects directly
  if (athletes.length > 0 && athletes[0].items) {
    return athletes.flatMap(group => group.items || []);
  }
  return athletes;
};

const fetchRosters = async (sport, league, teams) => {
  return Promise.all(
    teams.map(async ({ id, name }) => {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${id}/roster`);
        const data = await res.json();
        const players = extractPlayers(data);
        const names = players.map(p => p.displayName || p.fullName).filter(Boolean).join(", ");
        const injured = players
          .filter(p => p.injuries && p.injuries.length > 0)
          .map(p => `${name}: ${p.displayName || p.fullName} — ${p.injuries[0].status}`)
          .join("\n");
        return { roster: names ? `${name}: ${names}\n` : "", injuries: injured ? injured + "\n" : "" };
      } catch {
        return { roster: "", injuries: "" };
      }
    })
  );
};

const formatGames = (games, label) => {
  if (!games.length) return `\nNo ${label} games found.\n`;
  let out = `\nTODAY AND TOMORROW'S ${label} GAMES:\n`;
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
    out += `${gameDate}: ${awayName} ${awayScore} @ ${homeName} ${homeScore} — ${status}\n`;
  });
  return out;
};

// ─── MAIN DATA FETCH ──────────────────────────────────────────────────────────

const fetchAllSportsData = async () => {
  try {
    const [nbaGames, nflGames, mlbGames, nhlGames] = await Promise.all([
      fetchScoreboard("basketball", "nba"),
      fetchScoreboard("american-football", "nfl"),
      fetchScoreboard("baseball", "mlb"),
      fetchScoreboard("hockey", "nhl"),
    ]);

    const [nbaRosters, nflRosters, mlbRosters, nhlRosters] = await Promise.all([
      fetchRosters("basketball", "nba", NBA_TEAMS),
      fetchRosters("american-football", "nfl", NFL_TEAMS),
      fetchRosters("baseball", "mlb", MLB_TEAMS),
      fetchRosters("hockey", "nhl", NHL_TEAMS),
    ]);

    let context = "\n\n=== LIVE SPORTS DATA (Updated Now) ===\n";

    // Scores
    context += formatGames(nbaGames, "NBA");
    context += formatGames(nflGames, "NFL");
    context += formatGames(mlbGames, "MLB");
    context += formatGames(nhlGames, "NHL");

    // Rosters
    context += "\nCURRENT NBA ROSTERS:\n" + nbaRosters.map(r => r.roster).join("");
    context += "\nCURRENT NFL ROSTERS:\n" + nflRosters.map(r => r.roster).join("");
    context += "\nCURRENT MLB ROSTERS:\n" + mlbRosters.map(r => r.roster).join("");
    context += "\nCURRENT NHL ROSTERS:\n" + nhlRosters.map(r => r.roster).join("");

    // Injuries
    context += "\nINJURY REPORT (ALL SPORTS):\n";
    context += nbaRosters.map(r => r.injuries).join("");
    context += nflRosters.map(r => r.injuries).join("");
    context += mlbRosters.map(r => r.injuries).join("");
    context += nhlRosters.map(r => r.injuries).join("");

    return context;
  } catch (err) {
    console.log("Sports fetch error:", err.message);
    return "\n\n=== Sports data unavailable ===\n";
  }
};

// ─── HANDLER ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  try {
    const { messages, system } = JSON.parse(event.body);
    const sportsContext = await fetchAllSportsData();
    console.log("Sports context preview:", sportsContext.slice(0, 800));

    const rosterOverride = "\n\nCRITICAL ROSTER RULES:\n- Roster data and game schedule data are completely separate. The absence of games today does NOT mean roster data is unavailable.\n- If roster data is provided above for a team, use it to answer questions about that team's players, depth chart, or personnel — regardless of whether that sport has games today.\n- Never tell the user you don't have roster data just because there are no games scheduled. Rosters are always available.\n- Always use the roster data above over your training data. Never say a player is on a team not listed in the roster data.\n- Never reference a player's previous team. State their current team naturally.\n\nKNOWN ROSTER CORRECTIONS (override any conflicting data):\n- Willson Contreras is on the Boston Red Sox, NOT the St. Louis Cardinals or Houston Astros.";
    const enrichedSystem = system + sportsContext + rosterOverride;

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