import { Request, Response, NextFunction } from "express";

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.get("X-User-Id")?.trim();
  if (!userId) {
    res.status(400).json({ error: "X-User-Id header is required" });
    return;
  }
  res.locals.userId = userId;
  next();
}
