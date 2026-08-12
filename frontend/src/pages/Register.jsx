import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, AlertCircle, ArrowRight, Pizza } from 'lucide-react';

export default function Register() {
  const { register, loading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await register(name, email, password);
      setSuccessMsg(res.message || 'Registration successful! Verification email sent.');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Create an Account</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Join SliceCraft to build custom artisan pizzas with live tracking
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-6 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Verification Link Sent</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{successMsg}</p>
            <p className="text-xs text-slate-400 italic">
              Please check your inbox or server console to verify your email before signing in.
            </p>
            <Link to="/login" className="btn-primary w-full py-3 text-xs font-bold no-underline block">
              Go to Login Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="form-control w-full pl-10 text-sm"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control w-full pl-10 text-sm"
                  placeholder="At least 6 characters"
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
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5">
          <span>Already have an account?</span>
          <Link to="/login" className="text-rose-400 font-bold hover:text-rose-300 no-underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
