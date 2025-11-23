import React, { useEffect, useState, useCallback } from 'react';
import Container from '../components/Container';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logout } from '../features/auth/authSlice';
import axios from 'axios';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🧩 Toast function (stable via useCallback)
  const showToast = useCallback((message: string, type: 'success' | 'error', redirect?: boolean) => {
    const toast = document.createElement('div');
    toast.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'} text-white shadow-lg`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    const container = document.getElementById('toast-container');
    container?.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if (redirect) {
        dispatch(logout());
        navigate('/dashboard/');
      }
    }, 3000); // wait 3 seconds before removing toast and redirecting
  }, [dispatch, navigate]);
  

  // ✅ Step 2: Verify token if present
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      setLoading(true);
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/forgot-password`, {
          params: { token }
        });
        setTokenValid(true);
      } catch {
        showToast('Token is invalid or expired', 'error', false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, showToast]);

  // ✅ Step 3: Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/reset-password`, { email });
      showToast('Magic link has been sent to your email.', 'success', false);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resp = err.response?.data as { message?: string } | undefined;
        showToast(resp?.message || err.message || 'Something went wrong', 'error', false);
      } else {
        showToast(String(err) || 'Something went wrong', 'error', false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 4: Handle password reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmedPassword) {
      showToast("Passwords don't match", 'error', false);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/forgot-password`, {
        token,
        password: newPassword,
        email
      });
      showToast('Password reset successful! You can now login.', 'success', true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resp = err.response?.data as { message?: string } | undefined;
        showToast(resp?.message || err.message || 'Something went wrong', 'error', false);
      } else {
        showToast(String(err), 'error', false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex-col items-center justify-center p-4 relative min-h-screen">
      {/* 🧾 DaisyUI toast container */}
      <div id="toast-container" className="toast toast-top toast-end z-50 absolute top-4 right-4" />

      <form
        className="bg-base-100 shadow-xl rounded-xl p-8 w-96 space-y-4"
        onSubmit={token ? handlePasswordSubmit : handleEmailSubmit}
      >
        <h1 className="text-xl font-bold text-center">
          {token ? 'Reset Password' : 'Forgot Password'}
        </h1>

        {!token && (
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Input your registered email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {token && tokenValid && (
          <>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Input your registered email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="New password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Confirm password"
              required
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
            />
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={!!loading || (!!token && !tokenValid)}
        >
          {loading ? 'Please wait...' : token ? 'Reset Password' : 'Submit'}
        </button>
      </form>
    </Container>
  );
};

export default ForgotPassword;
