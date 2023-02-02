const PORT = process.env.PORT || 8000;
const express = require("express");
const cors = require("cors");
const e = require("express");
require("dotenv").config();

const { authorizationData } = require("./middleware/authChecker");
const { logger } = require("./middleware/logger");
const { gameSearch } = require("./controllers/gameSearchController");
const { gamePage } = require("./controllers/gamePageController");
const { getTwitchStreams } = require("./controllers/twitchController");
const { getSteamReview } = require("./controllers/steamController");

const app = express();

app.use(cors());

app.listen(PORT, () => console.log("Server is running on port", PORT));

app
  .get("/gamerequest", authorizationData, gameSearch)
  .get("/gamepagerequest", logger, authorizationData, gamePage)
  .get("/twitchstreams", getTwitchStreams)
  .get("/steamreviews", getSteamReview);
