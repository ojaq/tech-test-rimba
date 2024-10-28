import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      requestId: uuidv4(),
      data: null,
      message: "Token is missing",
      success: false,
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        requestId: uuidv4(),
        data: null,
        message: "Token is invalid",
        success: false,
      });
    }
    req.userId = user.id;
    next();
  });
};
