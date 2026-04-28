import { Request, Response } from "express";
import AuditLog from "../models/AuditLog";

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Admin
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      severity,
      action,
      userId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query: any = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (severity && severity !== "all") {
      query.severity = severity;
    }

    if (action) {
      query.action = action;
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name email role");

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get audit log by ID
// @route   GET /api/audit/:id
// @access  Admin
export const getAuditLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("userId", "name email role");

    if (!log) {
      res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get audit statistics
// @route   GET /api/audit/stats
// @access  Admin
export const getAuditStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, criticalCount, warningCount, categoryStats, severityStats] =
      await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.countDocuments({ createdAt: { $gte: today } }),
        AuditLog.countDocuments({ severity: "error" }),
        AuditLog.countDocuments({ severity: "warning" }),
        AuditLog.aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
        ]),
        AuditLog.aggregate([
          {
            $group: {
              _id: "$severity",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        critical: criticalCount,
        warnings: warningCount,
        byCategory: categoryStats,
        bySeverity: severityStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Create audit log (manual)
// @route   POST /api/audit
// @access  Admin
export const createAuditLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      userName,
      userRole,
      action,
      category,
      severity,
      module,
      description,
      details,
      changes,
    } = req.body;

    const log = await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      category,
      severity: severity || "info",
      module,
      description,
      details,
      ipAddress: req.ip,
      changes,
    });

    res.status(201).json({
      success: true,
      message: "Audit log created successfully",
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating audit log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Delete old audit logs
// @route   DELETE /api/audit/cleanup
// @access  Admin
export const cleanupAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cleaning up audit logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/audit/recent
// @access  Admin
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .populate("userId", "name email role");

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recent activity",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get user activity
// @route   GET /api/audit/user/:userId
// @access  Admin
export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const logs = await AuditLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AuditLog.countDocuments({ userId: req.params.userId });

    res.json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user activity",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
