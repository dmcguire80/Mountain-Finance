import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { user, login, signup, resetPassword, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isForgotPassword) {
      setSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent! Check your email.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mountain Finance</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {isForgotPassword
              ? 'Reset your password'
              : isSignup
                ? 'Create your account'
                : 'Sign in to your account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {isSignup && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Forgot password link (login mode only) */}
            {!isSignup && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-3 text-sm">
                {successMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3 text-base"
            >
              {submitting ? (
                <div className="spinner w-5 h-5 border-white/30 border-t-white"></div>
              ) : (
                <>
                  {isForgotPassword
                    ? 'Send Reset Link'
                    : isSignup
                      ? 'Create Account'
                      : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle signup/login */}
          <div className="text-center mt-6">
            <p className="text-[var(--text-secondary)]">
              {isForgotPassword ? (
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[var(--color-primary)] font-medium hover:underline"
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[var(--color-primary)] font-medium hover:underline"
                  >
                    {isSignup ? 'Sign in' : 'Sign up'}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
