import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return (
      <div className="dashboard-layout min-h-svh">
        <aside className="hidden md:flex w-64 flex-col bg-[#1b2441] text-sidebar-foreground border-r">
          <div className="px-4 py-5">
            <Skeleton className="h-5 w-28 bg-white/10" />
          </div>
          <div className="px-4 space-y-3">
            <Skeleton className="h-4 w-20 bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md bg-white/10" />
              <Skeleton className="h-10 w-full rounded-md bg-white/10" />
              <Skeleton className="h-10 w-full rounded-md bg-white/10" />
            </div>
          </div>
          <div className="mt-6 px-4 space-y-3">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-10 w-full rounded-md bg-white/10" />
          </div>
        </aside>
        <main className="flex min-h-svh flex-1 flex-col bg-[var(--background-color-3)]">
          <header className="flex h-14 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-md bg-white/10 md:hidden" />
              <Skeleton className="h-4 w-40 bg-white/10" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md bg-white/10" />
          </header>
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="h-6 w-56 bg-white/10" />
            <Skeleton className="h-4 w-72 bg-white/10" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32 rounded-lg bg-white/10" />
              <Skeleton className="h-32 rounded-lg bg-white/10" />
              <Skeleton className="h-32 rounded-lg bg-white/10" />
            </div>
            <Skeleton className="h-48 rounded-lg bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  if (auth.status === 'unauthed') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
