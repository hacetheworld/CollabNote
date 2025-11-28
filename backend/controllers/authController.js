import { authService } from "../services/auth.service.js";

export const authController = {
  signup: async (req, res) => {
    try {
      const data = await authService.signup(req.body);

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      return res.json({
        message: "Signup successful",
        accessToken: data.accessToken,
        user: data.user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const data = await authService.login(req.body);

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "None",
      });

      return res.json({
        message: "Login successful",
        accessToken: data.accessToken,
        user: data.user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  me: async (req, res) => {
    try {
      const userId = req.userId;
      const user = await authService.getUserProfile(userId);

      if (!user) {
        // Should technically not happen if token is valid, but good practice
        return res.status(404).json({ error: "User not found" });
      }

      // Return the necessary user data
      return res.json({ user });
    } catch (err) {
      // Log the error for monitoring/debugging purposes
      console.error("Error fetching user profile:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  refresh: async (req, res) => {
    try {
      console.log(req.cookies, "req.cookiesreq.cookies");
      const { refreshToken } = req.cookies;

      const data = await authService.refresh(refreshToken);

      res.json({ accessToken: data.accessToken });
    } catch (err) {
      console.log(err, "errroo refresh");

      res.status(401).json({ error: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user.id;
      await authService.logout(userId);

      res.clearCookie("refreshToken");
      res.json({ message: "Logged out" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
