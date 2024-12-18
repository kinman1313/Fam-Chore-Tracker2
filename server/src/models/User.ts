import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for User model
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error as Error);
  }
});

// Create and export the model
export const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);