import { Link, useNavigate } from 'react-router-dom';
import { useState, type ChangeEvent, type FormEvent } from 'react';
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
import TextReveal from '@/components/TextReveal';

type RegisterState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof RegisterState) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Vul alle velden in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          role: 'patient',
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast(data?.error ?? 'Registratie mislukt');
        return;
      }

      toast.success('Registratie gelukt, log nu in');
      navigate('/login');
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
              <p className="auth-quote-version">v0.1</p>
              <TextReveal
                text="Welkom bij Turfje"
                className="auth-quote-text"
              />
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-shell">
            <Card className="auth-card">
              <CardHeader>
                <CardTitle className="auth-card title">Account maken</CardTitle>
                <CardDescription>
                  Maak een account aan om door te gaan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="auth-field">
                    <Label className="auth-card title">Voornaam</Label>
                    <Input
                      className="auth-input"
                      value={form.firstName}
                      onChange={handleChange('firstName')}
                      placeholder="Voornaam"
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="auth-field">
                    <Label className="auth-card title">Achternaam</Label>
                    <Input
                      className="auth-input"
                      value={form.lastName}
                      onChange={handleChange('lastName')}
                      placeholder="Achternaam"
                      autoComplete="family-name"
                    />
                  </div>

                  <div className="auth-field">
                    <Label className="auth-card title">Email</Label>
                    <Input
                      className="auth-input"
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="jij@turfje.nl"
                      autoComplete="email"
                    />
                  </div>

                  <div className="auth-field">
                    <Label className="auth-card title">Wachtwoord</Label>
                    <Input
                      className="auth-input"
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  <Button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Bezig...' : 'Registreren'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="auth-footer">
                <Separator className="auth-seperator" />
                <Link className="auth-link" to="/login">
                  Heb je al een account?{' '}
                  <span className="auth-inlin-link">Inloggen</span>
                </Link>
                <p>
                  Door een account te maken ga je akkoord met onze{' '}
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
