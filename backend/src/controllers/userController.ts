import { Request, Response } from "express";
import User from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/responseHandler";
import { logUserAction } from "../utils/auditLogger";

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  sendSuccess(res, users, "Users fetched successfully");
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select("-password");
  
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  sendSuccess(res, user, "User fetched successfully");
});

// @desc    Create new user
// @route   POST /api/users
// @access  Admin
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, permissions, currentUserId, currentUserName, currentUserRole } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    sendError(res, "User with this email already exists", 400);
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    permissions,
    status: "Active",
  });

  // Create audit log
  await logUserAction(
    currentUserId || user._id,
    currentUserName || "System",
    currentUserRole || "Admin",
    "create",
    "Users",
    `Created new user: ${name}`,
    req.ip,
    `Email: ${email}, Role: ${role}`
  );

  const userResponse = user.toObject();
  delete (userResponse as any).password;

  sendSuccess(res, userResponse, "User created successfully", 201);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, role, status, permissions, currentUserId, currentUserName, currentUserRole } = req.body;

  const user = await User.findById(req.params.id);
  
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  // Track changes for audit log
  const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
  
  if (name && name !== user.name) {
    changes.push({ field: "Name", oldValue: user.name, newValue: name });
    user.name = name;
  }
  
  if (email && email !== user.email) {
    changes.push({ field: "Email", oldValue: user.email, newValue: email });
    user.email = email;
  }
  
  if (role && role !== user.role) {
    changes.push({ field: "Role", oldValue: user.role, newValue: role });
    user.role = role;
  }
  
  if (status && status !== user.status) {
    changes.push({ field: "Status", oldValue: user.status, newValue: status });
    user.status = status;
  }

  if (permissions) {
    user.permissions = { ...user.permissions, ...permissions };
  }

  await user.save();

  // Create audit log
  if (changes.length > 0) {
    await logUserAction(
      currentUserId || user._id,
      currentUserName || "System",
      currentUserRole || "Admin",
      "update",
      "Users",
      `Updated user: ${user.name}`,
      req.ip,
      `Modified ${changes.length} field(s)`,
      changes
    );
  }

  const userResponse = user.toObject();
  delete (userResponse as any).password;

  sendSuccess(res, userResponse, "User updated successfully");
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentUserId, currentUserName, currentUserRole } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  const userName = user.name;
  const userRole = user.role;

  await User.findByIdAndDelete(req.params.id);

  // Create audit log
  await logUserAction(
    currentUserId || user._id,
    currentUserName || "System",
    currentUserRole || "Admin",
    "delete",
    "Users",
    `Deleted user: ${userName}`,
    req.ip,
    `Role: ${userRole}`
  );

  sendSuccess(res, null, "User deleted successfully");
});

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Admin
export const updateUserPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { password, currentUserId, currentUserName, currentUserRole } = req.body;

  if (!password || password.length < 6) {
    sendError(res, "Password must be at least 6 characters", 400);
    return;
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  user.password = password;
  await user.save();

  // Create audit log
  await logUserAction(
    currentUserId || user._id,
    currentUserName || "System",
    currentUserRole || "Admin",
    "update",
    "Users",
    `Password reset for user: ${user.name}`,
    req.ip,
    "Password was changed by administrator"
  );

  sendSuccess(res, null, "Password updated successfully");
});
