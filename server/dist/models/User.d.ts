import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
}
export declare const User: IUserModel;
