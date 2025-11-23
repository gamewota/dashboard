import React, { useState } from 'react';
import axios from 'axios';
import Container from '../components/Container';
import { Button } from '../components/Button';

const ResendVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/verify/resend`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setMessage(response.data?.message || 'Verification email has been resent.');
    } catch (err: unknown) {
      const message =
        (axios.isAxiosError(err) ? err.response?.data?.message : undefined) ||
        (err instanceof Error ? err.message : String(err));

      setError(
        message || 'Failed to resend verification email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='flex-col items-center justify-center p-4 relative min-h-screen'>
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Resend Verification Email</h1>
        <form onSubmit={handleSubmit}>
            <label className="block mb-2 font-medium" htmlFor="email">
            Email Address
            </label>
            <input
            type="email"
            id="email"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <Button
            type="submit"
            disabled={loading}
            className="w-full"
            variant="primary"
            >
            {loading ? 'Sending...' : 'Resend Verification'}
            </Button>
        </form>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    </Container>
  );
};

export default ResendVerification;
