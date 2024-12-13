import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User.js';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
