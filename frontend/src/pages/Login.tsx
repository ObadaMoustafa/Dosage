import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname ?? '/';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Vul je email en wachtwoord in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        toast('Login failed');
        return;
      }

      const data = (await res.json()) as { token?: string };
      if (!data.token) {
        toast('Missing token');
        return;
      }

      localStorage.setItem('token', data.token);
      await refreshAuth();
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <aside className="auth-panel">
          <div className="auth-panel-inner">
            <div className="auth-brand">
              <img
                src="/turfje-logo-white.png"
                alt="Turfje logo"
                className="auth-img-logo"
              />
            </div>
            <div className="auth-quote">
              <p className="auth-quote-text">“Waar ben ik mee bezig?”</p>
              <p className="auth-quote-author">- Josh 2026</p>
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-shell">
            <Card className="auth-card">
              <CardHeader>
                <CardTitle className="auth-card title">Inloggen</CardTitle>
                <CardDescription>
                  Log in met je account om door te gaan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="auth-form" onSubmit={handleLogin}>
                  <div className="auth-field">
                    <Label className="auth-card title">Email</Label>
                    <Input
                      className="auth-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@turfje.nl"
                      autoComplete="email"
                    />
                  </div>

                  <div className="auth-field">
                    <Label className="auth-card title">Wachtwoord</Label>
                    <Input
                      className="auth-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <Button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Bezig...' : 'Inloggen'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="auth-footer">
                <Separator className="auth-seperator" />
                <Link className="auth-link" to="/register">
                  Nog geen account?{' '}
                  <span className="auth-inline-link">Registreer hier</span>
                </Link>
                <p>
                  Door in te loggen ga je akkoord met onze{' '}
                  <span className="auth-inline-link">voorwaarden</span> en{' '}
                  <span className="auth-inline-link">privacy policy</span>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
