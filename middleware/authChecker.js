import fetch from "node-fetch";

const authorizationData = async (req, res, next) => {
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

    next();
  } catch (e) {
    console.log(e);
  }
};

module.exports = { authorizationData };
