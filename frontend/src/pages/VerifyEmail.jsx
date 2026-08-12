import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { API_BASE_URL } = useContext(AuthContext);

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/auth/verify-email?token=${token}`)
        .then((res) => {
          setStatus('success');
          setMessage(res.data.message || 'Email verified successfully!');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
        });
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, API_BASE_URL]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-white/10 text-center space-y-4">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white">Verifying Email Address...</h3>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Email Verified!</h3>
            <p className="text-sm text-slate-300">{message}</p>
            <Link to="/login" className="btn-primary w-full py-3 inline-block">
              Proceed to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Verification Failed</h3>
            <p className="text-sm text-rose-300">{message}</p>
            <Link to="/register" className="btn-secondary w-full py-3 inline-block">
              Back to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
