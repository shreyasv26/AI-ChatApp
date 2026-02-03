import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', credentials);

      const { token, username } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      setSuccess("Login successful! Redirecting...");
      setError('');

      // Delay redirect so user sees success
      setTimeout(() => {
        window.location.href = '/join';
      }, 1500);
    } catch (err) {
      setError('Invalid email or password');
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <form onSubmit={handleLogin} className="p-8 bg-[#1e293b] rounded-xl shadow-xl w-96 border border-[#334155]">
        <h2 className="mb-6 text-2xl font-bold text-center text-[#e2e8f0]">Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        
        <button className="w-full p-3 text-white bg-[#3b82f6] rounded-xl hover:bg-[#60a5fa] font-semibold transition">
          Sign In
        </button>

        {success && (
          <p className="mt-4 text-sm text-center text-green-400 font-medium bg-green-900 p-2 rounded border border-green-600">
            {success}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-center text-red-400 font-medium bg-red-900 p-2 rounded border border-red-600">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#3b82f6] hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
