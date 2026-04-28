import { Request, Response } from "express";
import User from "../models/User";
import AuditLog from "../models/AuditLog";

// @desc    Get all user permissions
// @route   GET /api/permissions
// @access  Admin
export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: { $ne: "Admin" } })
      .select("name email role permissions")
      .sort({ createdAt: -1 });

    const permissionsData = users.map((user) => ({
      id: user._id,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      permissions: user.permissions,
    }));

    res.json({
      success: true,
      count: permissionsData.length,
      data: permissionsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get user permissions by ID
// @route   GET /api/permissions/:userId
// @access  Admin
export const getUserPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select("name email role permissions");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update user permissions
// @route   PUT /api/permissions/:userId
// @access  Admin
export const updateUserPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { permissions, currentUserId, currentUserName, currentUserRole } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Admin permissions cannot be changed
    if (user.role === "Admin") {
      res.status(403).json({
        success: false,
        message: "Cannot modify Admin permissions",
      });
      return;
    }

    // Track changes
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    const permissionKeys = Object.keys(permissions) as Array<keyof typeof permissions>;

    permissionKeys.forEach((key) => {
      if (user.permissions[key] !== permissions[key]) {
        changes.push({
          field: key.charAt(0).toUpperCase() + key.slice(1),
          oldValue: user.permissions[key] ? "Enabled" : "Disabled",
          newValue: permissions[key] ? "Enabled" : "Disabled",
        });
      }
    });

    // Update permissions
    user.permissions = { ...user.permissions, ...permissions };
    await user.save();

    // Create audit log
    if (changes.length > 0) {
      await AuditLog.create({
        userId: currentUserId || user._id,
        userName: currentUserName || "System",
        userRole: currentUserRole || "Admin",
        action: "permission_change",
        category: "security",
        severity: "warning",
        module: "Permissions",
        description: `Updated permissions for ${user.name}`,
        details: `Modified ${changes.length} permission(s)`,
        ipAddress: req.ip,
        changes,
      });
    }

    res.json({
      success: true,
      message: "Permissions updated successfully",
      data: {
        userId: user._id,
        userName: user.name,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Bulk update permissions
// @route   PUT /api/permissions/bulk
// @access  Admin
export const bulkUpdatePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates, currentUserId, currentUserName, currentUserRole } = req.body;
    
    console.log("Bulk update request:", JSON.stringify(req.body, null, 2));

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid updates format - updates must be a non-empty array",
      });
      return;
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        if (!update.userId || !update.permissions) {
          errors.push({
            userId: update.userId || "unknown",
            error: "Missing userId or permissions",
          });
          continue;
        }

        const user = await User.findById(update.userId);
        
        if (!user) {
          errors.push({
            userId: update.userId,
            error: "User not found",
          });
          continue;
        }

        if (user.role === "Admin") {
          errors.push({
            userId: update.userId,
            error: "Cannot modify Admin permissions",
          });
          continue;
        }

        // Track changes
        const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
        const permissionKeys = Object.keys(update.permissions) as Array<keyof typeof update.permissions>;

        permissionKeys.forEach((key) => {
          if (user.permissions[key] !== update.permissions[key]) {
            changes.push({
              field: key.charAt(0).toUpperCase() + key.slice(1),
              oldValue: user.permissions[key] ? "Enabled" : "Disabled",
              newValue: update.permissions[key] ? "Enabled" : "Disabled",
            });
          }
        });

        // Update permissions
        user.permissions = { ...user.permissions, ...update.permissions };
        await user.save();

        // Create audit log
        if (changes.length > 0) {
          await AuditLog.create({
            userId: currentUserId || user._id,
            userName: currentUserName || "System",
            userRole: currentUserRole || "Admin",
            action: "permission_change",
            category: "security",
            severity: "warning",
            module: "Permissions",
            description: `Bulk updated permissions for ${user.name}`,
            details: `Modified ${changes.length} permission(s)`,
            ipAddress: req.ip,
            changes,
          });
        }

        results.push({
          userId: user._id,
          userName: user.name,
          updated: true,
          changesCount: changes.length,
        });
      } catch (error) {
        errors.push({
          userId: update.userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully updated permissions for ${results.length} user(s)`,
      data: {
        updated: results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
