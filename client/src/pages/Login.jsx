import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import { Splash } from '../components/Feedback.jsx';

export default function Login() {
  const { user, loading, expired } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState('login');
  if (loading) return <Splash />;
  if (user) return <Navigate to="/app" replace />;
  const signup = mode === 'signup';
  const error = params.get('error') ? 'Google sign-in didn’t complete. Please try again.' : expired ? 'Your session has expired. Please sign in again.' : '';

  return (
    <div className="auth">
      <div className="auth__layer auth__layer--1" /><div className="auth__layer auth__layer--2" />
      <main className="auth__card">
        <Link to="/" className="brand"><img src="/favicon.svg" alt="" width="30" height="30" />Quick Notes</Link>
        <h1 key={mode} className="swap">{signup ? 'Start your notebook' : 'Welcome back'}</h1>
        <p key={mode + 'p'} className="swap">{signup ? 'Create your account with Google. It takes one tap.' : 'Your ideas are waiting.'}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <GoogleButton label={signup ? 'Sign up with Google' : 'Continue with Google'} />
        <p className="auth__switch">
          {signup ? 'Already have a notebook?' : 'New to Quick Notes?'}{' '}
          <button className="link" onClick={() => setMode(signup ? 'login' : 'signup')}>{signup ? 'Log in' : 'Sign up'}</button>
        </p>
        <small>We only read your name, email and photo. Passwords are never stored.</small>
      </main>
    </div>
  );
}
