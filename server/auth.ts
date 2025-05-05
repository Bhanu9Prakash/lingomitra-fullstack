import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendEmail, generateVerificationEmail, generatePasswordResetEmail } from "./email-service";

// Extend express-session with custom properties
declare module 'express-session' {
  interface SessionData {
    verifiedUsername?: string;
    isNewRegistration?: boolean;
  }
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a verification token for email verification
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Send verification email to user
 */
async function sendVerificationEmailToUser(email: string, username: string, token: string) {
  try {
    const emailOptions = generateVerificationEmail(email, token, process.env.BASE_URL);
    
    const result = await sendEmail(emailOptions);
    if (result) {
      console.log(`Verification email sent to ${email}`);
    } else {
      console.warn(`Failed to send verification email to ${email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email to user
 */
async function sendPasswordResetEmailToUser(email: string, token: string) {
  try {
    // Use the email service which has the correct URL fallback
    const emailOptions = generatePasswordResetEmail(email, token, process.env.BASE_URL);
    
    const result = await sendEmail(emailOptions);
    if (result) {
      console.log(`Password reset email sent to ${email}`);
    } else {
      console.warn(`Failed to send password reset email to ${email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Middleware to check if the user is authenticated
 */
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

/**
 * Middleware to check if the user is an admin
 */
export function isAdmin(req: any, res: any, next: any) {
  console.log('isAdmin middleware checking authentication');
  
  if (!req.isAuthenticated()) {
    console.log('User is not authenticated');
    return res.status(401).json({ message: "Unauthorized - Login required" });
  }
  
  console.log('User authenticated:', req.user.username);
  console.log('User admin status:', req.user.isAdmin);
  
  if (req.user.isAdmin) {
    console.log('Admin access granted to:', req.user.username);
    return next();
  }
  
  console.log('Admin access denied for user:', req.user.username);
  res.status(403).json({ message: "Forbidden - Admin access required" });
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "lingomitra-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (usernameOrEmail, password, done) => {
      try {
        // Try to find user by username first
        let user = await storage.getUserByUsername(usernameOrEmail);
        
        // If not found by username, try by email
        if (!user) {
          user = await storage.getUserByEmail(usernameOrEmail);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password: rawPassword } = req.body;
      
      if (!username || !email || !rawPassword) {
        return res.status(400).send("Username, email, and password are required");
      }
      
      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).send("Username already exists");
      }
      
      // Check if email is already taken
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).send("Email is already registered");
      }

      // Generate verification token
      const newVerificationToken = generateVerificationToken();
      const now = new Date();
      const tokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Create user with verification token
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(rawPassword),
        emailVerified: false,
        verificationToken: newVerificationToken,
        verificationTokenExpiry: tokenExpiry
      });

      // Send verification email
      await sendVerificationEmailToUser(email, username, newVerificationToken);

      // Log the user in automatically after registration
      // This preserves their session for when they verify their email
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Extract sensitive fields to exclude them from the response
        const { password: _, verificationToken: __, verificationTokenExpiry: ___, ...userResponse } = user;
        
        // Flag that this user is a new registration, so the verification page knows to show
        // instructions rather than success message
        req.session.isNewRegistration = true;
        
        res.status(201).json({
          ...userResponse,
          needsVerification: true,
          message: "Please check your email to verify your account."
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: "Verification token is required" 
        });
      }
      
      // Find user with this token
      const user = await storage.getUserByVerificationToken(token as string);
      
      if (!user) {
        // Important: token not found, but this might be because it was already used
        // Let's check for tokens that might have been used by looking up the token in the request
        // This helps with page reloads during verification where the first request succeeded
        // but the client is making a second request with the same token
        
        // First try getting username from email verification params if stored in session
        const verifiedUsername = req.session?.verifiedUsername;
        let alreadyVerifiedUser = null;
        
        if (verifiedUsername) {
          // Try looking up by username
          try {
            alreadyVerifiedUser = await storage.getUserByUsername(verifiedUsername);
          } catch (e) {
            // Username not found, continue to next check
          }
        }
        
        // If we find a user that's already verified, we can consider this a success case
        if (alreadyVerifiedUser && alreadyVerifiedUser.emailVerified) {
          console.log('Token already used, but user is verified. Treating as success.');
          
          // If this is an API call, return JSON
          if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json({ 
              success: true, 
              message: "Email already verified",
              username: alreadyVerifiedUser.username
            });
          }
          
          // Check if this is a new registration and include in the redirect
          const isNewRegistration = req.session.isNewRegistration === true;
          
          // Clear the new registration flag as we're using it now
          if (isNewRegistration) {
            req.session.isNewRegistration = false;
          }
          
          // Otherwise redirect to the verify-email page with verified flag and registration info
          return res.redirect(`/verify-email?verified=true${isNewRegistration ? '&registration=true' : ''}`);
        }
        
        // If we reach here, the token is truly invalid
        return res.status(400).json({ 
          success: false, 
          message: "Invalid verification token or email already verified. Try logging in." 
        });
      }
      
      // Check if user is already verified
      if (user.emailVerified) {
        console.log('User already verified, returning success.');
        
        // Store username in session to help with subsequent token checks
        req.session.verifiedUsername = user.username;
        
        // If this is an API call, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.status(200).json({ 
            success: true, 
            message: "Email already verified",
            username: user.username
          });
        }
        
        // Check if this is a new registration and include in the redirect
        const isNewRegistration = req.session.isNewRegistration === true;
        
        // Clear the new registration flag as we're using it now
        if (isNewRegistration) {
          req.session.isNewRegistration = false;
        }
        
        // Otherwise redirect to the verify-email page with verified flag and registration info
        return res.redirect(`/verify-email?verified=true${isNewRegistration ? '&registration=true' : ''}`);
      }
      
      // Check if token is expired
      const now = new Date();
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < now) {
        return res.status(400).json({ 
          success: false, 
          message: "Verification token has expired" 
        });
      }
      
      // Mark user as verified and clear token
      const updatedUser = await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // Store username in session to help with subsequent token checks
      req.session.verifiedUsername = user.username;
      
      // Update the user's session if they're already logged in
      if (req.isAuthenticated() && req.user && (req.user as SelectUser).id === user.id) {
        // Update the session with the verified user
        req.login(updatedUser, (err) => {
          if (err) {
            console.error('Error updating session:', err);
          }
        });
      }
      
      // If this is an API call, return JSON
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(200).json({ 
          success: true, 
          message: "Email verified successfully",
          username: user.username
        });
      }
      
      // Check if this is a new registration and include in the redirect
      const isNewRegistration = req.session.isNewRegistration === true;
      
      // Clear the new registration flag as we're using it now
      if (isNewRegistration) {
        req.session.isNewRegistration = false;
      }
      
      // Otherwise redirect to the verify-email page with verified flag and registration info
      return res.redirect(`/verify-email?verified=true${isNewRegistration ? '&registration=true' : ''}`);
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred during email verification" 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
      
      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          success: false, 
          verified: false,
          message: "Please verify your email address before logging in"
        });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({
          success: true,
          ...userWithoutPassword
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send the password back to the client
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Account deletion endpoint
  app.delete("/api/user/delete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          success: false, 
          message: "You must be logged in to delete your account" 
        });
      }
      
      const { confirmation } = req.body;
      const user = req.user as SelectUser;
      
      // Verify that the confirmation matches the username
      if (confirmation !== user.username) {
        return res.status(400).json({ 
          success: false, 
          message: "Confirmation text doesn't match your username" 
        });
      }
      
      // Log the user out first
      req.logout(async (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "Error logging out before account deletion" 
          });
        }
        
        try {
          // Delete the user account
          await storage.deleteUser(user.id);
          
          return res.status(200).json({ 
            success: true, 
            message: "Your account has been successfully deleted" 
          });
        } catch (error) {
          console.error('Error deleting user account:', error);
          return res.status(500).json({ 
            success: false, 
            message: "An error occurred while deleting your account" 
          });
        }
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred during account deletion" 
      });
    }
  });
  
  // Endpoint to resend verification email
  app.post("/api/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.status(200).json({ 
          success: true, 
          message: "If your email is registered, a new verification link has been sent." 
        });
      }
      
      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: "Your email is already verified." 
        });
      }
      
      // Generate new verification token
      const newVerificationToken = generateVerificationToken();
      const now = new Date();
      const tokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Update user with new verification token
      await storage.updateUser(user.id, {
        verificationToken: newVerificationToken,
        verificationTokenExpiry: tokenExpiry
      });
      
      // Resend verification email
      await sendVerificationEmailToUser(user.email, user.username, newVerificationToken);
      
      return res.status(200).json({ 
        success: true, 
        message: "A new verification email has been sent. Please check your inbox." 
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while resending verification email."
      });
    }
  });
  
  // Forgot password endpoint - generates a token and sends a reset email
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.status(200).json({ 
          success: true, 
          message: "If your email is registered, a password reset link has been sent." 
        });
      }
      
      // Generate new reset token
      const resetToken = generateVerificationToken(); // We can reuse this function
      const now = new Date();
      const tokenExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      
      // Update user with reset token
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: tokenExpiry
      });
      
      // Send password reset email
      await sendPasswordResetEmailToUser(user.email, resetToken);
      
      return res.status(200).json({ 
        success: true, 
        message: "A password reset link has been sent to your email. Please check your inbox." 
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while sending password reset email." 
      });
    }
  });
  
  // Validate reset token endpoint
  app.get("/api/reset-password/validate", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ 
          valid: false, 
          message: "Token is required" 
        });
      }
      
      // Find user with this reset token
      const user = await storage.getUserByResetPasswordToken(token as string);
      
      if (!user) {
        return res.status(200).json({ 
          valid: false, 
          message: "Invalid token" 
        });
      }
      
      // Check if token is expired
      const now = new Date();
      if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < now) {
        return res.status(200).json({ 
          valid: false, 
          message: "Token has expired" 
        });
      }
      
      // Token is valid
      return res.status(200).json({ 
        valid: true, 
        message: "Token is valid" 
      });
    } catch (error) {
      console.error('Error validating token:', error);
      return res.status(500).json({ 
        valid: false, 
        message: "An error occurred while validating the token" 
      });
    }
  });

  // Reset password endpoint - validate token and update password
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Token and new password are required" 
        });
      }
      
      // Find user with this reset token
      const user = await storage.getUserByResetPasswordToken(token);
      
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired password reset token" 
        });
      }
      
      // Check if token is expired
      const now = new Date();
      if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < now) {
        return res.status(400).json({ 
          success: false, 
          message: "Password reset token has expired" 
        });
      }
      
      // Update user with new hashed password and clear token
      const updatedUser = await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null
      });
      
      // If successful, return success response
      return res.status(200).json({ 
        success: true, 
        message: "Your password has been reset successfully. You can now log in with your new password." 
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while resetting your password." 
      });
    }
  });
  
  // Change password endpoint (for authenticated users)
  app.post("/api/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user as SelectUser;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Current password and new password are required" 
        });
      }
      
      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ 
          success: false, 
          message: "Current password is incorrect" 
        });
      }
      
      // Update user with new hashed password
      await storage.updateUser(user.id, {
        password: await hashPassword(newPassword)
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Your password has been changed successfully." 
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while changing your password." 
      });
    }
  });
}