import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pizza, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 py-12">
      <div
        style={{
          background: 'rgba(21, 24, 38, 0.9)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(247, 37, 79, 0.15)',
        }}
        className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 animate-fade-in"
      >
        <div className="text-center space-y-3">
          <div
            style={{
              background: 'linear-gradient(135deg, #F7254F 0%, #FF8A00 100%)',
            }}
            className="inline-flex p-3 rounded-2xl shadow-lg"
          >
            <Pizza className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to track live orders and customize artisan pizzas
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                className="form-control w-full pl-10 text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-rose-400 hover:text-rose-300 no-underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                className="form-control w-full pl-10 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In to Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Don't have an account yet?</span>
          <Link to="/register" className="text-rose-400 font-bold hover:text-rose-300 no-underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
