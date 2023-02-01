const PORT = process.env.PORT || 8000;
const express = require("express");
const cors = require("cors");
const e = require("express");
const { json } = require("express");
require("dotenv").config();

const app = express();

app.use(cors());

app.listen(PORT, () => console.log("Server is running on port", PORT));

const logger = (request) => {
  console.log("\n-- LOGGER -- ");
  console.log("Content-Type:", request.header("Content-Type"));
  console.log("User Agent:", request.header("user-agent"));
  console.log("Original URL:", request.originalUrl);
  console.log("Date:", new Date().toLocaleString());
  console.log("\n");
};

const authorizationData = () => {
  return {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TOKEN}`,
  };
};

const tokenUpdater = async () => {
  try {
    // CHECK IF TOKEN IS EXPIRED
    if (Date.now() >= process.env.TOKEN_LIFETIME_TILL) {
      const getTokenURL = process.env.ACCESSTOKENLINK.replace(
        "[TWITCH_CLIENT_ID]",
        process.env.TWITCH_CLIENT_ID
      ).replace("[TWITCH_SECRET]", process.env.TWITCH_SECRET);

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
  } catch (e) {
    console.log(e);
  }
};

const gameSearch = async (req, res) => {
  await tokenUpdater();

  try {
    const gameName = req.query.id;
    const DBURL = "https://api.igdb.com/v4/games";
    await fetch(DBURL, {
      method: "post",
      headers: authorizationData(),
      body: `where name ~ *"${gameName}"* & rating!= null & cover != null & parent_game = null & version_parent = null & category = 0; sort rating desc; fields name; limit 10;`,
    })
      .then((response) => response.json())
      .then((response) => {
        res.send(response);
      });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ message: "Error during search request...", error: e });
  }
};

const gamePage = async (req, res) => {
  logger(req);

  try {
    await tokenUpdater();

    const gameID = req.query.id;

    const DBURL = "https://api.igdb.com/v4/games";

    await fetch(DBURL, {
      method: "post",
      headers: authorizationData(),
      body: `fields name,total_rating,cover.url,first_release_date,involved_companies.company.name,screenshots.image_id, screenshots.url, summary,websites.category, websites.url, websites.trusted; where id = ${gameID};`,
    })
      .then((response) => response.json())
      .then((response) => {
        res.send(response);
      });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ message: "Error during Page loading request...", error: e });
  }
};

const getTwitchStreams = async (req, res) => {
  await tokenUpdater();

  const mainURL = "https://api.twitch.tv/helix";

  const gameID = req.query.id;

  try {
    const categoryID = await fetch(mainURL + `/games?igdb_id=${gameID}`, {
      method: "GET",
      headers: authorizationData(),
    }).then((response) => {
      return response.json();
    });

    if (categoryID.data.length < 1) {
      res.status(200).send([]);
      return;
    }

    await fetch(
      mainURL +
        `/streams?game_id=${categoryID.data[0].id}&language=en&type=live&first=5`,
      {
        method: "GET",
        headers: authorizationData(),
      }
    ).then((response) => {
      response.json().then((response) => {
        res.send(response.data);
      });
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ message: "Error during Twitch search request...", error: e });
  }
};

const getSteamReview = async (req, res) => {
  try {
    const steamID = req.query.steamID;

    const fetchOptions = (reviewType) => {
      const steamURL = `https://store.steampowered.com/appreviews/${steamID}?json=1&num_per_page=1&language=english&review_type=${reviewType}`;

      return steamURL;
    };

    const positiveReview = await fetch(fetchOptions("positive")).then(
      (responce) => responce.json()
    );

    const negativeReview = await fetch(fetchOptions("negative")).then(
      (responce) => responce.json()
    );

    res.status(200).send([positiveReview, negativeReview]);
  } catch (e) {
    console.log(e);
  }
};

app
  .get("/gamerequest", gameSearch)
  .get("/gamepagerequest", gamePage)
  .get("/twitchstreams", getTwitchStreams)
  .get("/steamreviews", getSteamReview);
