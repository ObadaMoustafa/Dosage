type BreadcrumbItem = {
  label: string;
  href: string;
  current?: boolean;
};

type NavItem = {
  text: string;
  icon: string;
  path: string;
};

export const sidebarPaths: NavItem[] = [
  {
    text: 'Overzicht',
    icon: 'fas fa-home',
    path: '/dashboard',
  },
  {
    text: 'Medicijnen',
    icon: 'fas fa-pills',
    path: '/medicines',
  },
  {
    text: "Schema's",
    icon: 'fas fa-calendar-check',
    path: '/schedules',
  },
  {
    text: 'Historie',
    icon: 'fas fa-history',
    path: '/history',
  },
];

export const settingsPaths: NavItem[] = [
  {
    text: 'Voorraad',
    icon: 'fas fa-boxes',
    path: '/dashboard/inventory',
  },
  {
    text: 'Koppelingen',
    icon: 'fas fa-link',
    path: '/dashboard/koppelingen',
  },
  {
    text: 'Admin',
    icon: 'fas fa-user-shield',
    path: '/dashboard/admin',
  },
  {
    text: 'Instellingen',
    icon: 'fas fa-cog',
    path: '/dashboard/settings',
  },
];

export const userMenuPaths: NavItem[] = [
  {
    text: 'Profiel',
    icon: 'fas fa-user',
    path: '/dashboard/settings',
  },
];

const breadcrumbRoutes = [
  { path: '/medicines', label: 'Medicijnen' },
  { path: '/schedules', label: "Schema's" },
  { path: '/history', label: 'Historie' },
  { path: '/dashboard/settings', label: 'Instellingen' },
  { path: '/dashboard/inventory', label: 'Voorraad' },
  { path: '/dashboard/koppelingen', label: 'Koppelingen' },
  { path: '/dashboard/admin', label: 'Admin' },
];

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const base = { label: 'Dashboard', href: '/dashboard' };
  if (pathname === base.href) {
    return [{ ...base, current: true }];
  }
  const match = breadcrumbRoutes.find((route) =>
    pathname.startsWith(route.path),
  );
  if (match) {
    return [
      { ...base },
      { label: match.label, href: match.path, current: true },
    ];
  }
  return [{ ...base, current: true }];
}
