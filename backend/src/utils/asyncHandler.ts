import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: any, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('API Async Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    });
  };
};
