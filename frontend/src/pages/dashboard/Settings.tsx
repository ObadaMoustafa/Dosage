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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { authApi, pairingApi, type PairingType } from '@/lib/api';
type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
};

type ShareConnection = {
  id: string;
  name: string;
  email: string;
  role: string;
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
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [shareRole, setShareRole] = useState<
    'Zorgverlener' | 'Vertrouweling' | null
  >(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [viewingUserId, setViewingUserId] = useState('self');
  const [sharedWith, setSharedWith] = useState<ShareConnection[]>([]);
  const [viewingUsers, setViewingUsers] = useState<
    { id: string; label: string }[]
  >([]);

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

  const handleDeleteAccount = async (e: FormEvent) => {
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

  const loadPairingData = async () => {
    try {
      const [viewers, subjects] = await Promise.all([
        pairingApi.viewers(),
        pairingApi.subjects(),
      ]);

      setSharedWith([
        ...viewers.therapists.map((viewer) => ({
          id: viewer.user_id,
          name: viewer.name,
          email: viewer.role ?? '',
          role: 'Zorgverlener',
        })),
        ...viewers.trusted.map((viewer) => ({
          id: viewer.user_id,
          name: viewer.name,
          email: viewer.role ?? '',
          role: 'Vertrouweling',
        })),
      ]);

      const userRole = auth.status === 'authed' ? auth.user.role : '';
      const selfLabel = userRole ? `Jij - ${userRole}` : 'Jij';

      const nextViewingUsers = [
        { id: 'self', label: selfLabel },
        ...subjects.full_access.map((subject) => ({
          id: subject.user_id,
          label: `${subject.name} (volledige toegang)`,
        })),
        ...subjects.read_only.map((subject) => ({
          id: subject.user_id,
          label: `${subject.name} (alleen lezen)`,
        })),
      ];
      setViewingUsers(nextViewingUsers);

      setViewingUserId((prev) => {
        if (
          prev !== 'self' &&
          !subjects.full_access
            .concat(subjects.read_only)
            .some((subject) => subject.user_id === prev)
        ) {
          return 'self';
        }
        return prev;
      });
    } catch (error) {
      toast.error((error as Error).message || 'Koppelingen laden mislukt.');
    }
  };

  const handleGenerateShareCode = async (
    role: 'Zorgverlener' | 'Vertrouweling',
  ) => {
    setShareLoading(true);
    try {
      const apiType: PairingType =
        role === 'Zorgverlener' ? 'THERAPIST' : 'TRUSTED';
      const result = await pairingApi.invite(apiType);
      setShareRole(role);
      setShareCode(result.code);
      setShareExpiresAt(result.expires_at);
      toast.success('Deelcode gegenereerd');
      await loadPairingData();
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareRoleSelect = async (
    role: 'Zorgverlener' | 'Vertrouweling',
  ) => {
    await handleGenerateShareCode(role);
    setShareDrawerOpen(false);
  };

  const handleConnectShare = async (event: FormEvent) => {
    event.preventDefault();
    if (otpValue.length !== 6) {
      toast.error('Vul de 6-cijferige code in.');
      return;
    }

    setPairingLoading(true);
    try {
      await pairingApi.link(otpValue);
      toast.success('Verbinding gemaakt.');
      setOtpValue('');
      await loadPairingData();
    } catch (error) {
      toast.error((error as Error).message || 'Koppelen mislukt.');
    } finally {
      setPairingLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    setPairingLoading(true);
    try {
      await pairingApi.unlink(shareId);
      setSharedWith((prev) => prev.filter((item) => item.id !== shareId));
      toast.success('Koppeling verwijderd.');
      await loadPairingData();
    } catch (error) {
      toast.error((error as Error).message || 'Verwijderen mislukt.');
    } finally {
      setPairingLoading(false);
    }
  };

  useEffect(() => {
    const handleViewingChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>;
      setViewingUserId(customEvent.detail.userId);
    };
    window.addEventListener('turfje:viewing-user-changed', handleViewingChange);
    return () => {
      window.removeEventListener(
        'turfje:viewing-user-changed',
        handleViewingChange,
      );
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('turfje:viewing-user');
    if (stored) {
      setViewingUserId(stored);
    }
    void loadPairingData();
  }, []);

  const handleViewingUserChange = (nextValue: string) => {
    setViewingUserId(nextValue);
    localStorage.setItem('turfje:viewing-user', nextValue);
    window.dispatchEvent(
      new CustomEvent('turfje:viewing-user-changed', {
        detail: { userId: nextValue },
      }),
    );
  };

  const viewingOptions =
    viewingUsers.length > 0
      ? viewingUsers
      : [
          {
            id: 'self',
            label:
              auth.status === 'authed' && auth.user.role
                ? `Jij - ${auth.user.role}`
                : 'Jij',
          },
        ];

  const isPatient = auth.status === 'authed' && auth.user.role === 'patient';

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

        {/* Share Card */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle>Delen</CardTitle>
            <CardDescription>
              Geef iemand toegang tot jouw schema&apos;s en historie via een
              tijdelijke code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-white/10 bg-white/5 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium">Bekijken</p>
                <p className="text-xs text-muted-foreground">
                  Kies wiens overzicht je wilt zien. Dit geldt voor je sessie.
                </p>
              </div>
              <Select
                value={viewingUserId}
                onValueChange={handleViewingUserChange}
              >
                <SelectTrigger className="bg-background/10 border-border/60 md:w-60">
                  <SelectValue placeholder="Kies gebruiker" />
                </SelectTrigger>
                <SelectContent>
                  {viewingOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isPatient && (
              <>
                <div className="rounded-md border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium">Deelcode</p>
                      <p className="text-xs text-muted-foreground">
                        Code verloopt na 10 minuten.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShareDrawerOpen(true)}
                      disabled={shareLoading || pairingLoading}
                    >
                      {shareLoading ? 'Genereren...' : 'Genereer code'}
                    </Button>
                  </div>
                  {shareCode ? (
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="text-2xl font-semibold tracking-[0.3em]">
                        {shareCode}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shareRole ? `Voor: ${shareRole} · ` : ''}
                        Geldig tot {shareExpiresAt}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nog geen actieve code.
                    </div>
                  )}
                </div>
                <Drawer
                  open={shareDrawerOpen}
                  onOpenChange={setShareDrawerOpen}
                >
                  <DrawerContent className="dialog-main sm:left-1/2 sm:right-auto sm:w-lg sm:-translate-x-1/2">
                    <div className="mx-auto w-full max-w-xl pb-2">
                      <DrawerHeader className="dialog-text-color">
                        <DrawerTitle className="text-white/90">
                          Voor wie wil je een code genereren?
                        </DrawerTitle>
                        <DrawerDescription className="text-white/50">
                          Kies de rol om een tijdelijke deelcode aan te maken.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button
                            type="button"
                            className="bg-white/10 text-white/90 hover:bg-white/20"
                            disabled={shareLoading || pairingLoading}
                            onClick={() =>
                              handleShareRoleSelect('Zorgverlener')
                            }
                          >
                            Zorgverlener
                          </Button>
                          <Button
                            type="button"
                            className="bg-white/10 text-white/90 hover:bg-white/20"
                            disabled={shareLoading || pairingLoading}
                            onClick={() =>
                              handleShareRoleSelect('Vertrouweling')
                            }
                          >
                            Vertrouweling
                          </Button>
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline" className="main-button-nb">
                            Annuleren
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </>
            )}

            <form
              className="rounded-md border border-white/10 bg-white/5 p-4 space-y-3"
              onSubmit={handleConnectShare}
            >
              <div>
                <p className="text-sm font-medium">Koppel met code</p>
                <p className="text-xs text-muted-foreground">
                  Vul een 6-cijferige code in om te koppelen.
                </p>
              </div>
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div>
                <Button
                  type="submit"
                  disabled={otpValue.length !== 6 || pairingLoading}
                >
                  {pairingLoading ? 'Verbinden...' : 'Verbinden'}
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Gedeeld met</p>
                  <p className="text-xs text-muted-foreground">
                    Beheer wie jouw data kan bekijken.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sharedWith.length} koppelingen
                </span>
              </div>
              {sharedWith.length === 0 ? (
                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                  Nog geen koppelingen.
                </div>
              ) : (
                <div className="grid gap-3">
                  {sharedWith.map((share) => (
                    <div
                      key={share.id}
                      className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage />
                          <AvatarFallback>
                            {`${share.name?.[0] ?? ''}${share.name?.split(' ')[1]?.[0] ?? ''}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{share.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {share.email} · {share.role}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="main-button-nb"
                        disabled={pairingLoading}
                        onClick={() => handleRemoveShare(share.id)}
                      >
                        {pairingLoading ? 'Bezig...' : 'Verwijderen'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Account verwijderen</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1b2441] border-border/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deze actie kan niet ongedaan worden gemaakt. Je account en
                      al je gegevens worden permanent verwijderd van onze
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingAccount}>
                      Annuleren
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingAccount
                        ? 'Bezig met verwijderen...'
                        : 'Ja, verwijder account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
