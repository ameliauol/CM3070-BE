const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  console.log("Request headers:", req.headers);

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided, you must be logged in to make this request",
    });
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: "Malformed token" });
  }

  const token = tokenParts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};
