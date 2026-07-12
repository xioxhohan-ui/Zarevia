import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { email, password, name, phone });
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 min-h-[75vh] flex flex-col justify-center space-y-6">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-extrabold text-charcoal">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-sm text-neutral-400">
          {mode === 'login' ? 'Sign in to manage orders and view wishlist.' : 'Sign up to speed up checkout.'}
        </p>
      </div>

      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-400 uppercase">Email Address *</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-400 uppercase">Password *</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors mt-2"
          >
            {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400 pt-3 border-t border-neutral-50">
          {mode === 'login' ? (
            <p>
              New to JARAVIEA?{' '}
              <button onClick={() => setMode('register')} className="text-primary font-bold hover:underline">
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
export default Login;
