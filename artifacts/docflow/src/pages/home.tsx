import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen, Check, FileDown, FilePlus2, FileText, LoaderCircle, Plus, RefreshCw, Search, Sparkles, Users, X } from 'lucide-react';
import {
  getGetDashboardQueryKey,
  getListDocumentsQueryKey,
  useCreateDocument,
  useGetDashboard,
  useImportDocument,
  useListDocuments,
} from '@workspace/api-client-react';
import { Avatar, useWorkspace } from '@/components/workspace-shell';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const hours = Math.round((now.getTime() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function wordLabel(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? 'word' : 'words'}`;
}

function SkeletonRow() {
  return <div className="flex items-center gap-4 border-b border-[hsl(var(--border)/.7)] px-5 py-4"><div className="docflow-skeleton h-10 w-10 rounded-xl bg-[hsl(var(--muted))]" /><div className="flex-1 space-y-2"><div className="docflow-skeleton h-3 w-1/3 rounded bg-[hsl(var(--muted))]" /><div className="docflow-skeleton h-2.5 w-2/3 rounded bg-[hsl(var(--muted))]" /></div><div className="docflow-skeleton hidden h-3 w-16 rounded bg-[hsl(var(--muted))] sm:block" /></div>;
}

function DocumentRow({ document }: { document: { id: string; title: string; ownerId: string; ownerName: string; updatedAt: string; wordCount: number; access: string; preview: string } }) {
  const shared = document.access === 'shared';
  return (
    <Link href={`/document/${document.id}`} data-testid={`link-document-${document.id}`} className="group flex items-center gap-3 border-b border-[hsl(var(--border)/.72)] px-5 py-4 transition hover:bg-[hsl(var(--accent)/.08)] sm:gap-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${shared ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.22)] text-[hsl(var(--foreground))]'}`}><FileText className="h-[18px] w-[18px]" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><h3 data-testid={`text-document-title-${document.id}`} className="truncate text-sm font-bold tracking-[-.015em]">{document.title}</h3>{shared && <span className="shrink-0 rounded-full bg-[hsl(var(--primary)/.1)] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary))]">Shared</span>}</div>
        <p data-testid={`text-document-preview-${document.id}`} className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{document.preview || 'No words yet — a blank page with possibility.'}</p>
      </div>
      <div className="hidden w-24 shrink-0 text-right sm:block"><p className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(document.updatedAt)}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground)/.75)]">{wordLabel(document.wordCount)}</p></div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground)/.45)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
    </Link>
  );
}

function Modal({ children, onClose, title, testId }: { children: ReactNode; onClose: () => void; title: string; testId: string }) {
  return <div data-testid={testId} className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground)/.3)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><div className="docflow-rise max-h-[90dvh] w-full overflow-y-auto rounded-t-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl sm:max-w-[500px] sm:rounded-[24px] sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">In your workspace</p><h2 className="text-xl font-extrabold tracking-[-.04em]">{title}</h2></div><button type="button" data-testid="button-close-modal" onClick={onClose} className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

export default function Home() {
  const { currentUser, request } = useWorkspace();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const documentsQuery = useListDocuments({ request });
  const dashboardQuery = useGetDashboard({ request });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'import' | null>(null);
  const [title, setTitle] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importName, setImportName] = useState('');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createDocument = useCreateDocument({ request });
  const importDocument = useImportDocument({ request });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') setModal('create');
  }, []);

  const documents = documentsQuery.data ?? [];
  const filter = new URLSearchParams(location.split('?')[1] ?? '').get('filter');
  const filteredDocuments = useMemo(() => documents.filter((item) => {
    const matchesFilter = !filter || (filter === 'owned' ? item.access === 'owned' : item.access === 'shared');
    return matchesFilter && `${item.title} ${item.preview} ${item.ownerName}`.toLowerCase().includes(search.toLowerCase());
  }), [documents, filter, search]);
  const dashboard = dashboardQuery.data;

  const closeModal = () => { setModal(null); setTitle(''); setImportFile(null); setImportName(''); };
  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    createDocument.mutate({ data: { title: cleanTitle, content: '<h1>' + cleanTitle + '</h1><p>Start with the thought that is asking for your attention.</p>' } }, {
      onSuccess: (document) => { queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); setLocation(`/document/${document.id}`); },
    });
  };
  const handleImport = async (event: FormEvent) => {
    event.preventDefault();
    if (!importFile) return;
    const content = await importFile.text();
    importDocument.mutate({ data: { filename: importName.trim() || importFile.name, content } }, {
      onSuccess: (document) => { queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); setLocation(`/document/${document.id}`); },
    });
  };
  const handleRefresh = () => {
    setNotice('Workspace refreshed');
    documentsQuery.refetch();
    dashboardQuery.refetch();
    window.setTimeout(() => setNotice(''), 2400);
  };

  const isLoading = documentsQuery.isLoading || dashboardQuery.isLoading;
  const hasError = documentsQuery.isError || dashboardQuery.isError;

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-6 sm:px-8 md:px-10 md:pt-10 lg:px-14">
      <header className="mb-10 flex items-start justify-between gap-5 md:mb-14">
        <div className="docflow-rise">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Your workspace</p>
          <h1 data-testid="text-welcome-heading" className="max-w-[650px] text-[clamp(2rem,5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-.065em]">Make room for<br /><span className="text-[hsl(var(--primary))]">good work.</span></h1>
          <p className="mt-4 max-w-[470px] text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">A clear place for the ideas, decisions, and documents your team is carrying forward.</p>
        </div>
        <div className="hidden items-center gap-3 sm:flex"><button type="button" data-testid="button-refresh-workspace" onClick={handleRefresh} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary)/.4)] hover:text-[hsl(var(--primary))]"><RefreshCw className={`h-4 w-4 ${isLoading ? 'docflow-spinner' : ''}`} /></button><Avatar user={currentUser} /></div>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="docflow-rise docflow-delay-1 rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-[0_12px_30px_hsl(var(--primary)/.13)] sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] opacity-65">Your documents</p><p data-testid="text-owned-count" className="mt-5 text-4xl font-extrabold tracking-[-.06em]">{dashboard?.ownedCount ?? '—'}</p><p className="mt-1 text-xs opacity-70">owned by you</p></div>
        <div className="docflow-rise docflow-delay-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6"><div className="flex items-start justify-between"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">In the circle</p><Users className="h-4 w-4 text-[hsl(var(--accent-foreground))]" /></div><p data-testid="text-shared-count" className="mt-5 text-4xl font-extrabold tracking-[-.06em]">{dashboard?.sharedCount ?? '—'}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">shared with you</p></div>
        <div className="docflow-rise docflow-delay-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6"><div className="flex items-start justify-between"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Words in motion</p><BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" /></div><p data-testid="text-total-words" className="mt-5 text-4xl font-extrabold tracking-[-.06em]">{dashboard?.totalWords?.toLocaleString() ?? '—'}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">across your workspace</p></div>
      </section>

      <section className="mb-9 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div><p className="text-sm font-bold">Start something new</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">The best work often starts as a rough first line.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" data-testid="button-create-document" onClick={() => setModal('create')} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--foreground))] px-3.5 py-2.5 text-xs font-bold text-[hsl(var(--background))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--primary))]"><FilePlus2 className="h-4 w-4" /> Blank document</button><button type="button" data-testid="button-import-document" onClick={() => setModal('import')} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3.5 py-2.5 text-xs font-bold transition hover:border-[hsl(var(--primary)/.45)] hover:text-[hsl(var(--primary))]"><FileDown className="h-4 w-4" /> Import file</button></div>
      </section>

      <section className="docflow-rise docflow-delay-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Your library</p><h2 className="text-2xl font-extrabold tracking-[-.05em]">Documents</h2></div><label className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] focus-within:border-[hsl(var(--primary)/.5)]"><Search className="h-3.5 w-3.5" /><input data-testid="input-search-documents" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a document" className="w-full bg-transparent outline-none placeholder:text-[hsl(var(--muted-foreground)/.6)] sm:w-40" /></label></div>
        <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="hidden border-b border-[hsl(var(--border)/.72)] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))] sm:flex"><span className="pl-14">Document</span><span className="ml-auto pr-10">Last edited</span></div>
          {isLoading ? <><SkeletonRow /><SkeletonRow /><SkeletonRow /></> : hasError ? <div data-testid="state-documents-error" className="flex flex-col items-center px-6 py-16 text-center"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]"><RefreshCw className="h-5 w-5" /></div><h3 className="font-bold">Your library is taking a pause</h3><p className="mt-1 max-w-xs text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">We couldn't reach the workspace right now. Give it another try.</p><button type="button" data-testid="button-retry-documents" onClick={handleRefresh} className="mt-5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))]">Try again</button></div> : filteredDocuments.length ? filteredDocuments.map((document) => <DocumentRow key={document.id} document={document} />) : <div data-testid="state-documents-empty" className="flex flex-col items-center px-6 py-16 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-[18px] bg-[hsl(var(--accent)/.28)] text-[hsl(var(--foreground))]"><Sparkles className="h-6 w-6" /></div><h3 className="font-bold">{search ? 'Nothing matches that search' : filter === 'owned' ? 'Nothing owned yet' : filter === 'shared' ? 'No shared documents yet' : 'A fresh page is waiting'}</h3><p className="mt-1 max-w-xs text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{search ? 'Try a different title, owner, or phrase.' : filter ? 'When something lands here, you’ll find it waiting.' : 'Create a document for a decision, a draft, or the thought you do not want to lose.'}</p>{!search && !filter && <button type="button" data-testid="button-empty-create" onClick={() => setModal('create')} className="mt-5 flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))]"><Plus className="h-3.5 w-3.5" /> Create your first document</button>}</div>}
        </div>
      </section>

      {notice && <div data-testid="status-workspace-refresh" className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-xl bg-[hsl(var(--foreground))] px-4 py-3 text-xs font-bold text-[hsl(var(--background))] shadow-xl"><Check className="h-4 w-4 text-[hsl(var(--accent))]" />{notice}</div>}

      {modal === 'create' && <Modal testId="dialog-create-document" title="Start with a blank page" onClose={closeModal}><form onSubmit={handleCreate}><label className="text-xs font-bold">Document name<input autoFocus data-testid="input-document-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Q3 planning notes" className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" /></label><p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">You can rename it anytime from inside the document.</p><button type="submit" data-testid="button-submit-create-document" disabled={!title.trim() || createDocument.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">{createDocument.isPending && <LoaderCircle className="docflow-spinner h-4 w-4" />}Create document</button>{createDocument.isError && <p data-testid="status-create-error" className="mt-3 text-center text-xs text-[hsl(var(--destructive))]">Could not create this document. Please try again.</p>}</form></Modal>}
      {modal === 'import' && <Modal testId="dialog-import-document" title="Bring in a file" onClose={closeModal}><form onSubmit={handleImport}><button type="button" data-testid="button-select-import-file" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.05)] px-5 py-10 text-center transition hover:bg-[hsl(var(--primary)/.1)]"><FileDown className="mb-3 h-6 w-6 text-[hsl(var(--primary))]" /><span className="text-sm font-bold">{importFile ? importFile.name : 'Choose a text or Markdown file'}</span><span className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">We’ll keep the words, and give them a home.</span></button><input ref={fileInputRef} data-testid="input-import-file" type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" className="hidden" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} /><label className="mt-5 block text-xs font-bold">Display name <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span><input data-testid="input-import-name" value={importName} onChange={(event) => setImportName(event.target.value)} placeholder={importFile?.name || 'Keep original filename'} className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></label><button type="submit" data-testid="button-submit-import-document" disabled={!importFile || importDocument.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">{importDocument.isPending && <LoaderCircle className="docflow-spinner h-4 w-4" />}Import document</button>{importDocument.isError && <p data-testid="status-import-error" className="mt-3 text-center text-xs text-[hsl(var(--destructive))]">That file could not be imported. Please try again.</p>}</form></Modal>}
    </div>
  );
}