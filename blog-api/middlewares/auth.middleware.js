import jwt from "jsonwebtoken";

// Checks that the request carries a valid ******
// Attaches the decoded payload to req.user for downstream use.
export const verify_token = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "authorization token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};

// Must run after verify_token. Blocks non-admins.
export const is_admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "admin access required" });
  }
  next();
};
