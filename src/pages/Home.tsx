import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';


const Home = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const resultAction = await dispatch(login({ email, password }));
  
    if (login.fulfilled.match(resultAction)) {
      const { user } = resultAction.payload;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard/users');
    } else {
      console.error('Login failed:', resultAction.payload); 
    }
  };
  
  return (
    <div className='min-h-screen w-screen flex items-center justify-center'>
        <form
        onSubmit={handleLogin}
        className="bg-base-100 shadow-xl rounded-xl p-8 w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={auth.loading}
        >
          {auth.loading ? 'Logging in...' : 'Login'}
        </button>

        {auth.error && (
          <div className="text-error text-sm text-center">{auth.error}</div>
        )}
      </form>
    </div>
  )
}

export default Home