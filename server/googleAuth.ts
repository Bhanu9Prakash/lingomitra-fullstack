import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { Express } from "express";

export function setupGoogleAuth(app: Express) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        // User exists, return them
        return done(null, user);
      }
      
      // Check if user exists with the same email
      const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingUser) {
        // Link Google account to existing user
        const updatedUser = await storage.updateUser(existingUser.id, {
          googleId: profile.id,
          profilePicture: profile.photos?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          emailVerified: true // Google emails are pre-verified
        });
        return done(null, updatedUser);
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username: profile.emails?.[0]?.value.split('@')[0] || `user_${profile.id}`,
        email: profile.emails?.[0]?.value || '',
        googleId: profile.id,
        profilePicture: profile.photos?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        emailVerified: true, // Google emails are pre-verified
        subscriptionTier: "free"
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error, undefined);
    }
  }));

  // Google Auth Routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google_auth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard or intended page
      res.redirect("/dashboard");
    }
  );
}