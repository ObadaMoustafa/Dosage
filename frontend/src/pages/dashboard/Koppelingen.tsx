import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { pairingApi, type PairingType } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

type Viewer = {
  connection_id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  relation: 'Zorgverlener' | 'Vertrouweling';
};

type Subject = {
  connection_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  accessLevel: 'full_access' | 'read_only';
};

export default function Koppelingen() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // State for Pairing/Linking
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [shareRole, setShareRole] = useState<
    'Zorgverlener' | 'Vertrouweling' | null
  >(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // State for Lists
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Collapse State
  const [isViewersOpen, setIsViewersOpen] = useState(true);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(true);

  const isTherapist =
    auth.status === 'authed' && auth.user.role === 'behandelaar';

  const loadPairingData = async () => {
    setLoadingLists(true);
    try {
      const [viewersData, subjectsData] = await Promise.all([
        pairingApi.viewers(),
        pairingApi.subjects(),
      ]);

      // Process Viewers (People watching me)
      const processedViewers: Viewer[] = [
        ...viewersData.therapists.map((v: any) => ({
          ...v,
          connection_id: v.id ?? v.connection_id,
          relation: 'Zorgverlener',
        })),
        ...viewersData.trusted.map((v: any) => ({
          ...v,
          connection_id: v.id ?? v.connection_id,
          relation: 'Vertrouweling',
        })),
      ];
      setViewers(processedViewers);

      // Process Subjects (People I watch)
      const processedSubjects: Subject[] = [
        ...subjectsData.full_access.map((s: any) => ({
          ...s,
          connection_id: s.id ?? s.connection_id,
          accessLevel: 'full_access' as const,
        })),
        ...subjectsData.read_only.map((s: any) => ({
          ...s,
          connection_id: s.id ?? s.connection_id,
          accessLevel: 'read_only' as const,
        })),
      ];
      setSubjects(processedSubjects);
    } catch (error) {
      toast.error((error as Error).message || 'Koppelingen laden mislukt.');
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    void loadPairingData();
  }, []);

  // --- Handlers for Generating Code ---

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
    } catch (error) {
      toast.error((error as Error).message || 'Code genereren mislukt.');
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

  // --- Handlers for Linking (Entering Code) ---

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

  // --- Handlers for Actions ---

  const handleRemoveConnection = async (userId: string) => {
    if (!userId) {
      toast.error('Kan gebruiker niet vinden (ID ontbreekt).');
      return;
    }

    try {
      await pairingApi.unlink(userId);
      toast.success('Koppeling verwijderd.');
      await loadPairingData();
    } catch (error) {
      toast.error((error as Error).message || 'Verwijderen mislukt.');
    }
  };

  const handleViewUser = (userId: string) => {
    // Update local storage and dispatch event to update layout
    localStorage.setItem('turfje:viewing-user', userId);
    window.dispatchEvent(
      new CustomEvent('turfje:viewing-user-changed', {
        detail: { userId },
      }),
    );
    toast.success('Weergave gewijzigd.');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Koppelingen</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je connecties met zorgverleners en vertrouwelingen.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Code Card */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle>Nieuwe koppeling maken</CardTitle>
            <CardDescription>
              Genereer een code zodat iemand anders jou kan volgen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Deelcode</p>
                  <p className="text-xs text-muted-foreground">
                    Geldig voor 15 minuten.
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
                <div className="rounded-md border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-2xl font-semibold tracking-[0.3em]">
                      {shareCode}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {shareRole ? `Voor: ${shareRole}` : ''}
                      <br />
                      Verloopt: {shareExpiresAt}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-white/10 bg-white/5 p-4 text-center text-sm text-muted-foreground">
                  Nog geen actieve code.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Link User Card */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader>
            <CardTitle>Koppelen met code</CardTitle>
            <CardDescription>
              Heb je een code ontvangen? Vul deze hier in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnectShare} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">6-cijferige code</p>
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={otpValue.length !== 6 || pairingLoading}
              >
                {pairingLoading ? 'Verbinden...' : 'Verbinden'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Lists Section */}
      <div className="space-y-6">
        {/* Viewers List (Who watches me) */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setIsViewersOpen(!isViewersOpen)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wie kijkt er mee?</CardTitle>
                <CardDescription>
                  Personen die toegang hebben tot jouw gegevens (Zorgverleners &
                  Vertrouwelingen).
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <span
                  className={`fas fa-chevron-${isViewersOpen ? 'up' : 'down'}`}
                />
              </Button>
            </div>
          </CardHeader>
          {isViewersOpen && (
            <CardContent>
              {loadingLists ? (
                <p className="text-sm text-muted-foreground">Laden...</p>
              ) : viewers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Niemand kijkt momenteel mee.
                </p>
              ) : (
                <div className="rounded-md border border-white/10 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-white/5 text-muted-foreground font-medium">
                      <tr>
                        <th className="p-3">Naam</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Rol</th>
                        <th className="p-3">Relatie</th>
                        <th className="p-3 text-right">Actie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {viewers.map((viewer) => (
                        <tr
                          key={viewer.connection_id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={viewer.avatar} />
                                <AvatarFallback>
                                  {viewer.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{viewer.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {viewer.email}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {viewer.role}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                viewer.relation === 'Zorgverlener'
                                  ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20'
                                  : 'bg-green-400/10 text-green-400 ring-green-400/20'
                              }`}
                            >
                              {viewer.relation}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  title="Verwijder koppeling"
                                >
                                  <span className="fas fa-trash" />
                                </Button>
                              }
                              title="Koppeling verwijderen?"
                              description="Weet je zeker dat je deze koppeling wilt verwijderen?"
                              confirmLabel="Verwijderen"
                              onConfirm={() =>
                                handleRemoveConnection(viewer.user_id)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Subjects List (Who I watch) */}
        <Card className="bg-[#1b2441] border-border/60">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wie volg jij?</CardTitle>
                <CardDescription>
                  Personen waarvan jij de gegevens kunt inzien.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <span
                  className={`fas fa-chevron-${isSubjectsOpen ? 'up' : 'down'}`}
                />
              </Button>
            </div>
          </CardHeader>
          {isSubjectsOpen && (
            <CardContent>
              {loadingLists ? (
                <p className="text-sm text-muted-foreground">Laden...</p>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Je volgt momenteel niemand.
                </p>
              ) : (
                <div className="rounded-md border border-white/10 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[500px]">
                    <thead className="bg-white/5 text-muted-foreground font-medium">
                      <tr>
                        <th className="p-3">Naam</th>
                        <th className="p-3">Email</th>
                        {isTherapist && <th className="p-3">Type</th>}
                        <th className="p-3 text-right">Actie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {subjects.map((subject) => (
                        <tr
                          key={subject.connection_id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={subject.avatar} />
                                <AvatarFallback>
                                  {subject.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {subject.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {subject.email}
                          </td>
                          {isTherapist && (
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                  subject.accessLevel === 'full_access'
                                    ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20'
                                    : 'bg-green-400/10 text-green-400 ring-green-400/20'
                                }`}
                              >
                                {subject.accessLevel === 'full_access'
                                  ? 'Patiënt'
                                  : 'Vertrouweling'}
                              </span>
                            </td>
                          )}
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                onClick={() => handleViewUser(subject.user_id)}
                                title="Bekijk gegevens"
                              >
                                <span className="fas fa-eye" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Drawer for selecting role when generating code */}
      <Drawer open={shareDrawerOpen} onOpenChange={setShareDrawerOpen}>
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
                  onClick={() => handleShareRoleSelect('Zorgverlener')}
                >
                  Zorgverlener
                </Button>
                <Button
                  type="button"
                  className="bg-white/10 text-white/90 hover:bg-white/20"
                  disabled={shareLoading || pairingLoading}
                  onClick={() => handleShareRoleSelect('Vertrouweling')}
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
    </div>
  );
}
