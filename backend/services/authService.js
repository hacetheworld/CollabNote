import User from "../models/User.js";
import Token from "../models/Token.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );
};

const createRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  await Token.findOneAndDelete({ userId });

  await Token.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};

export const authService = {
  signup: async ({ name, email, password }) => {
    const exists = await User.findOne({ email });
    if (exists) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  },
  async getUserProfile(userId) {
    // Use .select() to only retrieve necessary, non-sensitive fields
    const user = await User.findById(userId).select(
      "-password -refreshToken -__v"
    );

    if (!user) {
      return null;
    }

    // Convert Mongoose document to a plain object
    return user.toObject();
  },
  refresh: async (token) => {
    if (!token) throw new Error("No refresh token");

    const stored = await Token.findOne({ token });
    if (!stored) throw new Error("Invalid refresh token");

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return { accessToken };
  },

  googleLogin: async ({ googleId, email, name, picture }) => {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: picture,
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  },

  logout: async (userId) => {
    await Token.findOneAndDelete({ userId });
  },
};
