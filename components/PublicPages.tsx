import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchPublishedArticles, fetchArticleById, fetchJournalists, formatArticleTime, articleLabelColor, submitContact } from '../lib/queries';
import type { Article, Journalist } from '../lib/types';
import { ACJ_ORGANIZATION } from '../constants';

export const Home = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPublishedArticles(6)
            .then(setArticles)
            .catch((e) => setError(e?.message ?? 'Failed to load news'))
            .finally(() => setLoading(false));
    }, []);

    const topStory = articles[0];

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src={topStory?.featured_image_url ?? ACJ_ORGANIZATION.heroImageUrl} 
                        alt="University Hall" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-16">
                    <span className="inline-block py-1 px-3 rounded bg-accent text-white text-xs font-bold uppercase tracking-wider mb-6">Top Story</span>
                    {topStory ? (
                        <>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight font-display">
                                {topStory.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10 font-light font-serif line-clamp-3">
                                {topStory.excerpt ?? 'Leading the charge for transparency at Ekiti State University.'}
                            </p>
                            <Link to={`/news/${topStory.id}`} className="bg-white text-primary px-8 py-3 rounded font-bold hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                                Read Full Story <span className="material-icons text-sm">arrow_forward</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight font-display">
                                The Fourth Arm of<br />
                                Government: Truth,<br />
                                Accountability, Excellence
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10 font-light font-serif">
                                Leading the charge for transparency at Ekiti State University. We uncover the stories that matter most to the student body.
                            </p>
                        </>
                    )}
                </div>
            </section>

            {/* Welcome / Stats Strip */}
            <div className="relative -mt-16 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col md:flex-row items-center justify-between border-l-4 border-primary">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold text-primary mb-2">Welcome to {ACJ_ORGANIZATION.shortName}</h3>
                        <p className="text-slate-600 max-w-xl">
                            {ACJ_ORGANIZATION.nature}
                        </p>
                    </div>
                    <div className="flex gap-12 text-center">
                        <div>
                            <span className="block text-4xl font-bold text-primary">50+</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Journalists</span>
                        </div>
                        <div>
                            <span className="block text-4xl font-bold text-primary">10k+</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Readers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Updates Grid */}
            <section className="py-20 bg-background-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12 border-l-4 border-red-600 pl-4">
                        <h2 className="text-3xl font-bold text-primary">Latest Updates</h2>
                        <Link to="/news" className="text-sm font-semibold text-slate-600 hover:text-primary flex items-center gap-1">
                            View All News <span className="material-icons text-sm">chevron_right</span>
                        </Link>
                    </div>
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">{error}</div>
                    )}
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((news) => {
                                const authorName = (news.journalist as { name?: string } | null)?.name ?? 'Staff';
                                return (
                                    <Link key={news.id} to={`/news/${news.id}`} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group block">
                                        <div className="h-48 overflow-hidden relative">
                                            <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded z-10 ${articleLabelColor(news.category)}`}>
                                                {news.category}
                                            </span>
                                            <img src={news.featured_image_url ?? ''} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary transition-colors">
                                                {news.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{news.excerpt ?? ''}</p>
                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                        {authorName.charAt(0)}
                                                    </div>
                                                    <span>{authorName}</span>
                                                </div>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-icons text-[14px]">schedule</span> {formatArticleTime(news.published_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

             {/* Editor's Desk CTA */}
             <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12 bg-background-light rounded-2xl p-8 md:p-12 overflow-hidden relative">
                        {/* Decorative Circle */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        
                        <div className="w-full md:w-1/2">
                            <img 
                                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800" 
                                alt="Writing" 
                                className="rounded-lg shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">From The Editor's Desk</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-display">
                                The Pen as a Shield: Our Unwavering Independence
                            </h2>
                            <p className="text-slate-600 mb-6 text-lg font-serif">
                                In an era of misinformation, the role of campus journalism has never been more critical. At ACJ EKSU, we don't just report news; we document history as it happens. We stand firm in our commitment to hold power accountable.
                            </p>
                            <p className="text-slate-600 mb-8 font-serif">
                                Our independence is our strength. We are student-run, student-funded, and student-focused. Join us in this journey of truth.
                            </p>
                            <a href="#" className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary-light transition-colors">
                                Read Our Editorial Charter
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export const About = () => {
    return (
        <div className="bg-white">
             <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background-light overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h2 className="text-sm font-bold tracking-widest text-primary/70 uppercase mb-6">Our Mission</h2>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary leading-tight mb-8">
                        {ACJ_ORGANIZATION.fullName}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 font-serif max-w-3xl mx-auto leading-relaxed">
                        {ACJ_ORGANIZATION.mission}
                    </p>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full mt-12"></div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                                <span className="material-icons">visibility</span>
                            </div>
                            <h3 className="text-2xl font-bold text-primary font-display">An Independent Watchdog</h3>
                            <div className="prose prose-lg text-slate-600 font-serif">
                                <p>{ACJ_ORGANIZATION.mission}</p>
                            </div>
                        </div>
                        <div className="space-y-6 lg:border-l lg:border-slate-200 lg:pl-16">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                                <span className="material-icons">gavel</span>
                            </div>
                            <h3 className="text-2xl font-bold text-primary font-display">The Fourth Arm of Government</h3>
                            <div className="prose prose-lg text-slate-600 font-serif">
                                <p>{ACJ_ORGANIZATION.nature}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="material-icons text-5xl text-white/90 mb-6">verified_user</span>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">Unwavering Independence</h3>
                    <p className="text-xl md:text-2xl font-serif italic text-white/90 max-w-3xl mx-auto leading-relaxed">
                        We remain strictly independent from the influence of student politics or administrative influence, using multimedia to ensure accountability and excellence across every corner of Ekiti State University.
                    </p>
                    <div className="mt-10">
                        <span className="inline-block px-4 py-1 rounded-full border border-white/30 text-white/80 text-sm font-medium tracking-wide uppercase">Non-Partisan • Objective • Fearless</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export const Journalists = () => {
    const [list, setList] = useState<Journalist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchJournalists()
            .then(setList)
            .catch((e) => setError(e?.message ?? 'Failed to load journalists'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-background-light pb-20">
            <div className="bg-primary text-white py-24 text-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">The Voices Behind the Stories</h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
                    Meet the dedicated student journalists bringing you the latest news, investigations, and campus stories from Ekiti State University.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                     {['All Team', 'Editorial', 'Investigative', 'Sports', 'Photojournalism'].map((tab, i) => (
                         <button key={tab} className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                             {tab}
                         </button>
                     ))}
                </div>

                {error && <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">{error}</div>}
                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {list.map((person, idx) => (
                        <div key={person.id} className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                             <div className="w-24 h-24 mx-auto rounded-full p-1 border-2 border-primary/20 mb-6 group-hover:border-primary transition-colors relative">
                                <img src={person.avatar_url ?? ''} alt={person.name} className="w-full h-full rounded-full object-cover bg-slate-200" />
                                {idx === 0 && <span className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full material-icons text-xs border-2 border-white">verified</span>}
                             </div>
                             <h3 className="text-lg font-bold text-slate-900 mb-1">{person.name}</h3>
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{person.role}</p>
                             <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded mb-4">{person.department ?? ''}</span>
                             <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-3">
                                 {person.bio ?? ''}
                             </p>
                             <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white">
                                 Read Articles <span className="material-icons text-sm">arrow_forward</span>
                             </button>
                        </div>
                    ))}
                </div>
                )}
            </div>
            
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="bg-primary rounded-2xl p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
                     <div className="relative z-10 max-w-2xl">
                         <h2 className="text-3xl font-bold text-white mb-4">Are you a storyteller?</h2>
                         <p className="text-blue-100 text-lg">Join the Association of Campus Journalists at Ekiti State University. We are always looking for passionate writers, photographers, and editors.</p>
                     </div>
                     <div className="mt-8 md:mt-0 relative z-10">
                         <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-primary-light/20 transition-colors shadow-lg">
                             Apply Now
                         </button>
                     </div>
                     {/* Decor */}
                     <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
                </div>
             </div>
        </div>
    );
};


export const Contact = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [subjectType, setSubjectType] = useState<'News Tip' | 'General Inquiry' | 'Advertising'>('News Tip');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            await submitContact({
                full_name: fullName,
                email,
                subject_type: subjectType,
                message,
            });
            setSuccess("Thanks — we received your message.");
            setFullName('');
            setEmail('');
            setSubjectType('News Tip');
            setMessage('');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to submit message');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light pb-20">
             <div className="relative bg-primary text-white pt-16 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="relative max-w-4xl mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
                        Whether you have a breaking news tip or a general inquiry, the ACJ EKSU team is here to listen.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-10">
                 {/* Quick Info Bar */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-around items-center gap-6 text-center md:text-left">
                     {[
                         { icon: 'email', label: 'Email Us', value: ACJ_ORGANIZATION.contactEmail, href: `mailto:${ACJ_ORGANIZATION.contactEmail}` },
                         { icon: 'link', label: 'Instagram', value: '@acj__eksu', href: ACJ_ORGANIZATION.social.instagram },
                         { icon: 'link', label: 'X', value: '@ACJ_EKSU', href: ACJ_ORGANIZATION.social.x },
                         { icon: 'link', label: 'WhatsApp Channel', value: 'Join channel', href: ACJ_ORGANIZATION.social.whatsappChannel }
                     ].map((item, i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-icons">{item.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-primary hover:underline">{item.value}</a>
                                    ) : (
                                        <p className="text-lg font-medium text-primary">{item.value}</p>
                                    )}
                                </div>
                            </div>
                            {i !== 3 && <div className="w-px h-12 bg-slate-200 hidden md:block"></div>}
                        </React.Fragment>
                     ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                    <span className="material-icons text-primary">send</span> Send a Message
                                </h2>
                                {success && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">{success}</div>}
                                {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                            <input value={fullName} onChange={e => setFullName(e.target.value)} required type="text" className="block w-full rounded-lg border-slate-300 bg-slate-50 focus:border-primary focus:ring-primary py-3 px-4" placeholder="Jane Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                            <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className="block w-full rounded-lg border-slate-300 bg-slate-50 focus:border-primary focus:ring-primary py-3 px-4" placeholder="jane@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-slate-700">What is this regarding?</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none border-primary ring-1 ring-primary">
                                                <input type="radio" name="type" className="sr-only" checked={subjectType === 'News Tip'} onChange={() => setSubjectType('News Tip')} />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-bold text-primary">News Tip</span>
                                                        <span className="mt-1 flex items-center text-xs text-slate-500">Scoop or event info</span>
                                                    </span>
                                                </span>
                                                <span className="material-icons text-primary" style={{fontSize: '1.25rem'}}>check_circle</span>
                                            </label>
                                             <label className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus:outline-none hover:bg-slate-50">
                                                <input type="radio" name="type" className="sr-only" checked={subjectType === 'General Inquiry'} onChange={() => setSubjectType('General Inquiry')} />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-medium text-slate-900">General Inquiry</span>
                                                        <span className="mt-1 flex items-center text-xs text-slate-500">Questions or feedback</span>
                                                    </span>
                                                </span>
                                            </label>
                                            <label className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm focus:outline-none hover:bg-slate-50">
                                                <input type="radio" name="type" className="sr-only" checked={subjectType === 'Advertising'} onChange={() => setSubjectType('Advertising')} />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-medium text-slate-900">Advertising</span>
                                                        <span className="mt-1 flex items-center text-xs text-slate-500">Partner with ACJ</span>
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Your Message</label>
                                        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="block w-full rounded-lg border-slate-300 bg-slate-50 focus:border-primary focus:ring-primary py-3 px-4" placeholder="Please provide as much detail as possible..."></textarea>
                                    </div>
                                    <div className="pt-2">
                                        <button disabled={submitting} type="submit" className="w-full md:w-auto inline-flex justify-center items-center rounded-lg border border-transparent bg-primary px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-light transition-all disabled:opacity-70">
                                            {submitting ? 'Submitting…' : 'Submit Message'} <span className="material-icons ml-2 text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-primary mb-2">Want to Join ACJ?</h3>
                            <p className="text-sm text-slate-600 mb-4">Membership applications open every semester. Stay tuned to our news feed.</p>
                            <a href="#" className="text-primary text-sm font-semibold hover:underline inline-flex items-center">
                                Learn more about membership <span className="material-icons text-sm ml-1">chevron_right</span>
                            </a>
                        </div>
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-primary mb-6">Connect on Social</h3>
                            <div className="space-y-4">
                                <a href="#" className="group flex items-center justify-between w-full p-4 bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/20 rounded-lg transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons text-[#25D366] group-hover:text-white">chat</span>
                                        <span className="font-semibold text-slate-800 group-hover:text-white">WhatsApp Community</span>
                                    </div>
                                    <span className="material-icons text-slate-400 group-hover:text-white">arrow_outward</span>
                                </a>
                                 <a href="#" className="group flex items-center justify-between w-full p-4 bg-slate-100 hover:bg-black border border-slate-200 rounded-lg transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-xl px-1 text-slate-800 group-hover:text-white">X</span>
                                        <span className="font-semibold text-slate-800 group-hover:text-white">Follow on X</span>
                                    </div>
                                    <span className="material-icons text-slate-400 group-hover:text-white">arrow_outward</span>
                                </a>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 h-64 relative group">
                             <img src="https://images.unsplash.com/photo-1524813686514-a5756c97759e?auto=format&fit=crop&q=80&w=600" alt="Map" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 bg-primary/20 pointer-events-none"></div>
                             <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold py-1 px-3 rounded shadow-sm">
                                Locate Us on Campus
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NEWS_CATEGORIES = ['All News', 'Campus News', 'Politics', 'Sports', 'Academics', 'Lifestyle', 'Interview', 'Opinion'] as const;

export const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') ?? 'All News';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    NEWS_CATEGORIES.includes(categoryFromUrl as any) ? categoryFromUrl : 'All News'
  );

  useEffect(() => {
    const cat = searchParams.get('category') ?? 'All News';
    if (NEWS_CATEGORIES.includes(cat as any)) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchPublishedArticles(50)
      .then(setArticles)
      .catch((e) => setError(e?.message ?? 'Failed to load news'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCategory === 'All News'
    ? articles
    : articles.filter((a) => a.category === selectedCategory);
  const featured = filtered[0];
  const regularNews = filtered.slice(1);
  const trendingNow = filtered.slice(0, 5);

  return (
    <div className="bg-background-light pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h1 className="text-4xl font-bold text-primary font-display mb-4">Campus Newsroom</h1>
           <p className="text-slate-600 text-lg max-w-2xl font-serif">Stay updated with the latest happenings, reports, and stories from around the university community.</p>
           
           <div className="flex gap-2 mt-8 overflow-x-auto no-scrollbar pb-2">
             {NEWS_CATEGORIES.map((cat) => (
               <button
                 key={cat}
                 type="button"
                 onClick={() => {
                 setSelectedCategory(cat);
                 setSearchParams(cat === 'All News' ? {} : { category: cat });
               }}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCategory === cat ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error && <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
             {featured ? (
             <div className="mb-12 group cursor-pointer">
                <Link to={`/news/${featured.id}`} className="block">
                    <div className="rounded-xl overflow-hidden mb-4 relative h-[400px]">
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10">Breaking</span>
                        <img src={featured.featured_image_url ?? ''} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
                                <span>{(featured.journalist as { name?: string } | null)?.name ?? 'Staff'}</span>
                                <span>•</span>
                                <span>{formatArticleTime(featured.published_at)}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-display leading-tight group-hover:underline decoration-2 underline-offset-4">{featured.title}</h2>
                        </div>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed font-serif">{featured.excerpt ?? ''}</p>
                </Link>
             </div>
             ) : (
             <div className="mb-12 p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
               {selectedCategory === 'All News' ? 'No articles yet.' : `No articles in ${selectedCategory} yet.`}
             </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regularNews.map((news) => {
                  const authorName = (news.journalist as { name?: string } | null)?.name ?? 'Staff';
                  return (
                   <Link key={news.id} to={`/news/${news.id}`} className="flex flex-col group cursor-pointer">
                      <div className="rounded-lg overflow-hidden h-48 mb-4 relative">
                         <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${articleLabelColor(news.category)}`}>{news.category}</span>
                         <img src={news.featured_image_url ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={news.title} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 font-display leading-snug group-hover:text-primary transition-colors">{news.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3 font-serif">{news.excerpt ?? ''}</p>
                      <div className="mt-auto flex items-center text-xs text-slate-400 gap-2">
                        <span>{authorName}</span>
                        <span>•</span>
                        <span>{formatArticleTime(news.published_at)}</span>
                      </div>
                   </Link>
                  );
                })}
             </div>
             
             {filtered.length > 0 && (
             <div className="mt-12 text-center">
                <button className="px-8 py-3 border border-slate-300 rounded-lg text-slate-600 font-medium hover:border-primary hover:text-primary transition-colors">Load More Stories</button>
             </div>
             )}
          </div>

          <aside className="lg:w-1/3 space-y-8">
             {/* Trending Now - real data */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-icons text-primary">trending_up</span> Trending Now
                </h3>
                <div className="space-y-4">
                   {trendingNow.length === 0 ? (
                     <p className="text-slate-500 text-sm">No stories yet.</p>
                   ) : (
                     trendingNow.map((news, i) => (
                       <Link key={news.id} to={`/news/${news.id}`} className="flex gap-4 items-start group border-b border-slate-50 last:border-0 pb-3 last:pb-0 block">
                         <span className="text-2xl font-bold text-slate-200 group-hover:text-primary/50 transition-colors flex-shrink-0">{i + 1}</span>
                         <div className="min-w-0">
                           <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 block px-2 py-0.5 rounded w-fit ${articleLabelColor(news.category)}`}>{news.category}</span>
                           <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{news.title}</h4>
                           <span className="text-xs text-slate-400 mt-0.5 block">{formatArticleTime(news.published_at)}</span>
                         </div>
                       </Link>
                     ))
                   )}
                </div>
             </div>

             {/* Subscribe */}
             <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2">Subscribe to ACJ Weekly</h3>
                  <p className="text-blue-100 text-sm mb-4">Get the top stories delivered to your inbox every Friday morning.</p>
                  <input type="email" placeholder="Your student email" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder:text-blue-200/50 mb-3 focus:outline-none focus:ring-1 focus:ring-white" />
                  <button className="w-full bg-white text-primary font-bold text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors">Subscribe</button>
                </div>
             </div>
          </aside>
        </div>
        )}
      </div>
    </div>
  )
}

export const ArticleView = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [related, setRelated] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        fetchArticleById(id)
            .then(setArticle)
            .catch((e) => setError(e?.message ?? 'Failed to load article'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        fetchPublishedArticles(8)
            .then((items) => setRelated(items.filter((a) => a.id !== id).slice(0, 3)))
            .catch(() => setRelated([]));
    }, [id]);

    const authorName = article ? (article.journalist as { name?: string } | null)?.name ?? 'Staff' : '';

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (error || !article) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-8">
                <p className="text-slate-600 mb-4">{error ?? 'Article not found.'}</p>
                <Link to="/news" className="text-primary font-bold hover:underline">Back to News</Link>
            </div>
        );
    }

    return (
        <article className="bg-background-light min-h-screen pb-20">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <Link to="/news" className="inline-flex items-center gap-1 text-primary font-semibold text-sm mb-6 hover:underline">
                        <span className="material-icons text-lg">arrow_back</span> Back to News
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${articleLabelColor(article.category)}`}>
                            {article.category}
                        </span>
                        <span className="text-slate-500 text-sm">{formatArticleTime(article.published_at)}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 font-display leading-tight mb-6">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {authorName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{authorName}</p>
                            <p className="text-xs text-slate-500">ACJ EKSU</p>
                        </div>
                    </div>
                </div>
            </div>

            {article.featured_image_url && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
                        <img src={article.featured_image_url} alt={article.title} className="w-full aspect-video object-cover" />
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-10 pb-16">
                <div className="min-w-0 flex-1">
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:text-slate-900 prose-p:font-serif prose-p:leading-relaxed prose-p:text-slate-700 prose-a:text-primary hover:prose-a:text-primary-light prose-img:rounded-xl prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                        {article.excerpt && (
                        <p className="lead text-xl text-slate-600 font-serif italic border-l-4 border-primary pl-4 mb-8">
                            &quot;{article.excerpt}&quot;
                        </p>
                        )}
                        {article.body ? (
                            <div dangerouslySetInnerHTML={{ __html: article.body }} />
                        ) : (
                            <>
                        <p>
                            <span className="float-left text-6xl font-bold font-display text-primary leading-none mr-3 mt-[-4px]">E</span>
                            kiti State University (EKSU) has always been a hub of academic excellence and vibrant student life. However, recent events have sparked a new wave of discussions across campus. From the lecture halls of the Faculty of Science to the bustling walkways of the Student Union Building, the topic on everyone&apos;s lips is the future of our institution.
                        </p>
                        <p>
                            Student leaders have been meeting around the clock to address the concerns raised by the student body. We are committed to ensuring that every student&apos;s voice is heard, stated the SUG President during a press briefing yesterday. Transparency is not just a buzzword; it is the foundation of our administration.
                        </p>
                        <h3>The Core Issues at Hand</h3>
                        <p>
                            Infrastructure remains a primary concern. The recent heavy rains have exposed vulnerabilities in the drainage systems near the Engineering complex, leading to temporary disruptions. Management has promised immediate remedial action, deploying a task force to assess the damage and implement long-term solutions.
                        </p>
                        <ul>
                            <li>Immediate repair of affected walkways.</li>
                            <li>Installation of new solar-powered streetlights for improved security.</li>
                            <li>Renovation of the large lecture theatres to accommodate growing class sizes.</li>
                        </ul>
                        <p>
                            Furthermore, the academic calendar has been streamlined to ensure that the semester proceeds without interruption. Lecturers have expressed their readiness to embrace digital tools to supplement classroom learning, a move that many students have welcomed.
                        </p>
                        <blockquote>
                            Innovation is the key to our survival. We must adapt to the changing times to remain competitive globally. — Prof. Adebayo, Vice Chancellor.
                        </blockquote>
                        <h3>Looking Ahead</h3>
                        <p>
                            As we move forward, it is imperative that the channel of communication between the management and the students remains open. The Association of Campus Journalists (ACJ) will continue to play its role as the watchdog of society, ensuring that accurate information is disseminated timely.
                        </p>
                        <p>
                            We urge all students to remain calm and law-abiding as we navigate these changes together. The spirit of Aluta Continua is not just about struggle; it is about the relentless pursuit of a better future for all.
                        </p>
                            </>
                        )}
                    </div>

                    {/* Share & Tags */}
                    <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <span className="text-sm font-bold text-slate-500">Tags:</span>
                            {['Campus', 'Management', 'Student Life'].map(tag => (
                                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 cursor-pointer">#{tag}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Share:</span>
                            <button type="button" className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Share"><span className="material-icons text-lg">share</span></button>
                            <button type="button" className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Like"><span className="material-icons text-lg">thumb_up</span></button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - sticky on desktop */}
                <aside className="lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
                    {/* Author Box */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">About the Author</h4>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {authorName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{authorName}</p>
                                <p className="text-xs text-slate-500">ACJ EKSU</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600">
                            Stories that matter to the EKSU community.
                        </p>
                    </div>

                    {/* Related Stories */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Related Stories</h4>
                        <div className="space-y-3">
                            {related.map((rel) => (
                                <Link key={rel.id} to={`/news/${rel.id}`} className="group flex gap-3 rounded-lg p-2 -mx-2 hover:bg-slate-50 transition-colors">
                                    {rel.featured_image_url ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                            <img src={rel.featured_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-400 text-lg">
                                            {(rel.journalist as { name?: string } | null)?.name?.charAt(0) ?? '?'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {rel.title}
                                        </h5>
                                        <span className="text-xs text-slate-500">{formatArticleTime(rel.published_at)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    );
};