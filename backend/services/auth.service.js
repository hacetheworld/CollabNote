import User from "../models/User.model.js";
import Token from "../models/Token.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../utils/winstonLogger.js";
import { AuthenticationError, InvalidInputError } from "../utils/appError.js";

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const createRefreshToken = async (userId, cid) => {
  const token = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  logger.debug({
    message: "Replacing existing refresh token.",
    userId: userId,
    cid,
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
  signup: async ({ name, email, password }, cid) => {
    logger.info({ message: "Attempting user signup.", email, cid });

    const exists = await User.findOne({ email });
    if (exists) throw new InvalidInputError("Email already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id, cid);
    logger.info({
      message: "User successfully created and tokens generated.",
      userId: user._id,
      cid,
    });

    return { user, accessToken, refreshToken };
  },

  login: async ({ email, password }, cid) => {
    logger.info({ message: "Attempting user login.", email, cid });

    const user = await User.findOne({ email });

    if (!user) throw new InvalidInputError("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new InvalidInputError("Invalid credentials");

    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user._id, cid);
    logger.info({
      message: "User successfully logged in and tokens generated.",
      userId: user._id,
      cid,
    });

    return { user, accessToken, refreshToken };
  },
  async getUserProfile(userId, cid) {
    logger.info({ message: "Fetching user profile.", userId, cid });

    // Use .select() to only retrieve necessary, non-sensitive fields
    const user = await User.findById(userId).select(
      "-password -refreshToken -__v"
    );

    if (!user) {
      logger.warn({
        message: "User profile not found in DB but token was valid.",
        userId,
        cid,
      });

      return null;
    }

    // Convert Mongoose document to a plain object
    return user.toObject();
  },
  refresh: async (token, cid) => {
    logger.info({ message: "Attempting token refresh.", cid });

    if (!token) throw new AuthenticationError("No refresh token");

    const stored = await Token.findOne({ token });
    if (!stored) {
      logger.warn({ message: "Refresh failed: Token not found in DB.", cid });

      throw new AuthenticationError("Invalid refresh token");
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    logger.info({
      message: "Access token successfully refreshed.",
      userId: decoded.id,
      cid,
    });

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

  logout: async (userId, cid) => {
    logger.info({ message: "Attempting user logout.", userId, cid });

    await Token.findOneAndDelete({ userId });
    logger.info({
      message: "Refresh token successfully deleted.",
      userId,
      cid,
    });

    return true;
  },
};
