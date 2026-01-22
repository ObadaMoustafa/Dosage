import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import QuickMedicineUse from "@/components/QuickMedicineUse";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Fragment, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

//^ 1. Sidebar Navigation Configuration
const sidebarPaths = [
  {
    text: 'Overzicht',
    icon: 'fas fa-home',
    path: '/dashboard'
  },
  {
    text: 'Medicijnen',
    icon: 'fas fa-pills',
    path: '/medicines'
  },
  {
    text: 'Schema\'s',
    icon: 'fas fa-calendar-check',
    path: '/schedules'
  },
  {
    text: 'Historie',
    icon: 'fas fa-history',
    path: '/history'
  }
];

//^ 2. User Dropdown Menu Configuration (Add your profile links here)
const userMenuPaths = [
  {
    text: 'Profiel',
    icon: 'fas fa-user',
    path: '/dashboard/settings'
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

  const breadcrumbItems = (() => {
    const base = { label: "Dashboard", href: "/dashboard" };
    if (location.pathname === "/dashboard") {
      return [{ ...base, current: true }];
    }
    if (location.pathname.startsWith("/medicines")) {
      return [
        { ...base },
        { label: "Medicijnen", href: "/medicines", current: true },
      ];
    }
    if (location.pathname.startsWith("/schedules")) {
      return [
        { ...base },
        { label: "Schema's", href: "/schedules", current: true },
      ];
    }
    if (location.pathname.startsWith("/history")) {
      return [
        { ...base },
        { label: "Historie", href: "/history", current: true },
      ];
    }
    if (location.pathname.startsWith("/dashboard/settings")) {
      return [
        { ...base },
        { label: "Instellingen", href: "/dashboard/settings", current: true },
      ];
    }
    return [{ ...base, current: true }];
  })();

  return (
    <SidebarProvider className="dashboard-layout min-h-svh">
      <Sidebar
        collapsible={isMobile ? 'offcanvas' : 'none'}
        variant="sidebar"
        className="sticky top-0 h-svh border-r bg-[#1b2441] text-sidebar-foreground"
      >
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 mt-4">
            <img
              src="/turfje-logo-white.png"
              alt="Turfje logo"
              className="h-6 w-auto"
            />

          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigatie</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Rendering Sidebar Items Automatically */}
                {sidebarPaths.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <MobileAwareNavLink to={item.path} isActive={path === item.path}>
                      <span className={item.icon} aria-hidden="true" />
                      {item.text}
                    </MobileAwareNavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Instellingen</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                    <SidebarMenuItem>
                      <MobileAwareNavLink to='/dashboard/settings' isActive={path === '/dashboard/settings'}>
                        <span className='fas fa-cog' aria-hidden="true" />
                        Instellingen
                      </MobileAwareNavLink>
                    </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-12 items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback>{initials || 'TU'}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col text-left">
                      <span className="truncate text-sm font-medium">
                        {`${user.first_name} ${user.last_name}`.trim()}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="right"
                  sideOffset={12}
                  className="sidebar-dropdown w-48"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        Gebruikersmenu
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />

                  {userMenuPaths.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      className="cursor-pointer"
                      onClick={() => navigate(item.path)}
                    >
                      <span className={item.icon} aria-hidden="true" />
                      {item.text}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout} >
                    <span className='fas fa-person-running' aria-hidden="true" />
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="dashboard-inset min-h-svh flex flex-col bg-background">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-6 backdrop-blur shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <Fragment key={item.href}>
                    <BreadcrumbItem>
                      {item.current ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <NavLink to={item.href}>{item.label}</NavLink>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <QuickMedicineUse />
        </header>

        <main className="dashboard-main flex flex-1 flex-col gap-6 p-6">
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
