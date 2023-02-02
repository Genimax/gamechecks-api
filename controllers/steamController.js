import fetch from "node-fetch";

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

module.exports = { getSteamReview };
