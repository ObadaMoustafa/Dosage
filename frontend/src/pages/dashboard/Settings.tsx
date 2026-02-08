import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { useAuth } from '@/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authApi } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
};

export default function DashboardSettings() {
  const { auth, refreshAuth, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // <-- Modal State

  useEffect(() => {
    if (auth.status !== 'authed') return;
    setProfile({
      firstName: auth.user.first_name ?? '',
      lastName: auth.user.last_name ?? '',
      email: auth.user.email ?? '',
      avatarUrl: auth.user.avatar_url ?? '',
    });
  }, [auth]);

  const hasChanges =
    auth.status === 'authed' &&
    (profile.firstName !== (auth.user.first_name ?? '') ||
      profile.lastName !== (auth.user.last_name ?? '') ||
      profile.email !== (auth.user.email ?? ''));

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasChanges) {
      toast.info('Geen wijzigingen om op te slaan.');
      return;
    }

    if (!profile.firstName || !profile.lastName) {
      toast.error('Voornaam en achternaam zijn verplicht.');
      return;
    }

    setSavingProfile(true);
    try {
      await authApi.updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email || null,
      });
      await refreshAuth();
      toast.success('Profiel bijgewerkt');
    } catch (error) {
      toast.error((error as Error).message || 'Opslaan mislukt');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      toast.error('Vul alle velden in.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Nieuwe wachtwoorden komen niet overeen.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens zijn.');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });
      toast.success('Wachtwoord succesvol gewijzigd');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error((error as Error).message || 'Er is een fout opgetreden.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeletingAccount(true);
    try {
      await authApi.deleteAccount();
      toast.success('Account verwijderd. Tot ziens!');
      logout();
    } catch (error) {
      toast.error((error as Error).message || 'Er is een fout opgetreden.');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Instellingen</h1>
        <p className="text-sm text-muted-foreground">
          Hier kun je je accountinstellingen beheren.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle>Profiel</CardTitle>
            <CardDescription>
              Dit is jou profiel. Hier beheer je de gegevens van je account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {`${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-lg">
                  {`${profile.firstName} ${profile.lastName}`.trim() ||
                    'Jouw profiel'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Je avatar wordt automatisch gegenereerd.
                </p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid gap-2">
                <Label>Voornaam</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="Voornaam"
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="grid gap-2">
                <Label>Achternaam</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Achternaam"
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email adres</Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email"
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={savingProfile || !hasChanges}>
                  {savingProfile
                    ? 'Bezig met opslaan...'
                    : 'Wijzigingen opslaan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle>Wachtwoord</CardTitle>
            <CardDescription>
              Hier kun je je wachtwoord wijzigen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="grid gap-2">
                <Label>Huidig wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="grid gap-2">
                <Label>Nieuw wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="grid gap-2">
                <Label>Bevestig nieuw wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/15"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Opslaan...' : 'Wachtwoord opslaan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#1b2441] border-red-900/60">
          <CardHeader>
            <CardTitle className="text-red-600">Gevarenzone</CardTitle>
            <CardDescription>
              Acties die niet ongedaan kunnen worden gemaakt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Account verwijderen</p>
                <p className="text-sm text-muted-foreground">
                  Hiermee verwijder je je account en al je gegevens permanent.
                </p>
              </div>

              {/* New Alert Dialog Implementation */}
              <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                trigger={
                  <Button variant="destructive">Account verwijderen</Button>
                }
                title="Weet je het zeker?"
                description="Deze actie kan niet ongedaan worden gemaakt. Je account en al je gegevens worden permanent verwijderd van onze servers."
                confirmLabel="Ja, verwijder account"
                onConfirm={handleDeleteAccount}
                loading={deletingAccount}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
