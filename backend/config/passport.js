import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { authService } from "../services/authService.js";

const passportConfig = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const data = await authService.googleLogin({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
          });

          return done(null, data);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

export default passportConfig;
