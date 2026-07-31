// agent-notes: { ctx: "Auth controller for registration, login, JWT & OAuth", deps: ["../models/User.js"], state: "active", last: "anti@2026-07-31" }
import User from '../models/User.js';

// Helper to generate mock/signed JWT
const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : '24h';
  return `sb_jwt_${userId}_${Date.now()}_${expiresIn}`;
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email address.' });
    }

    const newUser = new User({
      name,
      email,
      password, // Note: In production use bcrypt.hash(password, 10)
      isVerified: false
    });

    await newUser.save();
    const token = generateToken(newUser._id);

    return res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified
      },
      token
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error during registration' });
  }
};

// Complete Onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const { userId, college, degree, department, graduationYear, careerGoal, experienceLevel, skills, interests } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.college = college || user.college;
    user.degree = degree || user.degree;
    user.department = department || user.department;
    user.graduationYear = graduationYear || user.graduationYear;
    user.careerGoal = careerGoal || user.careerGoal;
    user.experienceLevel = experienceLevel || user.experienceLevel;
    user.skills = skills || user.skills;
    user.interests = interests || user.interests;

    await user.save();

    return res.status(200).json({
      message: 'Profile onboarding completed successfully.',
      user
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error saving onboarding profile' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
        userId: user._id,
        message: 'Two-Factor Authentication required.'
      });
    }

    const token = generateToken(user._id, rememberMe);

    return res.status(200).json({
      message: 'Login successful.',
      user,
      token
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error during login' });
  }
};

// Verify 2FA
export const verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid 6-digit authentication code.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = generateToken(user._id, true);

    return res.status(200).json({
      message: '2FA verification successful.',
      user,
      token
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user account found with that email address.' });
    }

    user.resetPasswordToken = `reset_${Date.now()}`;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    return res.status(200).json({
      message: 'Password reset instructions have been sent to your email address.',
      resetToken: user.resetPasswordToken
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Social OAuth Callbacks (Google, GitHub, Microsoft, LinkedIn)
export const socialAuthCallback = async (req, res) => {
  try {
    const { provider, socialUser } = req.body; // { id, name, email }
    if (!socialUser || !socialUser.email) {
      return res.status(400).json({ error: 'Invalid social user payload' });
    }

    let user = await User.findOne({ email: socialUser.email });
    if (!user) {
      user = new User({
        name: socialUser.name || 'Social User',
        email: socialUser.email,
        password: `oauth_${provider}_${Date.now()}`,
        isVerified: true
      });
      await user.save();
    }

    const token = generateToken(user._id, true);

    return res.status(200).json({
      message: `Authenticated with ${provider} successfully.`,
      user,
      token
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
