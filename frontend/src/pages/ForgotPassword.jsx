import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, Pizza, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const { API_BASE_URL } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage(res.data.message || 'Password reset link sent to your email.');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
      setLoading(false);
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your email to receive a secure password recovery link
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="p-6 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Reset Link Dispatched</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
            <Link to="/login" className="btn-primary w-full py-3 text-xs font-bold no-underline block">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold mt-2"
            >
              {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5">
          <span>Remember your password?</span>
          <Link to="/login" className="text-rose-400 font-bold hover:text-rose-300 no-underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
