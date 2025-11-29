import { authService } from "../services/auth.service.js";
import { logger } from "../utils/winstonLogger.js";

export const authController = {
  signup: async (req, res, next) => {
    try {
      const cid = req.cid; // Get the Correlation ID

      const data = await authService.signup(req.body, cid);

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      logger.info({
        message: "Signup response sent successfully.",
        userId: data.user._id,
        cid,
      });

      return res.json({
        message: "Signup successful",
        accessToken: data.accessToken,
        user: data.user,
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const cid = req.cid; // Get the Correlation ID

      const data = await authService.login(req.body, cid);

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "None",
      });

      logger.info({
        message: "Login response sent successfully.",
        userId: data.user._id,
        cid,
      });
      return res.json({
        message: "Login successful",
        accessToken: data.accessToken,
        user: data.user,
      });
    } catch (err) {
      next(err);
    }
  },
  me: async (req, res, next) => {
    try {
      const cid = req.cid;

      const userId = req.userId;
      const user = await authService.getUserProfile(userId, cid);

      if (!user) {
        // Should technically not happen if token is valid, but good practice
        throw new NotFoundError("User profile linked to token not found.");
      }
      logger.info({
        message: "User profile fetched and response sent.",
        userId,
        cid,
      });

      // Return the necessary user data
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },
  refresh: async (req, res, next) => {
    try {
      const cid = req.cid;

      console.log(req.cookies, "req.cookiesreq.cookies");
      const { refreshToken } = req.cookies;

      const data = await authService.refresh(refreshToken, cid);
      logger.info({ message: "Token refresh response sent.", cid });

      res.json({ accessToken: data.accessToken });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const cid = req.cid;

      const userId = req.user.id;
      await authService.logout(userId, cid);

      res.clearCookie("refreshToken");
      logger.info({
        message: "Logout successful and response sent.",
        userId,
        cid,
      });

      res.json({ message: "Logged out" });
    } catch (err) {
      next(err);
    }
  },
};
