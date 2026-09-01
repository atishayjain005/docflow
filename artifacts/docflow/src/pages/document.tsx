import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bold, Check, ChevronDown, Clipboard, Clock3, Code2, Italic, Link2, List, ListOrdered, LoaderCircle, MoreHorizontal, Plus, Redo2, Share2, Strikethrough, Underline, Undo2, Users, X } from 'lucide-react';
import {
  getGetDashboardQueryKey,
  getGetDocumentQueryKey,
  getListDocumentsQueryKey,
  useGetDocument,
  useListUsers,
  useShareDocument,
  useUpdateDocument,
} from '@workspace/api-client-react';
import { Avatar, useWorkspace } from '@/components/workspace-shell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function formatEdited(value?: string) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return `Edited ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)}`;
}

function EditorSkeleton() {
  return <div className="mx-auto max-w-[760px] px-6 pb-24 pt-24"><div className="docflow-skeleton h-12 w-3/4 rounded bg-[hsl(var(--muted))]" /><div className="mt-5 space-y-3"><div className="docflow-skeleton h-3 w-full rounded bg-[hsl(var(--muted))]" /><div className="docflow-skeleton h-3 w-5/6 rounded bg-[hsl(var(--muted))]" /><div className="docflow-skeleton h-3 w-2/3 rounded bg-[hsl(var(--muted))]" /></div></div>;
}

type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  heading: boolean;
  code: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  link: boolean;
};

const emptyToolbarState: ToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  heading: false,
  code: false,
  unorderedList: false,
  orderedList: false,
  link: false,
};

function ToolbarButton({ label, icon: Icon, onClick, active = false, testId }: { label: string; icon: typeof Bold; onClick: () => void; active?: boolean; testId: string }) {
  return <button type="button" data-testid={testId} aria-label={label} aria-pressed={active} title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`grid h-8 w-8 cursor-pointer place-items-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)] active:scale-95 ${active ? 'bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}><Icon className="h-[15px] w-[15px]" /></button>;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentUser, request } = useWorkspace();
  const queryClient = useQueryClient();
  const documentQuery = useGetDocument(id ?? '', {
    request,
    query: { queryKey: [...getGetDocumentQueryKey(id ?? ''), currentUser.id] },
  });
  const usersQuery = useListUsers({ request });
  const updateDocument = useUpdateDocument({ request });
  const shareDocument = useShareDocument({ request });
  const document = documentQuery.data;
  const [title, setTitle] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [toolbarState, setToolbarState] = useState<ToolbarState>(emptyToolbarState);
  const [savedMessage, setSavedMessage] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const initializedFor = useRef<string | null>(null);
  const savedSnapshot = useRef({ title: '', content: '' });

  const getEditorContent = useCallback(() => contentRef.current?.innerHTML ?? '', []);

  const syncDirtyState = useCallback((nextTitle = title) => {
    const hasChanges = nextTitle.trim() !== savedSnapshot.current.title || getEditorContent() !== savedSnapshot.current.content;
    setSaveState((state) => {
      if (state === 'saving') return state;
      return hasChanges ? 'dirty' : 'saved';
    });
    if (!hasChanges) setSavedMessage('');
  }, [getEditorContent, title]);

  const refreshToolbarState = useCallback(() => {
    const editor = contentRef.current;
    const selection = globalThis.document.getSelection();
    const selectionInsideEditor = Boolean(selection?.anchorNode && editor?.contains(selection.anchorNode));
    if (!selectionInsideEditor) {
      setToolbarState(emptyToolbarState);
      return;
    }

    const queryState = (commandName: string) => {
      try {
        return globalThis.document.queryCommandState(commandName);
      } catch {
        return false;
      }
    };
    const queryValue = (commandName: string) => {
      try {
        return String(globalThis.document.queryCommandValue(commandName)).toLowerCase();
      } catch {
        return '';
      }
    };

    const block = queryValue('formatBlock');
    setToolbarState({
      bold: queryState('bold'),
      italic: queryState('italic'),
      underline: queryState('underline'),
      strike: queryState('strikeThrough'),
      heading: block === 'h2' || block.includes('heading 2'),
      code: block === 'pre' || block.includes('pre'),
      unorderedList: queryState('insertUnorderedList'),
      orderedList: queryState('insertOrderedList'),
      link: queryState('createLink'),
    });
  }, []);

  useEffect(() => {
    const editorKey = document ? `${currentUser.id}:${document.id}` : null;
    if (document && initializedFor.current !== editorKey) {
      initializedFor.current = editorKey;
      setTitle(document.title);
      const content = document.content || '<p></p>';
      savedSnapshot.current = { title: document.title, content };
      if (contentRef.current) contentRef.current.innerHTML = content;
      setSaveState('saved');
      setSavedMessage('');
      setToolbarState(emptyToolbarState);
    }
  }, [currentUser.id, document]);

  useEffect(() => {
    const handleSelectionChange = () => refreshToolbarState();
    globalThis.document.addEventListener('selectionchange', handleSelectionChange);
    return () => globalThis.document.removeEventListener('selectionchange', handleSelectionChange);
  }, [refreshToolbarState]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShareOpen(false);
    };
    globalThis.document.addEventListener('keydown', handleKeyDown);
    return () => globalThis.document.removeEventListener('keydown', handleKeyDown);
  }, [shareOpen]);

  const save = (event?: FormEvent) => {
    event?.preventDefault();
    if (!document || !title.trim() || !contentRef.current) return;
    const nextTitle = title.trim();
    const nextContent = getEditorContent();
    if (nextTitle === savedSnapshot.current.title && nextContent === savedSnapshot.current.content) {
      setSaveState('saved');
      return;
    }
    setSaveState('saving');
    updateDocument.mutate({ id: document.id, data: { title: nextTitle, content: nextContent } }, {
      onSuccess: (updated) => {
        queryClient.setQueryData([...getGetDocumentQueryKey(document.id), currentUser.id], updated);
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        savedSnapshot.current = { title: updated.title, content: updated.content || '<p></p>' };
        setTitle(updated.title);
        if (contentRef.current) contentRef.current.innerHTML = savedSnapshot.current.content;
        setSaveState('saved');
        setSavedMessage('Saved just now');
        window.setTimeout(() => setSavedMessage(''), 2600);
      },
      onError: () => {
        setSaveState('error');
      },
    });
  };

  const command = (name: string, value?: string) => {
    const before = getEditorContent();
    contentRef.current?.focus();
    globalThis.document.execCommand(name, false, value);
    refreshToolbarState();
    if (getEditorContent() !== before) syncDirtyState();
  };

  const handleShare = (event: FormEvent) => {
    event.preventDefault();
    if (!document || !selectedUserId) return;
    shareDocument.mutate({ id: document.id, data: { userId: selectedUserId } }, {
      onSuccess: (updated) => {
        queryClient.setQueryData([...getGetDocumentQueryKey(document.id), currentUser.id], updated);
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setShareMessage('Access granted');
        setSelectedUserId('');
        window.setTimeout(() => setShareMessage(''), 2600);
      },
    });
  };

  if (documentQuery.isLoading) return <EditorSkeleton />;
  if (documentQuery.isError || !document) {
    return <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 text-center"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.3)]"><Code2 className="h-6 w-6" /></div><h1 className="text-2xl font-extrabold tracking-[-.05em]">This page is out of reach</h1><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">The document may have moved, or you may not have access to it yet.</p><Link href="/" data-testid="link-back-from-error" className="mt-6 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 active:scale-[0.98]">Back to workspace</Link></div>;
  }

  const isOwner = document.ownerId === currentUser.id;
  const sharedUsers = document.shares ?? [];
  const availableUsers = (usersQuery.data ?? []).filter((user) => user.id !== document.ownerId && !sharedUsers.some((share) => share.userId === user.id));
  const isDirty = saveState === 'dirty' || saveState === 'error';
  const canSave = isDirty && Boolean(title.trim());
  const saveStatus = saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Save failed. Try again.' : savedMessage || (isDirty ? 'Unsaved changes' : formatEdited(document.updatedAt));

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.9)] backdrop-blur-md">
        <div className="flex min-h-[70px] items-center gap-3 px-4 sm:px-7">
          <Link href="/" data-testid="link-back-workspace" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-95"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="hidden text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))] sm:inline">Editing</span><input data-testid="input-document-editor-title" aria-label="Document title" value={title} onChange={(event) => { setTitle(event.target.value); syncDirtyState(event.target.value); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); save(); } }} className="w-full max-w-[520px] truncate bg-transparent text-sm font-extrabold tracking-[-.025em] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.12)]" /></div>
            <p data-testid="text-document-save-status" className={`mt-0.5 flex items-center gap-1.5 text-[10px] ${saveState === 'error' ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}><Clock3 className="h-3 w-3" />{saveStatus}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isOwner && <button type="button" data-testid="button-open-share" onClick={() => setShareOpen(true)} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-2.5 py-2 text-xs font-bold transition hover:border-[hsl(var(--primary)/.5)] hover:text-[hsl(var(--primary))] active:scale-[0.98] sm:px-3"><Share2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Share</span></button>}
            <button type="button" data-testid="button-save-document" onClick={() => save()} disabled={!canSave} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">{saveState === 'saving' ? <LoaderCircle className="docflow-spinner h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{saveState === 'saving' ? 'Saving' : 'Save'}</span></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" data-testid="button-editor-more" aria-label="More document actions" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)] data-[state=open]:bg-[hsl(var(--muted))] data-[state=open]:text-[hsl(var(--foreground))] active:scale-95"><MoreHorizontal className="h-4 w-4" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Document actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { void navigator.clipboard.writeText(window.location.href).then(() => setSavedMessage('Link copied')).catch(() => setSavedMessage('Could not copy link')); }}>
                  <Clipboard className="h-4 w-4" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!isOwner} onClick={() => setShareOpen(true)}>
                  <Share2 className="h-4 w-4" /> Share document
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Version history</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:px-7">
          <ToolbarButton testId="button-format-bold" label="Bold" icon={Bold} active={toolbarState.bold} onClick={() => command('bold')} />
          <ToolbarButton testId="button-format-italic" label="Italic" icon={Italic} active={toolbarState.italic} onClick={() => command('italic')} />
          <ToolbarButton testId="button-format-underline" label="Underline" icon={Underline} active={toolbarState.underline} onClick={() => command('underline')} />
          <ToolbarButton testId="button-format-strike" label="Strikethrough" icon={Strikethrough} active={toolbarState.strike} onClick={() => command('strikeThrough')} />
          <span className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />
          <button type="button" data-testid="button-format-heading" aria-pressed={toolbarState.heading} onMouseDown={(event) => event.preventDefault()} onClick={() => command('formatBlock', 'h2')} className={`flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/.25)] active:scale-95 ${toolbarState.heading ? 'bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}>Heading <ChevronDown className="h-3 w-3" /></button>
          <ToolbarButton testId="button-format-code" label="Code style" icon={Code2} active={toolbarState.code} onClick={() => command('formatBlock', 'pre')} />
          <ToolbarButton testId="button-format-bulleted-list" label="Bulleted list" icon={List} active={toolbarState.unorderedList} onClick={() => command('insertUnorderedList')} />
          <ToolbarButton testId="button-format-numbered-list" label="Numbered list" icon={ListOrdered} active={toolbarState.orderedList} onClick={() => command('insertOrderedList')} />
          <ToolbarButton testId="button-insert-link" label="Add link" icon={Link2} active={toolbarState.link} onClick={() => { const url = window.prompt('Paste a link'); if (url) command('createLink', url); }} />
          <span className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />
          <ToolbarButton testId="button-editor-undo" label="Undo" icon={Undo2} onClick={() => command('undo')} />
          <ToolbarButton testId="button-editor-redo" label="Redo" icon={Redo2} onClick={() => command('redo')} />
          <span className="ml-auto hidden items-center gap-2 pr-1 text-[10px] text-[hsl(var(--muted-foreground))] sm:flex"><span className="font-mono">{document.wordCount.toLocaleString()} words</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" />Private to your circle</span>
        </div>
      </header>

      <main className="mx-auto max-w-[840px] px-5 pb-32 pt-12 sm:px-12 sm:pt-16">
        <article className="docflow-rise rounded-[22px] border border-[hsl(var(--border)/.72)] bg-[hsl(var(--card))] px-6 py-9 shadow-[0_18px_60px_hsl(var(--foreground)/.035)] sm:px-16 sm:py-14">
          <div ref={contentRef} data-testid="editor-document-content" contentEditable suppressContentEditableWarning onInput={() => { syncDirtyState(); refreshToolbarState(); }} onKeyUp={refreshToolbarState} onMouseUp={refreshToolbarState} data-placeholder="Begin writing…" className="editor-surface min-h-[55vh] rounded-lg text-[15px] leading-[1.85] text-[hsl(var(--foreground)/.82)] transition focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" />
          {updateDocument.isError && <p data-testid="status-save-error" className="mt-5 rounded-lg bg-[hsl(var(--destructive)/.08)] px-3 py-2.5 text-xs font-semibold text-[hsl(var(--destructive))]">Could not save your changes. Check your connection and try again.</p>}
        </article>
        <div className="mt-6 flex items-center justify-between px-1 text-[10px] text-[hsl(var(--muted-foreground))]"><span>Created {new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(document.createdAt))}</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />Only people with access can open this</span></div>
      </main>

      {shareOpen && <div data-testid="dialog-share-document" onPointerDown={(event) => { if (event.target === event.currentTarget) setShareOpen(false); }} className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground)/.3)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><div className="docflow-rise w-full rounded-t-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl sm:max-w-[500px] sm:rounded-[24px] sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Bring someone in</p><h2 className="text-xl font-extrabold tracking-[-.04em]">Share this document</h2></div><button type="button" data-testid="button-close-share" onClick={() => setShareOpen(false)} className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] active:scale-95"><X className="h-5 w-5" /></button></div><form onSubmit={handleShare}><label className="text-xs font-bold">Choose a teammate<select data-testid="select-share-user" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="mt-2 w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none transition hover:border-[hsl(var(--primary)/.45)] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]"><option value="">Select someone…</option>{availableUsers.map((user) => <option value={user.id} key={user.id}>{user.name} - {user.email}</option>)}</select></label><div className="mt-5 rounded-xl bg-[hsl(var(--muted)/.65)] p-3.5"><div className="flex items-center gap-3"><Users className="h-4 w-4 text-[hsl(var(--primary))]" /><p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">They’ll be able to open and edit this document from their workspace.</p></div></div><button type="submit" data-testid="button-submit-share" disabled={!selectedUserId || shareDocument.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45">{shareDocument.isPending ? <LoaderCircle className="docflow-spinner h-4 w-4" /> : <Plus className="h-4 w-4" />}Give access</button>{shareMessage && <p data-testid="status-share-success" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><Check className="h-3.5 w-3.5" />{shareMessage}</p>}{shareDocument.isError && <p data-testid="status-share-error" className="mt-3 text-center text-xs text-[hsl(var(--destructive))]">Could not share this document. Please try again.</p>}</form><div className="mt-7 border-t border-[hsl(var(--border))] pt-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Already in the circle</p>{sharedUsers.length ? <div className="space-y-2">{sharedUsers.map((share) => <div key={share.userId} data-testid={`row-shared-user-${share.userId}`} className="flex items-center gap-2.5"><Avatar user={share} small /><div><p className="text-xs font-bold">{share.userName}</p><p className="text-[10px] text-[hsl(var(--muted-foreground))]">{share.userEmail}</p></div></div>)}</div> : <p className="text-xs text-[hsl(var(--muted-foreground))]">No one else has access yet.</p>}</div></div></div>}
    </div>
  );
}