// authenticateToken.js

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(401).json({ error: "Access denied. Token is required." });

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
};

module.exports = authenticateToken;
