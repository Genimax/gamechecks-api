const { authorizationData } = require("../functions/setHeaders");

const getTwitchStreams = async (req, res) => {
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

module.exports = { getTwitchStreams };
