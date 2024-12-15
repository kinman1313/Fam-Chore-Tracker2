import React from 'react';
import { useState } from 'react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error) => void;
}

const Login = ({ onLoginSuccess, onLoginError }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.login({
        email,
        password
      });
      
      onLoginSuccess?.();
      // You might want to store the token/user data here
      // localStorage.setItem('token', response.token);
      
    } catch (error) {
      onLoginError?.(error as Error);
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login; 