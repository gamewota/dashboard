import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import type { AppDispatch } from '../store';
import { Button } from './Button';

/**
 * Unauthenticated landing: branded panel + credentials form.
 */
export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));

    if (login.fulfilled.match(resultAction)) {
      const { user } = resultAction.payload;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-content text-xl font-bold shadow-sm">
            G
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Game Wota</h1>
          <p className="text-sm text-base-content/60">Admin Dashboard</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-base-100 border border-base-300 shadow-sm rounded-xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {auth.error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{auth.error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={auth.loading}>
            {auth.loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-base-content/50">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
