import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bold, Check, ChevronDown, Clock3, Code2, Italic, Link2, List, ListOrdered, LoaderCircle, MoreHorizontal, Plus, Redo2, Share2, Strikethrough, Underline, Undo2, Users, X } from 'lucide-react';
import {
  getGetDocumentQueryKey,
  getListDocumentsQueryKey,
  useGetDocument,
  useListUsers,
  useShareDocument,
  useUpdateDocument,
} from '@workspace/api-client-react';
import { Avatar, useWorkspace } from '@/components/workspace-shell';

function formatEdited(value?: string) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return `Edited ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)}`;
}

function EditorSkeleton() {
  return <div className="mx-auto max-w-[760px] px-6 pb-24 pt-24"><div className="docflow-skeleton h-12 w-3/4 rounded bg-[hsl(var(--muted))]" /><div className="mt-5 space-y-3"><div className="docflow-skeleton h-3 w-full rounded bg-[hsl(var(--muted))]" /><div className="docflow-skeleton h-3 w-5/6 rounded bg-[hsl(var(--muted))]" /><div className="docflow-skeleton h-3 w-2/3 rounded bg-[hsl(var(--muted))]" /></div></div>;
}

function ToolbarButton({ label, icon: Icon, onClick, active = false, testId }: { label: string; icon: typeof Bold; onClick: () => void; active?: boolean; testId: string }) {
  return <button type="button" data-testid={testId} aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-md transition ${active ? 'bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}><Icon className="h-[15px] w-[15px]" /></button>;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentUser, request } = useWorkspace();
  const queryClient = useQueryClient();
  const documentQuery = useGetDocument(id ?? '', { request, query: { queryKey: getGetDocumentQueryKey(id ?? '') } });
  const usersQuery = useListUsers({ request });
  const updateDocument = useUpdateDocument({ request });
  const shareDocument = useShareDocument({ request });
  const document = documentQuery.data;
  const [title, setTitle] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const initializedForId = useRef<string | null>(null);

  useEffect(() => {
    if (document && initializedForId.current !== document.id) {
      initializedForId.current = document.id;
      setTitle(document.title);
      if (contentRef.current) contentRef.current.innerHTML = document.content || '<p></p>';
      setDirty(false);
    }
  }, [document]);

  const save = (event?: FormEvent) => {
    event?.preventDefault();
    if (!document || !title.trim() || !contentRef.current) return;
    updateDocument.mutate({ id: document.id, data: { title: title.trim(), content: contentRef.current.innerHTML } }, {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetDocumentQueryKey(document.id), updated);
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        setDirty(false);
        setSavedMessage('Saved just now');
        window.setTimeout(() => setSavedMessage(''), 2600);
      },
    });
  };

  const command = (name: string, value?: string) => {
    contentRef.current?.focus();
    globalThis.document.execCommand(name, false, value);
    setDirty(true);
  };

  const handleShare = (event: FormEvent) => {
    event.preventDefault();
    if (!document || !selectedUserId) return;
    shareDocument.mutate({ id: document.id, data: { userId: selectedUserId } }, {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetDocumentQueryKey(document.id), updated);
        setShareMessage('Access granted');
        setSelectedUserId('');
        window.setTimeout(() => setShareMessage(''), 2600);
      },
    });
  };

  if (documentQuery.isLoading) return <EditorSkeleton />;
  if (documentQuery.isError || !document) {
    return <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 text-center"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.3)]"><Code2 className="h-6 w-6" /></div><h1 className="text-2xl font-extrabold tracking-[-.05em]">This page is out of reach</h1><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">The document may have moved, or you may not have access to it yet.</p><Link href="/" data-testid="link-back-from-error" className="mt-6 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))]">Back to workspace</Link></div>;
  }

  const isOwner = document.ownerId === currentUser.id;
  const sharedUsers = document.shares ?? [];
  const availableUsers = (usersQuery.data ?? []).filter((user) => user.id !== document.ownerId && !sharedUsers.some((share) => share.userId === user.id));

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.9)] backdrop-blur-md">
        <div className="flex min-h-[70px] items-center gap-3 px-4 sm:px-7">
          <Link href="/" data-testid="link-back-workspace" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="hidden text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))] sm:inline">Editing</span><input data-testid="input-document-editor-title" aria-label="Document title" value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); save(); } }} className="w-full max-w-[520px] truncate bg-transparent text-sm font-extrabold tracking-[-.025em] outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></div>
            <p data-testid="text-document-save-status" className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]"><Clock3 className="h-3 w-3" />{updateDocument.isPending ? 'Saving…' : savedMessage || (dirty ? 'Unsaved changes' : formatEdited(document.updatedAt))}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isOwner && <button type="button" data-testid="button-open-share" onClick={() => setShareOpen(true)} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-2.5 py-2 text-xs font-bold transition hover:border-[hsl(var(--primary)/.5)] hover:text-[hsl(var(--primary))] sm:px-3"><Share2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Share</span></button>}
            <button type="button" data-testid="button-save-document" onClick={() => save()} disabled={!dirty || updateDocument.isPending || !title.trim()} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">{updateDocument.isPending ? <LoaderCircle className="docflow-spinner h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{updateDocument.isPending ? 'Saving' : 'Save'}</span></button>
            <button type="button" data-testid="button-editor-more" onClick={() => setSavedMessage('All changes are stored in this document')} className="grid h-8 w-8 place-items-center rounded-lg text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:px-7">
          <ToolbarButton testId="button-format-bold" label="Bold" icon={Bold} onClick={() => command('bold')} />
          <ToolbarButton testId="button-format-italic" label="Italic" icon={Italic} onClick={() => command('italic')} />
          <ToolbarButton testId="button-format-underline" label="Underline" icon={Underline} onClick={() => command('underline')} />
          <ToolbarButton testId="button-format-strike" label="Strikethrough" icon={Strikethrough} onClick={() => command('strikeThrough')} />
          <span className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />
          <button type="button" data-testid="button-format-heading" onClick={() => command('formatBlock', 'h2')} className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">Heading <ChevronDown className="h-3 w-3" /></button>
          <ToolbarButton testId="button-format-code" label="Code style" icon={Code2} onClick={() => command('formatBlock', 'pre')} />
          <ToolbarButton testId="button-format-bulleted-list" label="Bulleted list" icon={List} onClick={() => command('insertUnorderedList')} />
          <ToolbarButton testId="button-format-numbered-list" label="Numbered list" icon={ListOrdered} onClick={() => command('insertOrderedList')} />
          <ToolbarButton testId="button-insert-link" label="Add link" icon={Link2} onClick={() => { const url = window.prompt('Paste a link'); if (url) command('createLink', url); }} />
          <span className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />
          <ToolbarButton testId="button-editor-undo" label="Undo" icon={Undo2} onClick={() => command('undo')} />
          <ToolbarButton testId="button-editor-redo" label="Redo" icon={Redo2} onClick={() => command('redo')} />
          <span className="ml-auto hidden items-center gap-2 pr-1 text-[10px] text-[hsl(var(--muted-foreground))] sm:flex"><span className="font-mono">{document.wordCount.toLocaleString()} words</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" />Private to your circle</span>
        </div>
      </header>

      <main className="mx-auto max-w-[840px] px-5 pb-32 pt-12 sm:px-12 sm:pt-16">
        <article className="docflow-rise rounded-[22px] border border-[hsl(var(--border)/.72)] bg-[hsl(var(--card))] px-6 py-9 shadow-[0_18px_60px_hsl(var(--foreground)/.035)] sm:px-16 sm:py-14">
          <div ref={contentRef} data-testid="editor-document-content" contentEditable suppressContentEditableWarning onInput={() => setDirty(true)} data-placeholder="Begin writing…" className="editor-surface min-h-[55vh] text-[15px] leading-[1.85] text-[hsl(var(--foreground)/.82)]" />
          {updateDocument.isError && <p data-testid="status-save-error" className="mt-5 rounded-lg bg-[hsl(var(--destructive)/.08)] px-3 py-2.5 text-xs font-semibold text-[hsl(var(--destructive))]">Could not save your changes. Check your connection and try again.</p>}
        </article>
        <div className="mt-6 flex items-center justify-between px-1 text-[10px] text-[hsl(var(--muted-foreground))]"><span>Created {new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(document.createdAt))}</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />Only people with access can open this</span></div>
      </main>

      {shareOpen && <div data-testid="dialog-share-document" className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground)/.3)] p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><div className="docflow-rise w-full rounded-t-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl sm:max-w-[500px] sm:rounded-[24px] sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Bring someone in</p><h2 className="text-xl font-extrabold tracking-[-.04em]">Share this document</h2></div><button type="button" data-testid="button-close-share" onClick={() => setShareOpen(false)} className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"><X className="h-5 w-5" /></button></div><form onSubmit={handleShare}><label className="text-xs font-bold">Choose a teammate<select data-testid="select-share-user" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="mt-2 w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]"><option value="">Select someone…</option>{availableUsers.map((user) => <option value={user.id} key={user.id}>{user.name} — {user.email}</option>)}</select></label><div className="mt-5 rounded-xl bg-[hsl(var(--muted)/.65)] p-3.5"><div className="flex items-center gap-3"><Users className="h-4 w-4 text-[hsl(var(--primary))]" /><p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">They’ll be able to open and edit this document from their workspace.</p></div></div><button type="submit" data-testid="button-submit-share" disabled={!selectedUserId || shareDocument.isPending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:cursor-not-allowed disabled:opacity-45">{shareDocument.isPending ? <LoaderCircle className="docflow-spinner h-4 w-4" /> : <Plus className="h-4 w-4" />}Give access</button>{shareMessage && <p data-testid="status-share-success" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><Check className="h-3.5 w-3.5" />{shareMessage}</p>}{shareDocument.isError && <p data-testid="status-share-error" className="mt-3 text-center text-xs text-[hsl(var(--destructive))]">Could not share this document. Please try again.</p>}</form><div className="mt-7 border-t border-[hsl(var(--border))] pt-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Already in the circle</p>{sharedUsers.length ? <div className="space-y-2">{sharedUsers.map((share) => <div key={share.userId} data-testid={`row-shared-user-${share.userId}`} className="flex items-center gap-2.5"><Avatar user={share} small /><div><p className="text-xs font-bold">{share.userName}</p><p className="text-[10px] text-[hsl(var(--muted-foreground))]">{share.userEmail}</p></div></div>)}</div> : <p className="text-xs text-[hsl(var(--muted-foreground))]">No one else has access yet.</p>}</div></div></div>}
    </div>
  );
}