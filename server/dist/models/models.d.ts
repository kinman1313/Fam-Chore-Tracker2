import mongoose from 'mongoose';
export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    createPasswordResetToken: () => string;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default User;
