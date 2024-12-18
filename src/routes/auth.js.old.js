import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const router = express.Router();

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    username: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Register
router.post('/register', async (req: RegisterRequest, res: Response) => {
  try {
    const { name, email, password, username } = req.body;

    // Input validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists (email or username)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: IUser = new User({
      name,
      email,
      username,
      password: hashedPassword
    });

    // Save user
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username
      }
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Registration failed',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Login
router.post('/login', async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default router;