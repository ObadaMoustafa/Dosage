import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileForm = {
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

export default function DashboardSettings() {
  const { auth, refreshAuth } = useAuth();
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    avatarUrl: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (auth.status !== "authed") return;
    setProfile({
      firstName: auth.user.first_name ?? "",
      lastName: auth.user.last_name ?? "",
      avatarUrl: auth.user.avatar_url ?? "",
    });
  }, [auth]);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast("Je bent niet ingelogd.");
      return;
    }

    if (!profile.firstName || !profile.lastName) {
      toast("Voornaam en achternaam zijn verplicht.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profile.firstName,
          last_name: profile.lastName,
          avatar_url: profile.avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast(data?.error ?? "Opslaan mislukt");
        return;
      }

      await refreshAuth();
      toast("Profiel bijgewerkt");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast("Je bent niet ingelogd.");
      return;
    }

    if (!passwords.currentPassword || !passwords.newPassword) {
      toast("Vul je huidige en nieuwe wachtwoord in.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast("Nieuwe wachtwoorden komen niet overeen.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast(data?.error ?? "Wachtwoord wijzigen mislukt");
        return;
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast("Wachtwoord gewijzigd");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="dashboard-section">
      <div className="dashboard-heading">
        <h1>Settings</h1>
        <p>Werk je profiel en wachtwoord bij.</p>
      </div>

      <div className="settings-grid">
        <Card>
          <CardHeader>
            <CardTitle>Profiel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="settings-avatar-row">
              <Avatar className="settings-avatar">
                <AvatarImage src={profile.avatarUrl || undefined} />
                <AvatarFallback>
                  {`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="settings-avatar-name">
                  {`${profile.firstName} ${profile.lastName}`.trim() || "Jouw profiel"}
                </p>
                <p className="settings-avatar-subtitle">Preview van je avatar</p>
              </div>
            </div>
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <div className="settings-field">
                <Label>Voornaam</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Voornaam"
                />
              </div>
              <div className="settings-field">
                <Label>Achternaam</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Achternaam"
                />
              </div>
              <div className="settings-field">
                <Label>Avatar URL</Label>
                <Input
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <Button className="settings-submit" type="submit" disabled={savingProfile}>
                {savingProfile ? "Opslaan..." : "Opslaan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              <div className="settings-field">
                <Label>Huidig wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                />
              </div>
              <div className="settings-field">
                <Label>Nieuw wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                />
              </div>
              <div className="settings-field">
                <Label>Bevestig nieuw wachtwoord</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
              <Button className="settings-submit" type="submit" disabled={savingPassword}>
                {savingPassword ? "Opslaan..." : "Wachtwoord opslaan"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="settings-footer">
            <Separator />
            <p>Na het wijzigen blijf je ingelogd met je huidige token.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
