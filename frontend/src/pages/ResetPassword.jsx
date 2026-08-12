import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle, Pizza, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { API_BASE_URL } = useContext(AuthContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
      });
      setMessage(res.data.message || 'Password reset successful!');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Set New Password</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Create a secure new password for your account
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
            <h4 className="text-lg font-bold text-white">Password Updated</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
            <Link to="/login" className="btn-primary w-full py-3 text-xs font-bold no-underline block">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">New Password</label>
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

            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control w-full pl-10 text-sm"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold mt-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
