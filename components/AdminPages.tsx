import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadFile, getPublicUrl } from '../lib/storage';
import { fetchAdminArticleById, fetchAdminArticles, fetchAdminArticleCounts, fetchLatestPublishedArticle, fetchAdminJournalists, fetchJournalistByEmail, inviteJournalist, fetchMedia, insertMediaRow, setArticleStatus, upsertArticle, updateArticle, fetchSiteSetting, upsertSiteSetting, fetchContactsCount, fetchJournalistsCount } from '../lib/admin';
import type { Article, ArticleStatus, Journalist, MediaRow } from '../lib/types';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (err) {
            setError(err.message ?? 'Sign in failed');
            return;
        }
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-4 relative overflow-hidden font-display">
            {/* Decor */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>

            <main className="w-full max-w-md bg-white rounded-xl shadow-2xl shadow-primary/10 border border-slate-100 relative z-10 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-light"></div>
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                            <span className="material-icons text-3xl">edit_note</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</h1>
                        <p className="text-slate-500 text-sm">Welcome back to ACJ EKSU Dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 material-icons text-lg">mail</span>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm" placeholder="admin@acjeksu.com" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 material-icons text-lg">lock</span>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer" />
                                <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 cursor-pointer">Remember me</label>
                            </div>
                            <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-primary/30 disabled:opacity-70">
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-icons text-xs">lock</span> Secure connection via SSL/TLS
                    </p>
                </div>
            </main>
            <footer className="mt-8 text-center relative z-10 text-xs text-slate-400">
                © 2024 ACJ EKSU. All rights reserved.
            </footer>
        </div>
    );
};

const JOURNALIST_ROLES = ['Editor in Chief', 'Editor', 'Contributor'] as const;

export const AdminDashboard = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [counts, setCounts] = useState<{ published: number; pending: number; draft: number } | null>(null);
    const [latestPublished, setLatestPublished] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [canPublish, setCanPublish] = useState(false);
    const [quickEditId, setQuickEditId] = useState<string | null>(null);
    useEffect(() => {
        Promise.all([
            fetchAdminArticles(20).then(setArticles).catch(() => setArticles([])),
            fetchAdminArticleCounts().then(setCounts).catch(() => setCounts(null)),
            fetchLatestPublishedArticle().then(setLatestPublished).catch(() => setLatestPublished(null)),
        ]).finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const email = session?.user?.email;
            if (!email) { setCanPublish(false); return; }
            fetchJournalistByEmail(email).then((j) => setCanPublish(!!(j?.role && (j.role === 'Editor in Chief' || j.role === 'Editor-in-Chief')))).catch(() => setCanPublish(false));
        });
    }, []);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Welcome back, here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm inline-flex items-center gap-1.5 flex-shrink-0">
                    <span className="material-icons text-sm">calendar_today</span> {dateStr}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Published</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{loading && counts === null ? '—' : (counts?.published ?? 0)}</h3>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                            <span className="material-icons-outlined text-lg sm:text-xl">article</span>
                        </div>
                    </div>
                </div>
                <div className={`bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${(counts?.pending ?? 0) > 0 ? 'border-l-4 border-l-yellow-500' : ''}`}>
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Pending</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{loading && counts === null ? '—' : (counts?.pending ?? 0)}</h3>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-lg text-yellow-600 flex-shrink-0">
                            <span className="material-icons-outlined text-lg sm:text-xl">rate_review</span>
                        </div>
                    </div>
                    {(counts?.pending ?? 0) > 0 && <span className="absolute top-3 right-3 sm:top-4 sm:right-4 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />}
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Latest published</p>
                            {loading && !latestPublished ? (
                                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1">—</p>
                            ) : latestPublished ? (
                                <Link to={`/admin/editor?id=${latestPublished.id}`} className="block mt-1 text-base sm:text-lg font-bold text-slate-800 truncate hover:text-primary transition-colors" title={latestPublished.title}>
                                    {latestPublished.title.length > 32 ? `${latestPublished.title.slice(0, 32)}…` : latestPublished.title}
                                </Link>
                            ) : (
                                <p className="text-base sm:text-lg font-bold text-slate-500 mt-1">No published yet</p>
                            )}
                        </div>
                        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg text-purple-600 flex-shrink-0">
                            <span className="material-icons-outlined text-lg sm:text-xl">star</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800">Recent Submissions</h3>
                        <p className="text-xs sm:text-sm text-slate-500">Manage the latest articles.</p>
                    </div>
                    <Link to="/admin/editor" className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors w-fit">View All</Link>
                </div>
                {/* Mobile: card list */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="py-8 text-center text-slate-500 text-sm">Loading…</div>
                    ) : articles.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm">No articles yet.</div>
                    ) : (
                        articles.slice(0, 10).map((row) => {
                            const authorName = (row.journalist as { name?: string } | null)?.name ?? '—';
                            return (
                                <div key={row.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-slate-200 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: row.featured_image_url ? `url(${row.featured_image_url})` : undefined }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-900 line-clamp-2 text-sm">{row.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{row.category} · {authorName}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                                row.status === 'published' ? 'bg-green-100 text-green-800' :
                                                row.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{row.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        <Link to={`/admin/editor?id=${row.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 font-medium text-xs">
                                            <span className="material-icons text-sm">edit</span> Full editor
                                        </Link>
                                        <button type="button" onClick={() => setQuickEditId(row.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs">
                                            <span className="material-icons text-sm">tune</span> Quick edit
                                        </button>
                                        {row.status === 'pending' && canPublish && (
                                            <button type="button" onClick={async () => { await setArticleStatus(row.id, 'published'); setArticles((prev) => prev.map((a) => a.id === row.id ? { ...a, status: 'published' as const } : a)); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-xs">
                                                <span className="material-icons text-sm">publish</span> Publish
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Article Details</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Author</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading…</td></tr>
                            ) : (
                                articles.slice(0, 10).map((row) => {
                                    const authorName = (row.journalist as { name?: string } | null)?.name ?? '—';
                                    return (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded bg-slate-200 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: row.featured_image_url ? `url(${row.featured_image_url})` : undefined }}></div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 line-clamp-1">{row.title}</p>
                                                        <p className="text-xs text-slate-500">{row.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                                                        {authorName.charAt(0)}{authorName.split(' ')[1]?.charAt(0) ?? ''}
                                                    </div>
                                                    <span className="text-sm text-slate-600">{authorName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    row.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    row.status === 'draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                                        row.status === 'published' ? 'bg-green-500' :
                                                        row.status === 'draft' ? 'bg-slate-400' : 'bg-yellow-500'
                                                    }`}></span>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/admin/editor?id=${row.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 font-medium text-sm">
                                                        <span className="material-icons text-sm">edit</span> Full editor
                                                    </Link>
                                                    <button type="button" onClick={() => setQuickEditId(row.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm">
                                                        <span className="material-icons text-sm">tune</span> Quick edit
                                                    </button>
                                                    {row.status === 'pending' && canPublish && (
                                                        <button type="button" onClick={async () => { await setArticleStatus(row.id, 'published'); setArticles((prev) => prev.map((a) => a.id === row.id ? { ...a, status: 'published' as const } : a)); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm">
                                                            <span className="material-icons text-sm">publish</span> Publish
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {quickEditId && (
                <QuickEditModal
                    articleId={quickEditId}
                    canPublish={canPublish}
                    onClose={() => setQuickEditId(null)}
                    onSaved={(updated) => {
                        setArticles((prev) => prev.map((a) => a.id === quickEditId ? { ...a, ...updated } : a));
                        if (latestPublished?.id === quickEditId && updated.status === 'published') {
                            setLatestPublished((prev) => prev ? { ...prev, ...updated } : null);
                        }
                        setQuickEditId(null);
                    }}
                />
            )}
        </div>
    );
};

function QuickEditModal({
    articleId,
    canPublish,
    onClose,
    onSaved,
}: {
    articleId: string;
    canPublish: boolean;
    onClose: () => void;
    onSaved: (updated: Partial<Article>) => void;
}) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState('Campus News');
    const [status, setStatus] = useState<ArticleStatus>('draft');

    useEffect(() => {
        if (!articleId) return;
        setLoading(true);
        setError(null);
        fetchAdminArticleById(articleId)
            .then((a) => {
                if (a) {
                    setArticle(a);
                    setTitle(a.title);
                    setExcerpt(a.excerpt ?? '');
                    setCategory(a.category);
                    setStatus(a.status);
                }
            })
            .catch((e) => setError(e?.message ?? 'Failed to load'))
            .finally(() => setLoading(false));
    }, [articleId]);

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);
        setError(null);
        try {
            await updateArticle(articleId, { title: title.trim(), excerpt: excerpt.trim() || null, category, status });
            onSaved({ title: title.trim(), excerpt: excerpt.trim() || null, category, status });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Quick edit</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600"><span className="material-icons">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                    ) : error ? (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Title</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Excerpt</label>
                                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary">
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value as ArticleStatus)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary">
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    {canPublish && <option value="published">Published</option>}
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {!loading && !error && (
                    <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancel</button>
                        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white font-medium text-sm disabled:opacity-70">
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export const AdminJournalists = () => {
    const [journalists, setJournalists] = useState<Journalist[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRole, setFormRole] = useState<string>('Contributor');
    const [formDepartment, setFormDepartment] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const load = () => {
        fetchAdminJournalists().then(setJournalists).catch(() => setJournalists([])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return journalists;
        const q = search.trim().toLowerCase();
        return journalists.filter((j) =>
            (j.name ?? '').toLowerCase().includes(q) || (j.email ?? '').toLowerCase().includes(q)
        );
    }, [journalists, search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSuccessMessage(null);
        if (!formName.trim() || !formEmail.trim()) {
            setSubmitError('Name and email are required.');
            return;
        }
        setSubmitting(true);
        try {
            const result = await inviteJournalist({
                name: formName.trim(),
                email: formEmail.trim(),
                role: formRole,
                department: formDepartment.trim() || undefined,
            });
            const email = formEmail.trim();
            setFormName('');
            setFormEmail('');
            setFormDepartment('');
            setSuccessMessage(result.message);
            load();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to create journalist.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Journalists</h1>
                    <p className="text-slate-500 text-sm">Invite journalists by email so they can create their account. Only Editor in Chief can publish.</p>
                </div>
                <button type="button" onClick={() => { setShowForm(true); setSubmitError(null); setSuccessMessage(null); }} className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm">
                    <span className="material-icons text-lg">add</span> Add journalist
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">New journalist</h3>
                    <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
                        {submitError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{submitError}</div>
                        )}
                        {successMessage && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">{successMessage}</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (login)</label>
                                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="jane@acjeksu.org" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary">
                                    {JOURNALIST_ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Only &quot;Editor in Chief&quot; can publish posts.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department (optional)</label>
                                <input type="text" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary" placeholder="Faculty of Arts" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">An invite email will be sent so they can set a password and log in.</p>
                        <div className="flex gap-2">
                            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white font-medium text-sm disabled:opacity-70">
                                {submitting ? 'Sending invite…' : 'Send invite'}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setSubmitError(null); }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="relative w-full max-w-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-icons text-slate-400 text-lg">search</span>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Search by name or email…" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Journalist</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Login</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No journalists yet. Add one to let them log in and post.</td></tr>
                            ) : filtered.map((person) => (
                                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                {person.name.charAt(0)}{person.name.split(' ')[1]?.charAt(0) ?? ''}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{person.name}</div>
                                                <div className="text-xs text-slate-500">{person.email ?? '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                            (person.role === 'Editor in Chief' || person.role === 'Editor-in-Chief') ? 'bg-primary/10 text-primary border-primary/20' :
                                            person.role === 'Editor' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {person.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{person.department ?? '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {person.auth_user_id ? (
                                            <span className="text-xs text-green-600 font-medium">Can log in</span>
                                        ) : (
                                            <span className="text-xs text-slate-400">No account</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm flex items-center gap-1.5 ${person.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${person.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                            {person.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CATEGORIES = ['Campus News', 'Politics', 'Sports', 'Academics', 'Lifestyle', 'Interview', 'Opinion'];

export const AdminEditor = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('Campus News');
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!id);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [currentJournalist, setCurrentJournalist] = useState<Journalist | null>(null);
    const [authorId, setAuthorId] = useState<string | null>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canPublish = !!(currentJournalist?.role && (currentJournalist.role === 'Editor in Chief' || currentJournalist.role === 'Editor-in-Chief'));

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const email = session?.user?.email;
            if (email) fetchJournalistByEmail(email).then(setCurrentJournalist).catch(() => setCurrentJournalist(null));
            else setCurrentJournalist(null);
        });
    }, []);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        fetchAdminArticleById(id).then((art) => {
            if (art) {
                setTitle(art.title);
                setExcerpt(art.excerpt ?? '');
                setCategory(art.category);
                setFeaturedImageUrl(art.featured_image_url ?? null);
                setStatus(art.status);
                setAuthorId(art.author_id ?? null);
                if (bodyRef.current) bodyRef.current.innerHTML = art.body || '<p>Start writing your story here...</p>';
            } else if (bodyRef.current) bodyRef.current.innerHTML = '<p>Start writing your story here...</p>';
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    const handleSave = async (newStatus: 'draft' | 'pending' | 'published') => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            await upsertArticle({
                id: id ?? undefined,
                title: title.trim(),
                excerpt: excerpt.trim() || null,
                body: bodyRef.current?.innerHTML?.trim() || body || null,
                category,
                featured_image_url: featuredImageUrl,
                status: newStatus,
                author_id: authorId ?? currentJournalist?.id ?? undefined,
            });
            setStatus(newStatus);
        } finally {
            setSaving(false);
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setUploadError('Please use an image file (JPG, PNG or WebP).');
            return;
        }
        setUploadError(null);
        setUploading(true);
        const { publicUrl, error } = await uploadFile(file, { folder: 'articles' });
        setUploading(false);
        if (error) {
            setUploadError(error.message || 'Upload failed. Ensure the Storage bucket "acj-media" exists (Public: on) and storage policies are applied.');
        } else {
            setFeaturedImageUrl(publicUrl);
        }
    };

    const onFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = () => setDragOver(false);

    if (loading) {
        return <div className="flex items-center justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 flex-shrink-0 gap-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/admin" className="text-slate-400 hover:text-slate-600 p-1 rounded"><span className="material-icons">arrow_back</span></Link>
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 truncate">{id ? (title || 'Edit article') : 'New article'}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                status === 'published' ? 'bg-green-100 text-green-800' :
                                status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>{status}</span>
                            {saving && <span className="text-xs text-slate-400">Saving…</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" onClick={() => handleSave('draft')} disabled={saving} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors font-medium text-sm">Save Draft</button>
                    <button type="button" onClick={() => handleSave('pending')} disabled={saving} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm flex items-center gap-1.5">
                        <span className="material-icons text-sm">send</span> Submit for Review
                    </button>
                    {canPublish && (
                        <button type="button" onClick={() => handleSave('published')} disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm">
                            <span className="material-icons text-sm">publish</span> Publish
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Headline</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl sm:text-3xl font-bold border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary font-display placeholder:text-slate-300 mb-6" placeholder="Enter headline here..." />
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Excerpt (short summary)</label>
                        <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full text-base border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary font-serif text-slate-600 mb-6" placeholder="One or two sentences for previews..." />
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Body</label>
                        <div ref={bodyRef} className="prose prose-lg max-w-none font-serif text-slate-700 border border-slate-200 rounded-lg p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary" contentEditable suppressContentEditableWarning><p>Start writing your story here...</p></div>
                    </div>
                </div>

                <aside className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto no-scrollbar flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 text-sm">Featured Image</h3>
                            {featuredImageUrl && (
                                <button type="button" onClick={() => { setFeaturedImageUrl(null); setUploadError(null); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Remove</button>
                            )}
                        </div>
                        <div className="p-4">
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFeaturedImageChange} />
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => { fileInputRef.current?.click(); setUploadError(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                className={`w-full border-2 border-dashed rounded-xl cursor-pointer min-h-[180px] flex flex-col items-center justify-center text-center transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary/30'
                                } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                            >
                                {featuredImageUrl ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                                        <img src={featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-icons-outlined text-primary text-4xl mb-2">{uploading ? 'hourglass_empty' : 'add_photo_alternate'}</span>
                                        <p className="text-sm font-medium text-slate-600">{uploading ? 'Uploading…' : 'Drop image here or click to choose'}</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP</p>
                                    </>
                                )}
                            </div>
                            {uploadError && (
                                <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{uploadError}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800 text-sm">Publishing</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary py-2">
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

type SettingsData = { siteTitle?: string; description?: string; supportEmail?: string; phone?: string; officeAddress?: string };

export const AdminSettings = () => {
    const [siteTitle, setSiteTitle] = useState('ACJ EKSU');
    const [description, setDescription] = useState('The Fourth Arm of Government: Truth, Accountability, Excellence');
    const [supportEmail, setSupportEmail] = useState('editor@acjeksu.org');
    const [phone, setPhone] = useState('+234 812 345 6789');
    const [officeAddress, setOfficeAddress] = useState('Student Union Building, Ekiti State University');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSiteSetting('general').then((row) => {
            const v = row?.value as SettingsData | undefined;
            if (v) {
                if (v.siteTitle) setSiteTitle(v.siteTitle);
                if (v.description) setDescription(v.description);
                if (v.supportEmail) setSupportEmail(v.supportEmail);
                if (v.phone) setPhone(v.phone);
                if (v.officeAddress) setOfficeAddress(v.officeAddress);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await upsertSiteSetting('general', {
                siteTitle,
                description,
                supportEmail,
                phone,
                officeAddress,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
                <p className="text-slate-500 text-sm">Manage your site preferences and account details.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                        <button type="button" className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">General</button>
                    </nav>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-100 pb-8">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-slate-900">Site Information</h3>
                            <p className="mt-1 text-sm text-slate-500">Basic details about the publication visible to the public.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label className="block text-sm font-medium text-slate-700">Site Title</label>
                                    <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border-slate-300" />
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-slate-300 rounded-md" />
                                    <p className="mt-2 text-sm text-slate-500">Brief description for SEO and meta tags.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-slate-900">Contact Details</h3>
                            <p className="mt-1 text-sm text-slate-500">Where readers can reach the editorial team.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-slate-700">Support Email</label>
                                    <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-slate-700">Office Address</label>
                                    <input type="text" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
                    <button type="button" onClick={handleSave} disabled={saving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70">{saving ? 'Saving…' : 'Save Changes'}</button>
                </div>
            </div>
        </div>
    );
};

export const AdminAnalytics = () => {
    const [counts, setCounts] = useState<{ published: number; pending: number; draft: number } | null>(null);
    const [contactsCount, setContactsCount] = useState<number | null>(null);
    const [journalistsCount, setJournalistsCount] = useState<number | null>(null);
    const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchAdminArticleCounts().then(setCounts).catch(() => setCounts(null)),
            fetchContactsCount().then(setContactsCount).catch(() => setContactsCount(null)),
            fetchJournalistsCount().then(setJournalistsCount).catch(() => setJournalistsCount(null)),
            fetchAdminArticles(200).then((list) => setPublishedArticles(list.filter((a) => a.status === 'published'))).catch(() => setPublishedArticles([])),
        ]).finally(() => setLoading(false));
    }, []);

    const last14Days = useMemo(() => {
        const days: { date: string; count: number; label: string }[] = [];
        const maxCount = 1;
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = publishedArticles.filter((a) => a.published_at && a.published_at.startsWith(dateStr)).length;
            days.push({ date: dateStr, count, label });
        }
        return days;
    }, [publishedArticles]);

    const maxDayCount = Math.max(1, ...last14Days.map((d) => d.count));

    const byCategory = useMemo(() => {
        const map = new Map<string, number>();
        publishedArticles.forEach((a) => map.set(a.category, (map.get(a.category) ?? 0) + 1));
        const total = publishedArticles.length;
        return Array.from(map.entries())
            .map(([category, count]) => ({ category, count, pct: total ? Math.round((count / total) * 100) : 0 }))
            .sort((a, b) => b.count - a.count);
    }, [publishedArticles]);

    const categoryColors = ['bg-primary', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-slate-600'];

    const latestPublished = useMemo(() => publishedArticles.slice(0, 10), [publishedArticles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Analytics Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Content and engagement metrics from your CMS.</p>
                </div>
            </div>

            {/* Top Cards - real data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Published Articles</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{counts?.published ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pending Review</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{counts?.pending ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Contact Inquiries</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{contactsCount ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Journalists</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{journalistsCount ?? 0}</p>
                </div>
            </div>

            {/* Charts - real data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Articles published (last 14 days)</h3>
                    <div className="h-64 flex items-end justify-between gap-1 px-1">
                        {last14Days.map((d) => (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0 group h-full">
                                <div className="w-full flex-1 flex flex-col justify-end min-h-[32px]">
                                    <div
                                        style={{ height: `${(d.count / maxDayCount) * 100}%`, minHeight: d.count ? 4 : 0 }}
                                        className="w-full bg-primary rounded-t-sm group-hover:bg-primary-light transition-colors"
                                        title={`${d.label}: ${d.count} article${d.count !== 1 ? 's' : ''}`}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 truncate w-full text-center" title={d.label}>{d.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400 border-t border-slate-100 pt-2">
                        <span>{last14Days[0]?.label}</span>
                        <span>{last14Days[last14Days.length - 1]?.label}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Articles by category</h3>
                    <div className="space-y-4">
                        {byCategory.length === 0 ? (
                            <p className="text-slate-500 text-sm">No published articles yet.</p>
                        ) : (
                            byCategory.map((item, i) => (
                                <div key={item.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 font-medium">{item.category}</span>
                                        <span className="text-slate-900 font-bold">{item.count} ({item.pct}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${categoryColors[i % categoryColors.length]}`} style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Latest published - real data */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Latest published stories</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Author</th>
                                <th className="px-6 py-3">Published</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {latestPublished.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No published articles yet.</td></tr>
                            ) : latestPublished.map((art) => (
                                <tr key={art.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <Link to={`/news/${art.id}`} className="text-sm font-medium text-primary hover:underline line-clamp-2">{art.title}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{art.category}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{(art.journalist as { name?: string } | null)?.name ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{art.published_at ? new Date(art.published_at).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AdminMediaLibrary = () => {
    const [media, setMedia] = useState<MediaRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia().then(setMedia).catch(() => setMedia([])).finally(() => setLoading(false));
    }, []);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);
        setUploading(true);
        const { path, publicUrl, error } = await uploadFile(file, { folder: 'media' });
        e.target.value = '';
        if (error) {
            setUploadError(error.message || 'Upload failed.');
            setUploading(false);
            return;
        }
        try {
            const row = await insertMediaRow({
                name: file.name,
                type: file.type,
                size_bytes: file.size,
                storage_path: path,
                bucket_name: 'acj-media',
                public_url: publicUrl,
                uploaded_by: null,
            });
            setMedia((prev) => [row, ...prev]);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Failed to save media record.');
        } finally {
            setUploading(false);
        }
    };

    const urlFor = (row: MediaRow) => row.public_url || (row.storage_path ? getPublicUrl(row.storage_path) : '');

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
                <div className="flex flex-col gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onUpload} />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => { fileInputRef.current?.click(); setUploadError(null); }} disabled={uploading} className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                            <span className="material-icons text-lg">cloud_upload</span> {uploading ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                    {uploadError && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{uploadError}</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center flex-shrink-0">
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-icons text-slate-400">search</span>
                    <input type="text" className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Search media..." />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {media.map((file) => (
                        <div key={file.id} className="group relative border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                {file.type.includes('image') ? (
                                    <img src={urlFor(file)} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <span className="material-icons text-5xl">description</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a href={urlFor(file)} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-slate-700 hover:text-primary"><span className="material-icons text-lg">visibility</span></a>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-medium text-slate-900 truncate" title={file.name}>{file.name}</p>
                                <div className="flex justify-between items-center mt-1 text-xs text-slate-500">
                                    <span>{file.size_bytes ? `${(file.size_bytes / 1024).toFixed(1)} KB` : '—'}</span>
                                    <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50">
                        <span className="material-icons text-3xl text-slate-300 mb-2">add</span>
                        <span className="text-sm font-medium text-slate-500">Upload New</span>
                    </button>
                </div>
                )}
            </div>
        </div>
    );
};