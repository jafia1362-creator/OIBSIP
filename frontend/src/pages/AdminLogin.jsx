import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('admin@pizzadelivery.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 py-12">
      <div
        style={{
          background: 'rgba(21, 24, 38, 0.92)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 138, 0, 0.2)',
          borderColor: 'rgba(255, 138, 0, 0.3)',
        }}
        className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-3xl border space-y-6 animate-fade-in"
      >
        <div className="text-center space-y-3">
          <div
            style={{
              background: 'linear-gradient(135deg, #FF8A00 0%, #E67A00 100%)',
            }}
            className="inline-flex p-3 rounded-2xl shadow-lg shadow-orange-500/20"
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Command Center</h2>
          <p className="text-xs sm:text-sm text-amber-400/90 font-medium">
            Restricted inventory management & live order operations
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
            <label className="text-xs font-semibold text-amber-300/80">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                className="form-control w-full pl-10 text-sm border-amber-500/20 focus:border-amber-500"
                placeholder="admin@pizzadelivery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold text-amber-300/80">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className="form-control w-full pl-10 text-sm border-amber-500/20 focus:border-amber-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-orange w-full py-3.5 text-sm font-bold mt-2"
          >
            {loading ? 'Verifying Credentials...' : 'Access Admin Dashboard'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/5 text-xs text-slate-400 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-400/90 font-bold mb-1">
            <KeyRound className="w-3.5 h-3.5" /> Default Admin Seed Access:
          </div>
          <div>Email: <span className="text-white font-mono font-semibold">admin@pizzadelivery.com</span></div>
          <div>Password: <span className="text-white font-mono font-semibold">admin123</span></div>
        </div>
      </div>
    </div>
  );
}
