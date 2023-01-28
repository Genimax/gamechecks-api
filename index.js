const PORT = process.env.PORT || 8000;
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());

app.listen(PORT, () => console.log("Server is running on port", PORT));

const tokenUpdater = async () => {
  // CHECK IF TOKEN IS EXPIRED
  if (Date.now() >= process.env.TOKEN_LIFETIME_TILL) {
    const getTokenURL = process.env.ACCESSTOKENLINK.replace(
      "[CLIENTID]",
      process.env.CLIENTID
    ).replace("[CLIENTSECRET]", process.env.CLIENTSECRET);

    // UPDATING TOKEN
    await fetch(getTokenURL, {
      method: "post",
    })
      .then((response) => response.json())
      .then((response) => {
        process.env.TOKEN = response.access_token;
        process.env.TOKEN_LIFETIME_TILL =
          Date.now() + response.expires_in * 1000;
      });
  }
};

const gameSearch = async (req, res) => {
  await tokenUpdater();

  const gameName = req.query.id;
  const DBURL = "https://api.igdb.com/v4/games";
  await fetch(DBURL, {
    method: "post",
    headers: {
      "Client-ID": process.env.CLIENTID,
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
    body: `where name ~ *"${gameName}"* & cover != null & parent_game = null & version_parent = null & category = 0; fields name; limit 10;`,
  })
    .then((response) => response.json())
    .then((response) => {
      res.send(response);
    });
};

const gamePage = async (req, res) => {
  await tokenUpdater();

  const gameID = req.query.id;

  const DBURL = "https://api.igdb.com/v4/games";

  await fetch(DBURL, {
    method: "post",
    headers: {
      "Client-ID": process.env.CLIENTID,
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
    body: `fields name,total_rating,cover.url,first_release_date,involved_companies.company.name,screenshots,summary,websites.category, websites.url, websites.trusted; where id = ${gameID};`,
  })
    .then((response) => response.json())
    .then((response) => {
      res.send(response);
    });
};

app.get("/gamerequest", gameSearch).get("/gamepagerequest", gamePage);
