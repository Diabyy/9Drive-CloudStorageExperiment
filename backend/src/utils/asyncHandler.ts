import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch((error: unknown) => {
      console.error('API Async Error:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      if (!res.headersSent) {
        res.status(500).json({ error: message });
      }
    });
  };
};
