import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchAdminArticleCounts } from '../lib/admin';
import { NAV_LINKS, ACJ_ORGANIZATION } from '../constants';

export const PublicLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div className="min-h-screen flex flex-col font-display bg-background-light">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <Link to="/" className="flex items-center gap-3">
                                <img src="/logo.png" alt={`${ACJ_ORGANIZATION.shortName} - ${ACJ_ORGANIZATION.fullName}`} className="h-14 w-auto object-contain" />
                                <span className="text-xl font-bold tracking-tight text-primary hidden sm:inline">ACJ EKSU</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-8">
                            {NAV_LINKS.map(link => (
                                <NavLink 
                                    key={link.label}
                                    to={link.href}
                                    className={({ isActive }) => 
                                        `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <div className="hidden md:flex gap-2">
                                <a href={ACJ_ORGANIZATION.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="Instagram"><i className="material-icons" style={{fontSize: '20px'}}>camera_alt</i></a>
                                <a href={ACJ_ORGANIZATION.social.x} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="X"><i className="material-icons" style={{fontSize: '20px'}}>tag</i></a>
                                <a href={ACJ_ORGANIZATION.social.whatsappChannel} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="WhatsApp Channel"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                             </div>
                             <button className="hidden md:block bg-primary hover:bg-primary-light text-white px-5 py-2 rounded text-sm font-medium transition-colors">
                                Subscribe
                             </button>
                             {/* Mobile Menu Button */}
                             <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-slate-600 hover:text-primary p-2"
                             >
                                <span className="material-icons text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                             </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
                        <div className="px-4 py-4 space-y-1">
                            {NAV_LINKS.map(link => (
                                <NavLink 
                                    key={link.label}
                                    to={link.href}
                                    className={({ isActive }) => 
                                        `block px-3 py-3 text-base font-medium rounded-md transition-colors ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
                                <div className="flex gap-4 px-3">
                                    <a href={ACJ_ORGANIZATION.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="Instagram"><i className="material-icons">camera_alt</i></a>
                                    <a href={ACJ_ORGANIZATION.social.x} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="X"><i className="material-icons">tag</i></a>
                                    <a href={ACJ_ORGANIZATION.social.whatsappChannel} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="WhatsApp Channel"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                                </div>
                                <button className="bg-primary text-white px-4 py-2 rounded text-sm font-medium">Subscribe</button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-primary text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <img src="/logo.png" alt={ACJ_ORGANIZATION.shortName} className="h-20 w-auto object-contain mb-4" />
                            <p className="text-sm font-semibold text-primary-light mb-1">{ACJ_ORGANIZATION.tagline}</p>
                            <p className="text-slate-300 font-serif max-w-md">
                                {ACJ_ORGANIZATION.mission.slice(0, 180)}…
                            </p>
                            <div className="flex gap-4 mt-4">
                                <a href={ACJ_ORGANIZATION.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">IG</a>
                                <a href={ACJ_ORGANIZATION.social.x} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="X (Twitter)">X</a>
                                <a href={ACJ_ORGANIZATION.social.whatsappChannel} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="WhatsApp Channel">WhatsApp</a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4 font-display text-primary-light/90">Quick Links</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                                <li><Link to="/news?category=Politics" className="hover:text-white transition-colors">Politics</Link></li>
                                <li><Link to="/news?category=Campus News" className="hover:text-white transition-colors">Campus Life</Link></li>
                                <li><Link to="/news?category=Opinion" className="hover:text-white transition-colors">Editorials</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4 font-display text-primary-light/90">Connect</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Report a Story</Link></li>
                                <li><Link to="/journalists" className="hover:text-white transition-colors">Join ACJ</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                        <p className="text-center md:text-left">© {new Date().getFullYear()} {ACJ_ORGANIZATION.shortName}. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0 justify-center">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchAdminArticleCounts().then((c) => setPendingCount(c.pending)).catch(() => setPendingCount(0));
    }, [location.pathname]);

    useEffect(() => {
        if (!notificationsOpen) return;
        const close = (e: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setNotificationsOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [notificationsOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-background-light overflow-hidden font-display relative">
            
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed md:static inset-y-0 left-0 z-30 w-64 bg-primary flex flex-col text-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-primary-light/30 flex-shrink-0">
                    <div className="flex items-center min-w-0">
                        <img src="/logo.png" alt="ACJ EKSU" className="h-10 md:h-12 w-auto object-contain flex-shrink-0" />
                        <div className="ml-2 min-w-0">
                            <h1 className="font-bold text-sm tracking-wide text-white truncate">ACJ EKSU</h1>
                            <p className="text-xs text-primary-light/90 hidden sm:block">Admin Console</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 -mr-2 text-white/80 hover:text-white rounded-lg" aria-label="Close menu">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                        <span className="material-icons-outlined">dashboard</span>
                        Dashboard
                    </Link>
                    <div className="pt-4 pb-2 px-4 text-xs font-semibold text-primary-light/70 uppercase tracking-wider">Content</div>
                    <Link to="/admin/editor" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/editor') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                         <span className="material-icons-outlined">article</span>
                        Posts
                    </Link>
                     <Link to="/admin/journalists" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/journalists') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                        <span className="material-icons-outlined">group</span>
                        Journalists
                    </Link>
                     <Link to="/admin/media" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/media') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                        <span className="material-icons-outlined">perm_media</span>
                        Media Library
                    </Link>
                    <div className="pt-4 pb-2 px-4 text-xs font-semibold text-primary-light/70 uppercase tracking-wider">System</div>
                    <Link to="/admin/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/analytics') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                        <span className="material-icons-outlined">analytics</span>
                        Analytics
                    </Link>
                    <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/settings') ? 'bg-white/10 text-white' : 'text-primary-light/90 hover:bg-white/5 hover:text-white'}`}>
                        <span className="material-icons-outlined">settings</span>
                        Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-primary-light/30 flex-shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="h-9 w-9 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                            {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userEmail ?? 'Admin'}</p>
                            <p className="text-xs text-primary-light/80 truncate">Editor</p>
                        </div>
                        <button type="button" onClick={handleLogout} className="text-primary-light/80 hover:text-white p-1" title="Log out">
                            <span className="material-icons-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                <header className="bg-white h-14 sm:h-16 border-b border-slate-200 flex items-center justify-between gap-2 px-3 sm:px-6 z-10 flex-shrink-0">
                     <div className="flex items-center gap-2 sm:gap-4 text-sm text-slate-500 min-w-0 flex-1">
                        <button 
                            type="button"
                            className="md:hidden p-2 -ml-1 text-slate-500 hover:text-primary rounded-lg flex-shrink-0"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <span className="material-icons">menu</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            <Link to="/admin" className="text-slate-500 hover:text-slate-800">Admin</Link>
                            <span className="material-icons text-base text-slate-400">chevron_right</span>
                        </div>
                        <span className="font-medium text-slate-800 truncate capitalize">{location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}</span>
                     </div>
                     <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative" ref={notificationsRef}>
                        <button 
                            type="button"
                            onClick={() => setNotificationsOpen((o) => !o)}
                            className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100"
                            aria-label="Notifications"
                            aria-expanded={notificationsOpen}
                        >
                            <span className="material-icons-outlined">notifications</span>
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" aria-hidden />
                            )}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                                </div>
                                {pendingCount > 0 ? (
                                    <Link to="/admin" onClick={() => setNotificationsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left">
                                        <span className="material-icons-outlined text-amber-500">rate_review</span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{pendingCount} pending review{pendingCount !== 1 ? 's' : ''}</p>
                                            <p className="text-xs text-slate-500">Go to dashboard to publish</p>
                                        </div>
                                        <span className="material-icons text-slate-400 ml-auto text-lg">chevron_right</span>
                                    </Link>
                                ) : (
                                    <div className="px-4 py-4 text-sm text-slate-500">No new notifications</div>
                                )}
                            </div>
                        )}
                     </div>
                </header>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8">
                     <Outlet />
                </div>
            </main>
        </div>
    );
}