const { authorizationData } = require("../functions/setHeaders");
import fetch from "node-fetch";

const gameSearch = async (req, res) => {
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

module.exports = { gameSearch };
