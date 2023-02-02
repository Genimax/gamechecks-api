const logger = (request, res, next) => {
  console.log("\n-- LOGGER -- ");
  console.log("Content-Type:", request.header("Content-Type"));
  console.log("User Agent:", request.header("user-agent"));
  console.log("Original URL:", request.originalUrl);
  console.log("Date:", new Date().toLocaleString());
  console.log("\n");

  next();
};

module.exports = { logger };
