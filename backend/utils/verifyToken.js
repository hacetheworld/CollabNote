import jwt from "jsonwebtoken";

export default function verifyToken(token) {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded; // contains userId, email, etc.
  } catch (err) {
    console.error("Invalid socket token:", err.message);
    return null;
  }
}
