import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FileText, FolderOpen, Home, Menu, Plus, Search, Sparkles, X } from 'lucide-react';
import {
  getGetDashboardQueryKey,
  getListDocumentsQueryKey,
  getListUsersQueryKey,
  useListUsers,
} from '@workspace/api-client-react';

type User = { id: string; name: string; email: string; initials: string; accent: string };

type WorkspaceContextValue = {
  currentUser: User;
  users: User[];
  request: { headers: { 'X-User-Id': string } };
  switchUser: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return value;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('docflow-user-id') ?? 'maya');
  const queryClient = useQueryClient();
  const request = useMemo(() => ({ headers: { 'X-User-Id': currentUserId } }), [currentUserId]);
  const usersQuery = useListUsers({
    request,
    query: { queryKey: [...getListUsersQueryKey(), currentUserId] },
  });
  const users = usersQuery.data ?? [];
  const fallback: User = { id: currentUserId, name: 'Workspace member', email: '', initials: 'WM', accent: '#d98a45' };
  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0] ?? fallback;

  useEffect(() => {
    if (users.length > 0 && !users.some((user) => user.id === currentUserId)) {
      setCurrentUserId(users[0].id);
    }
  }, [currentUserId, users]);

  useEffect(() => {
    localStorage.setItem('docflow-user-id', currentUserId);
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
  }, [currentUserId, queryClient]);

  const switchUser = (id: string) => {
    setCurrentUserId(id);
  };

  return <WorkspaceContext.Provider value={{ currentUser, users, request, switchUser }}>{children}</WorkspaceContext.Provider>;
}

function Avatar({ user, small = false }: { user: Pick<User, 'initials' | 'accent'>; small?: boolean }) {
  return (
    <span
      data-testid={`avatar-${user.initials}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-[hsl(var(--foreground))] ${small ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'}`}
      style={{ backgroundColor: `${user.accent}38`, border: `1px solid ${user.accent}80` }}
    >
      {user.initials}
    </span>
  );
}

export function UserSwitcher() {
  const { currentUser, users, switchUser } = useWorkspace();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="button-user-switcher"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] px-3 py-2.5 text-left transition hover:bg-[hsl(var(--sidebar-accent)/.8)] active:scale-[0.99]"
      >
        <Avatar user={currentUser} />
        <span className="min-w-0 flex-1">
          <span data-testid="text-current-user" className="block truncate text-sm font-semibold">{currentUser.name}</span>
          <span className="block truncate text-[11px] text-[hsl(var(--sidebar-foreground)/.58)]">Personal workspace</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div data-testid="menu-user-switcher" className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1.5 text-[hsl(var(--popover-foreground))] shadow-xl">
          <p className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Switch member</p>
          {users.map((user) => (
            <button
              type="button"
              data-testid={`button-switch-user-${user.id}`}
              key={user.id}
              onClick={() => { switchUser(user.id); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-[hsl(var(--muted))] active:scale-[0.99] ${user.id === currentUser.id ? 'bg-[hsl(var(--muted))] font-semibold text-[hsl(var(--primary))]' : ''}`}
            >
              <Avatar user={user} small />
              <span className="min-w-0"><span className="block truncate text-xs font-semibold">{user.name}</span><span className="block truncate text-[10px] text-[hsl(var(--muted-foreground))]">{user.email}</span></span>
            </button>
          ))}
          {!users.length && <p className="px-2.5 py-2 text-xs text-[hsl(var(--muted-foreground))]">Finding your team…</p>}
        </div>
      )}
    </div>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const navItems = [
    { href: '/', label: 'Workspace', icon: Home },
    { href: '/?filter=owned', label: 'My documents', icon: FileText },
    { href: '/?filter=shared', label: 'Shared with me', icon: FolderOpen },
  ];

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <button type="button" data-testid="button-mobile-menu" onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 shadow-sm transition hover:border-[hsl(var(--primary)/.4)] hover:text-[hsl(var(--primary))] active:scale-95 md:hidden"><Menu className="h-5 w-5" /></button>
      {mobileOpen && <button type="button" aria-label="Close navigation" data-testid="button-close-mobile-menu" onClick={closeMobile} className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.28)] md:hidden"><span className="sr-only">Close navigation</span></button>}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[hsl(var(--sidebar))] px-4 py-5 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-11 flex items-center justify-between px-2">
          <Link href="/" data-testid="link-brand" onClick={closeMobile} className="flex items-center gap-2.5 rounded-lg transition hover:text-[hsl(var(--accent))] active:scale-[0.99]">
            <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] shadow-[4px_4px_0_hsl(var(--primary)/.45)]"><Sparkles className="h-4 w-4" /></span>
            <span className="text-[17px] font-extrabold tracking-[-.04em]">DocFlow</span>
          </Link>
          <button type="button" data-testid="button-close-mobile-nav" onClick={closeMobile} className="rounded-md p-1.5 text-[hsl(var(--sidebar-foreground)/.6)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] active:scale-95 md:hidden"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-2">
          <Link href="/?new=1" data-testid="link-new-document" onClick={closeMobile} className="flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))] shadow-[0_5px_0_hsl(var(--primary)/.28)] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_hsl(var(--primary)/.28)] active:translate-y-0 active:shadow-[0_3px_0_hsl(var(--primary)/.28)]"><Plus className="h-4 w-4" /> New document</Link>
        </div>
        <nav className="mt-8 space-y-1" aria-label="Workspace navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.42)]">Your space</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = label === 'Workspace' ? location === '/' && !location.includes('filter') : location.includes(label === 'My documents' ? 'owned' : 'shared');
            return <Link key={label} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={closeMobile} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition active:scale-[0.99] ${active ? 'bg-[hsl(var(--sidebar-accent))] font-semibold text-[hsl(var(--sidebar-foreground))] shadow-[inset_3px_0_0_hsl(var(--accent))]' : 'text-[hsl(var(--sidebar-foreground)/.66)] hover:bg-[hsl(var(--sidebar-accent)/.65)] hover:text-[hsl(var(--sidebar-foreground))]'}`}><Icon className="h-[17px] w-[17px]" />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.7)] p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[hsl(var(--accent))]"><Search className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase tracking-[.14em]">A quiet place to think</span></div>
            <p className="text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.58)]">Documents that move with your team, without moving your attention.</p>
          </div>
          <UserSwitcher />
        </div>
      </aside>
      <main className="min-h-[100dvh] md:pl-[270px]">{children}</main>
    </div>
  );
}

export { Avatar };