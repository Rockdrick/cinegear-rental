import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roleId: number;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role_id FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      roleId: result.rows[0].role_id
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // This would need to be implemented based on your role system
    // For now, we'll just check if user exists
    next();
  };
};
