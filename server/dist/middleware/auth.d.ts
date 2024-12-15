import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User.js';
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
