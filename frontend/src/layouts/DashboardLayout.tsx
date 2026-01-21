import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

//^ Add here any new panels to be shown in the sidebar
const paths = [
  {
    text: 'Overview',
    path: '/dashboard',
  },
  {
    text: 'Settings',
    path: '/dashboard/settings',
  },
];

export default function DashboardLayout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [path, setPath] = useState<string>('');
  const location = useLocation();
  const isMobile = useIsMobile();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider className="dashboard-layout min-h-svh">
      <Sidebar
        collapsible={isMobile ? 'offcanvas' : 'none'}
        variant="sidebar"
        className="sticky top-0 h-svh border-r"
      >
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <img
              src="/turfje-logo-white.png"
              alt="Turfje logo"
              className="h-8 w-auto"
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {paths.map((e, i) => (
                  <SidebarMenuItem key={i}>
                    <MobileAwareNavLink to={e.path} isActive={path === e.path}>
                      {e.text}
                    </MobileAwareNavLink>
                  </SidebarMenuItem>
                ))}
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

      <SidebarInset className="dashboard-inset min-h-svh flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <span className="font-semibold">Dashboard</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-accent/50"
              >
                <span className="hidden md:inline-block text-sm font-medium">
                  Welcome, {user.first_name}
                </span>

                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{initials || 'TU'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {`${user.first_name} ${user.last_name}`.trim()}
                  </p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileAwareNavLink({
  to,
  children,
  isActive,
}: {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={typeof children === 'string' ? children : undefined}
    >
      <NavLink
        to={to}
        onClick={() => {
          if (isMobile) setOpenMobile(false);
        }}
      >
        {children}
      </NavLink>
    </SidebarMenuButton>
  );
}
