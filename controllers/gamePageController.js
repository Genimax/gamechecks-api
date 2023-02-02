const { authorizationData } = require("../functions/setHeaders");

const gamePage = async (req, res) => {
  try {
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

module.exports = { gamePage };
