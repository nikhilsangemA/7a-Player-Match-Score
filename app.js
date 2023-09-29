// player_details // match_details // player_match_score

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializationDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server is running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error: '${e.message}'`);
    process.exit(1);
  }
};
initializationDBandServer();

//

const converIntoPlayer = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
  };
};

const converIntoMatch = (eachMatch) => {
  return {
    matchId: eachMatch.match_id,
    match: eachMatch.match,
    year: eachMatch.year,
  };
};

const converObjPlayMatch = (eachPlayMatch) => {
  return {
    playerMatchId: eachPlayMatch.player_match_id,
    playerId: eachPlayMatch.player_id,
    matchId: eachPlayMatch.match_id,
    score: eachPlayMatch.score,
    fours: eachPlayMatch.fours,
    sixes: eachPlayMatch.sixes,
  };
};
// API 1
app.get("/players/", async (request, response) => {
  const selectPlayers = `SELECT * FROM player_details`;
  const dbresponse = await db.all(selectPlayers);
  response.send(dbresponse.map((eachPlayer) => converIntoPlayer(eachPlayer)));
});

// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const selectPlayer = `SELECT * FROM player_details WHERE player_id = ${playerId}`;
  const dbresponse = await db.get(selectPlayer);
  response.send(converIntoPlayer(dbresponse));
});

// API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id =${playerId}`;
  const dbresponse = await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const selectMatchTab = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  const dbresponse = await db.get(selectMatchTab);
  response.send(converIntoMatch(dbresponse));
});

// API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const selectMatchPlayer = `SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id = ${playerId}`;
  const dbresponse = await db.all(selectMatchPlayer);
  response.send(
    dbresponse.map((eachPlayMatch) => converIntoMatch(eachPlayMatch))
  );
});

// API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const selectMatchPlayer = `
 SELECT 
        player_details.player_id as playerId,
        player_details.player_name as playerName
  FROM 
        player_match_score NATURAL JOIN player_details
  WHERE match_id = ${matchId}`;
  const dbresponse2 = await db.all(selectMatchPlayer);
  response.send(dbresponse2);
});
// API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const dbresponse = await db.get(getPlayerScored);
  console.log(dbresponse);
  response.send(dbresponse);
});

//
module.exports = app;
