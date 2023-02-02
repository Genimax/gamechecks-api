const authorizationData = () => {
  return {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TOKEN}`,
  };
};

module.exports = { authorizationData };
