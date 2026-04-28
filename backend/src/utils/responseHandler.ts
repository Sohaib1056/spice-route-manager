import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
};

export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = "Success"
): void => {
  res.status(200).json({
    success: true,
    message,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data,
  });
};
