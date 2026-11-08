
import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

type AuthProps = {
  onLogin: (token: string, user: any) => void;
};

export default function Auth({ onLogin }: AuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username.trim(),
          password,
        }),
      });

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Login server returned an invalid response (HTTP ${response.status}). Check the backend terminal.`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      if (!data.token || !data.user) {
        throw new Error('The server returned an incomplete login response.');
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to NyotaOne. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">
          <Mail size={23} />
        </div>
        <span>
          nyota<span>one</span>
        </span>
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <div className="auth-icon">
            <Mail size={25} />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your NyotaOne account.</p>
        </div>

        {error && <div className="auth-message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="nyota-username">Username or email</label>
          <div className="auth-input">
            <Mail size={17} />
            <input
              id="nyota-username"
              required
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
            />
          </div>

          <label htmlFor="nyota-password">Password</label>
          <div className="auth-input">
            <Lock size={17} />
            <input
              id="nyota-password"
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="auth-security">
          <Lock size={14} />
          Secure business communication powered by NyotaOne
        </div>

        <div className="auth-registration-note">
          Need an account? Contact your company administrator to create one.
        </div>
      </div>

      <footer className="auth-footer">
        © 2026 NyotaOne · Business email and IT solutions
      </footer>
    </div>
  );
}
