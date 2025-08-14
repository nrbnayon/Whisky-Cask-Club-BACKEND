import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        id?: string;
        userId?: string;
        email?: string;
        role?: string;
      };
    }
  }
}
