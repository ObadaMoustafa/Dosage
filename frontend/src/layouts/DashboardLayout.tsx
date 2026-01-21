import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState<boolean>(true);
  const [path, setPath] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    setPath(location.pathname);
  }, [location]);

  const user =
    auth.status === 'authed'
      ? auth.user
      : { first_name: 'User', last_name: '', email: '', avatar_url: null };

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`
    .toUpperCase()
    .trim();

  const toggleSidebar = (): void => {
    setOpenSidebar(!openSidebar);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider
      open={openSidebar}
      className="dashboard-layout"
      style={{ ['--sidebar-width' as never]: '14rem' }}
    >
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="dashboard-brand">
            <img
              src="/turfje-logo-white.png"
              alt="Turfje logo"
              className="logo"
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={path === '/dashboard'}>
                    <NavLink to="/dashboard" onClick={() => toggleSidebar()}>
                      Overview
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={path === '/dashboard/settings'}
                  >
                    <NavLink
                      to={'/dashboard/settings'}
                      onClick={() => toggleSidebar()}
                    >
                      Settings
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="dashboard-inset">
        <header className="dashboard-header">
          <div className="dashboard-header-title">
            <SidebarTrigger
              className="dashboard-trigger"
              onClick={toggleSidebar}
            />
            Dashboard
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="dashboard-user-trigger">
                <Avatar className="dashboard-avatar">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{initials || 'TU'}</AvatarFallback>
                </Avatar>
                <div className="dashboard-user-text">
                  <span>{`${user.first_name} ${user.last_name}`.trim()}</span>
                  <span>{user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dashboard-menu">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
