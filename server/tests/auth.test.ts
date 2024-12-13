import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chore-tracker';

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!@#'
};

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Clean up test data
async function cleanupDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('users').deleteOne({ email: testUser.email });
        console.log('Test user cleaned up');
      }
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
}

async function testRegistrationValidation() {
  console.log('\nTesting Registration Validation...');
  
  // Test invalid email
  try {
    await axios.post(`${API_URL}/auth/register`, {
      ...testUser,
      email: 'invalid-email'
    });
    console.error('❌ Invalid email validation failed');
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.log('✅ Invalid email rejected:', error.response.data.message);
    } else {
      console.log('✅ Invalid email rejected');
    }
  }

  // Test weak password
  try {
    await axios.post(`${API_URL}/auth/register`, {
      ...testUser,
      password: '123'
    });
    console.error('❌ Weak password validation failed');
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.log('✅ Weak password rejected:', error.response.data.message);
    } else {
      console.log('✅ Weak password rejected');
    }
  }

  // Test missing fields
  try {
    await axios.post(`${API_URL}/auth/register`, {
      email: testUser.email
    });
    console.error('❌ Missing fields validation failed');
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.log('✅ Missing fields rejected:', error.response.data.message);
    } else {
      console.log('✅ Missing fields rejected');
    }
  }
}

async function testRegistration() {
  try {
    console.log('\nTesting Registration...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ Registration successful');
      console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
      console.log('User data:', response.data.data.user);
      return response.data.data;
    }
  } catch (error: any) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding with tests...');
      return null;
    }
    console.error('❌ Registration failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    if (error.response?.status) {
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
}

async function testLoginValidation() {
  console.log('\nTesting Login Validation...');

  // Test invalid credentials
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
    console.error('❌ Invalid credentials validation failed');
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.log('✅ Invalid credentials rejected:', error.response.data.message);
    } else {
      console.log('✅ Invalid credentials rejected');
    }
  }

  // Test missing fields
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email
    });
    console.error('❌ Missing fields validation failed');
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.log('✅ Missing fields rejected:', error.response.data.message);
    } else {
      console.log('✅ Missing fields rejected');
    }
  }
}

async function testLogin() {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success) {
      console.log('✅ Login successful');
      console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
      console.log('User data:', response.data.data.user);
      return response.data.data;
    }
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

async function testTokenValidation(token: string) {
  try {
    console.log('\nTesting Token Validation...');
    
    // Test with valid token
    const response = await axios.get(`${API_URL}/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ Valid token accepted');
      console.log('User data:', response.data.data.user);
    }

    // Test with invalid token
    try {
      await axios.get(`${API_URL}/auth/validate-token`, {
        headers: { Authorization: `Bearer invalid-token` }
      });
      console.error('❌ Invalid token validation failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        console.log('✅ Invalid token rejected:', error.response.data.message);
      } else {
        console.log('✅ Invalid token rejected');
      }
    }

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Token validation failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

async function testPasswordReset() {
  try {
    console.log('\nTesting Password Reset Request...');
    
    // Test reset request
    const resetResponse = await axios.post(`${API_URL}/auth/reset-password`, {
      email: testUser.email
    });
    
    if (resetResponse.data.success) {
      console.log('✅ Password reset request successful');
    }

    // Test invalid email
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email: 'invalid@nonexistent.com'
      });
      console.error('❌ Invalid email validation failed');
    } catch (error) {
      console.log('✅ Invalid email rejected');
    }

  } catch (error: any) {
    console.error('❌ Password reset failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Authentication Tests...\n');

    // Connect to MongoDB
    await connectDB();

    // Clean up any existing test user
    await cleanupDB();
    
    // Test registration validation
    await testRegistrationValidation();
    
    // Test registration
    const registrationData = await testRegistration();
    
    // Test login validation
    await testLoginValidation();
    
    // Test login
    const loginData = await testLogin();
    
    // Test token validation
    if (loginData?.token) {
      await testTokenValidation(loginData.token);
    }

    // Test password reset
    await testPasswordReset();
    
    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed');
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Clean up
    await cleanupDB();
  }
}

// Run the tests
runTests(); 