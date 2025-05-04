import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import nodemailer from "nodemailer";

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
async function sendVerificationEmail(email: string, username: string, token: string) {
  try {
    // Setup the same email transporter we use for contact forms
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    const baseUrl = process.env.BASE_URL || 'https://lingomitra.com';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"LingoMitra" <support@lingomitra.com>`,
      to: email,
      subject: "Verify Your LingoMitra Account",
      text: `
Hello ${username},

Thank you for creating an account with LingoMitra! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The LingoMitra Team
      `,
      html: `
<h2>Welcome to LingoMitra!</h2>
<p>Hello ${username},</p>
<p>Thank you for creating an account with LingoMitra! Please verify your email address by clicking the button below:</p>
<p style="text-align: center;">
  <a href="${verificationUrl}" style="
    display: inline-block;
    padding: 10px 20px;
    background-color: #ff6600;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
  ">Verify Your Email</a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p>${verificationUrl}</p>
<p>This link will expire in 24 hours.</p>
<p>If you did not create an account, please ignore this email.</p>
<p>Best regards,<br>The LingoMitra Team</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
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
      await sendVerificationEmail(email, username, newVerificationToken);

      // Don't log the user in automatically after registration
      // Just tell them to check their email
      // Extract sensitive fields to exclude them from the response
      const { password: _, verificationToken: __, verificationTokenExpiry: ___, ...userResponse } = user;
      
      res.status(201).json({
        ...userResponse,
        needsVerification: true,
        message: "Please check your email to verify your account before logging in."
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
        return res.status(400).json({ success: false, message: "Verification token is required" });
      }
      
      // Find user with this token
      const user = await storage.getUserByVerificationToken(token as string);
      
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid verification token" });
      }
      
      // Check if token is expired
      const now = new Date();
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < now) {
        return res.status(400).json({ success: false, message: "Verification token has expired" });
      }
      
      // Mark user as verified and clear token
      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // If this is an API call, return JSON
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(200).json({ 
          success: true, 
          message: "Email verified successfully"
        });
      }
      
      // Otherwise redirect to the verify-email page with token
      // The frontend will check session and redirect appropriately
      return res.redirect('/verify-email?verified=true');
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
      await sendVerificationEmail(user.email, user.username, newVerificationToken);
      
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
}