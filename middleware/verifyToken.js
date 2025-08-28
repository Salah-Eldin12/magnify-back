import jwt from "jsonwebtoken";
import { UserSc } from "../src/models/UsersSc.js";

function VerifyToken(req, res, next) {
  const token = req.headers.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_LOGIN_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  } else {
    res.status(401).json({ message: "no provided token" });
  }
}

function VerifyTokenAdmin(req, res, next) {
  VerifyToken(req, res, async () => {
    const user = await UserSc.findById(req.user.id);
    if (user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "you are not allowed" });
    }
  });
}

export { VerifyTokenAdmin };
