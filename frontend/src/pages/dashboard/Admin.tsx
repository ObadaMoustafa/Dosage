import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import { toast } from '@/lib/toast';
import { adminApi, type AdminUser } from '@/lib/api';
import { useAuth } from '@/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ConfirmDialog';

const roleOptions = [
  { value: 'patient', label: 'Patient' },
  { value: 'behandelaar', label: 'Behandelaar' },
  { value: 'admin', label: 'Admin' },
] as const;

export default function DashboardAdmin() {
  const { auth } = useAuth();
  const isAdmin = auth.status === 'authed' && auth.user.role === 'admin';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.users();
      setUsers(data);
    } catch (error) {
      toast.error((error as Error).message || 'Gebruikers laden mislukt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void loadUsers();
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, role: AdminUser['role']) => {
    try {
      await adminApi.updateRole(userId, role);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user)),
      );
      toast.success('Rol bijgewerkt.');
    } catch (error) {
      toast.error((error as Error).message || 'Rol bijwerken mislukt.');
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.toggleStatus(userId, isActive);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: isActive } : user,
        ),
      );
      toast.success(
        isActive ? 'Gebruiker geactiveerd.' : 'Gebruiker gedeactiveerd.',
      );
    } catch (error) {
      toast.error((error as Error).message || 'Status bijwerken mislukt.');
    }
  };

  if (auth.status === 'authed' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Beheer gebruikersrollen en accountstatus.
        </p>
      </div>
      <Separator className="my-6" />

      <Card className="bg-[#1b2441] border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Gebruikers</CardTitle>
            {isAdmin ? (
              <div className="w-full md:max-w-sm">
                <Input
                  placeholder="Zoek op naam of e-mail"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="bg-background/10 border-border/60"
                />
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAdmin ? (
            <div className="text-sm text-muted-foreground">
              Je hebt geen toegang tot deze pagina.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(
                              user.id,
                              value as AdminUser['role'],
                            )
                          }
                        >
                          <SelectTrigger className="bg-background/10 border-border/60">
                            <SelectValue placeholder="Kies rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            user.is_active
                              ? 'text-green-400 text-xs font-semibold'
                              : 'text-red-400 text-xs font-semibold'
                          }
                        >
                          {user.is_active ? 'Actief' : 'Geblokkeerd'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="outline"
                              className="main-button-nb"
                              size="sm"
                            >
                              {user.is_active ? 'Blokkeer' : 'Activeer'}
                            </Button>
                          }
                          title="Weet je het zeker?"
                          description={
                            user.is_active
                              ? 'Deze gebruiker wordt geblokkeerd.'
                              : 'Deze gebruiker wordt geactiveerd.'
                          }
                          confirmLabel="Bevestigen"
                          onConfirm={() =>
                            handleToggleStatus(user.id, !user.is_active)
                          }
                          variant={user.is_active ? 'destructive' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-xs text-muted-foreground">
                {loading
                  ? 'Gebruikers laden...'
                  : `${filteredUsers.length} gebruikers`}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
