import { Request, Response, NextFunction } from "express";

export const validateUserInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password } = req.body;

  if (req.method === "POST") {
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Name is required",
      });
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }
  }

  next();
};

export const validatePermissionInput = (req: Request, res: Response, next: NextFunction): void => {
  const { permissions } = req.body;

  if (!permissions || typeof permissions !== "object") {
    res.status(400).json({
      success: false,
      message: "Valid permissions object is required",
    });
    return;
  }

  next();
};

export const validateAuditInput = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, userName, userRole, action, category, module, description } = req.body;

  if (!userId || !userName || !userRole || !action || !category || !module || !description) {
    res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
    return;
  }

  next();
};
