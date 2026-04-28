import { Request, Response } from "express";
import User from "../models/User";
import AuditLog from "../models/AuditLog";

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
      return;
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if user is active
    if (user.status !== "Active") {
      res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact administrator.",
      });
      return;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    user.ipAddress = req.ip;
    await user.save();

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "login",
      category: "security",
      severity: "info",
      module: "Authentication",
      description: `User logged in successfully`,
      details: `Login from ${req.headers["user-agent"] || "Unknown browser"}`,
      ipAddress: req.ip,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        // In production, you would generate and return a JWT token here
        // token: generateToken(user._id)
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userName, userRole } = req.body;

    if (userId) {
      // Create audit log
      await AuditLog.create({
        userId,
        userName: userName || "Unknown",
        userRole: userRole || "Staff",
        action: "logout",
        category: "security",
        severity: "info",
        module: "Authentication",
        description: "User logged out",
        details: "Session ended",
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
      return;
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "update",
      category: "security",
      severity: "warning",
      module: "Authentication",
      description: "Password changed successfully",
      details: "User changed their own password",
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
