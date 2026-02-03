import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/register', formData);

      localStorage.setItem('username', formData.username);
      localStorage.setItem('token', response.data);

      setSuccess("🎉 Account created successfully! Redirecting...");
      setMessage('');

      // Redirect after short delay so user sees success
      setTimeout(() => {
        window.location.href = '/join';
      }, 1500);
    } catch (err) {
      console.error("Register failed");
      setMessage("Registration failed. Please try again.");
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <form onSubmit={handleRegister} className="p-8 bg-[#1e293b] rounded-xl shadow-xl w-96 border border-[#334155]">
        <h2 className="mb-6 text-2xl font-bold text-center text-[#e2e8f0]">Register</h2>
        
        <input
          name="username"
          className="w-full p-3 mb-4 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        
        <button className="w-full p-3 text-white bg-[#3b82f6] rounded-xl hover:bg-[#60a5fa] font-semibold transition">
          Create Account
        </button>

        {success && (
          <p className="mt-4 text-sm text-center text-green-400 font-medium bg-green-900 p-2 rounded border border-green-600">
            {success}
          </p>
        )}
        
        {message && (
          <p className="mt-4 text-sm text-center text-red-400 font-medium bg-red-900 p-2 rounded border border-red-600">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3b82f6] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
