import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux';
import { logout } from './features/auth/authSlice.ts';
import {store} from './store'
import {jwtDecode} from 'jwt-decode';

type DecodedToken = {
  id: number;
  username: string;
  email: string;
  roles: {
    role: string;
    permissions: string[];
  }[];
};


const token = localStorage.getItem('token');
if (token) {
  try {
    const decoded: DecodedToken = jwtDecode(token);
      // Manually hydrate auth state without hitting the API
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          message: 'Restored session',
          token,
          user: {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            roles: decoded.roles,
          },
        },
      });
  } catch {
    store.dispatch(logout());
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
