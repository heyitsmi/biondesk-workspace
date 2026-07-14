import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Clock, Twitter, Linkedin, Link2, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FrontendNavbar from '@/components/frontend-navbar';

export default function Show({ blog, relatedBlogs }: { blog: any; relatedBlogs: any[] }) {
    const [copied, setCopied] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [activeSection, setActiveSection] = useState('');
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const articleRef = useRef<HTMLDivElement>(null);

    // Reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const el = articleRef.current;

            if (!el) {
return;
}

            const rect = el.getBoundingClientRect();
            const totalHeight = el.scrollHeight;
            const scrolled = Math.max(0, -rect.top);
            setReadProgress(Math.min(100, (scrolled / (totalHeight - window.innerHeight)) * 100));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Build table of contents from rendered HTML headings
    useEffect(() => {
        if (!articleRef.current) {
return;
}

        const headings = Array.from(articleRef.current.querySelectorAll('h2, h3'));
        const items = headings.map((el, i) => {
            const id = `heading-${i}`;
            el.id = id;

            return { id, text: el.textContent || '', level: el.tagName === 'H2' ? 2 : 3 };
        });
        setToc(items);
    }, [blog.content]);

    // Active section tracking
    useEffect(() => {
        if (toc.length === 0) {
return;
}

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
setActiveSection(entry.target.id);
}
                });
            },
            { rootMargin: '-20% 0px -70% 0px' },
        );
        toc.forEach(({ id }) => {
            const el = document.getElementById(id);

            if (el) {
observer.observe(el);
}
        });

        return () => observer.disconnect();
    }, [toc]);

    // Fade-up animation
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        obs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
        );
        document.querySelectorAll('.fade-up').forEach((el) => obs.observe(el));

        return () => obs.disconnect();
    }, []);

    const readingTime = Math.max(1, Math.ceil((blog.content?.length || 0) / 1500));

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const thumbnailUrl = blog.media?.[0]?.original_url;

    return (
        <div className="font-sans bg-white text-[#12161F] min-h-screen selection:bg-amber-200 selection:text-amber-900">
            <Head>
                <title>{blog.meta_title || `${blog.title} | Biondesk`}</title>
                <meta name="description" content={blog.meta_description || blog.description} />
            </Head>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .fluid { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
                .fade-up.is-visible { opacity: 1; transform: translateY(0); }
                .delay-100 { transition-delay: 100ms; }
                .delay-200 { transition-delay: 200ms; }
                .delay-300 { transition-delay: 300ms; }

                /* Reading progress */
                .progress-bar { height: 2px; background: linear-gradient(90deg, #C77F1F, #E8A33D); transition: width 0.1s linear; }

                /* Prose styles */
                .prose-bion { line-height: 1.85; color: #374151; font-size: 1.0625rem; }
                .prose-bion > * + * { margin-top: 1.5rem; }
                .prose-bion h2 { font-size: 1.625rem; font-weight: 700; color: #0F172A; margin-top: 3.5rem; margin-bottom: 1rem; letter-spacing: -0.02em; line-height: 1.3; padding-top: 1rem; border-top: 1px solid #F3F4F6; }
                .prose-bion h3 { font-size: 1.2rem; font-weight: 650; color: #1E293B; margin-top: 2.5rem; margin-bottom: 0.75rem; letter-spacing: -0.01em; }
                .prose-bion p { margin-top: 1.25rem; margin-bottom: 1.25rem; }
                .prose-bion strong { color: #0F172A; font-weight: 600; }
                .prose-bion a { color: #C77F1F; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(199,127,31,0.4); }
                .prose-bion a:hover { text-decoration-color: #C77F1F; }
                .prose-bion blockquote { border-left: 3px solid #C77F1F; padding: 1rem 1.5rem; background: #FFFBF5; border-radius: 0 8px 8px 0; margin: 2rem 0; font-style: normal; color: #1E293B; }
                .prose-bion blockquote p { margin: 0; font-size: 1.05rem; font-weight: 500; }
                .prose-bion ul { list-style: none; padding: 0; margin: 1.5rem 0; }
                .prose-bion ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.6rem; }
                .prose-bion ul li::before { content: '→'; position: absolute; left: 0; color: #C77F1F; font-weight: 600; }
                .prose-bion ol { counter-reset: list-counter; padding: 0; margin: 1.5rem 0; }
                .prose-bion ol li { position: relative; padding-left: 2.5rem; margin-bottom: 0.6rem; counter-increment: list-counter; }
                .prose-bion ol li::before { content: counter(list-counter); position: absolute; left: 0; top: 1px; width: 1.5rem; height: 1.5rem; background: #0F172A; color: #fff; border-radius: 50%; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
                .prose-bion code { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 0.15em 0.4em; font-size: 0.88em; font-family: 'JetBrains Mono', monospace; color: #C77F1F; }
                .prose-bion pre { background: #0F172A; border-radius: 12px; padding: 1.5rem; overflow-x: auto; margin: 2rem 0; }
                .prose-bion pre code { background: none; border: none; color: #E2E8F0; font-size: 0.875rem; }
                .prose-bion img { border-radius: 12px; margin: 2rem 0; width: 100%; }

                /* TOC */
                .toc-link { display: block; padding: 0.3rem 0.75rem; border-left: 2px solid transparent; font-size: 0.78rem; color: #9CA3AF; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .toc-link:hover { color: #374151; border-color: #D1D5DB; }
                .toc-link.active { color: #C77F1F; border-color: #C77F1F; font-weight: 500; }
                .toc-link.level-3 { padding-left: 1.5rem; font-size: 0.73rem; }

                /* Share btn */
                .share-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #E5E7EB; background: #fff; display: flex; align-items: center; justify-content: center; color: #6B7280; transition: all 0.2s; }
                .share-btn:hover { border-color: #C77F1F; color: #C77F1F; background: #FFFBF5; }

                /* Related card */
                .related-card { border: 1px solid #F0F0F0; border-radius: 16px; overflow: hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); background: #fff; }
                .related-card:hover { border-color: #E5E7EB; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
                .related-card-img { aspect-ratio: 16/9; overflow: hidden; background: #F9FAFB; }
                .related-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
                .related-card:hover .related-card-img img { transform: scale(1.04); }

                @media (max-width: 1024px) {
                    .sidebar-toc { display: none; }
                }
            `,
                }}
            />

            {/* Reading progress */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
                <div className="progress-bar" style={{ width: `${readProgress}%` }} />
            </div>

            <FrontendNavbar />

            {/* Hero header */}
            <div className="pt-14 bg-white">
                <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#C77F1F] mb-8 transition-colors fade-up"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Blog
                    </Link>

                    <div className="flex items-center gap-3 mb-5 fade-up delay-100">
                        <Link
                            href={`/blog?category=${blog.category?.slug}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-[#C77F1F] bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
                        >
                            {blog.category?.name || 'Uncategorized'}
                        </Link>
                        <span className="text-[#D1D5DB]">·</span>
                        <span className="text-xs text-[#9CA3AF]">{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF]">
                            <Clock className="w-3 h-3" />
                            {readingTime} min read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#0F172A] leading-[1.12] mb-8 max-w-3xl fade-up delay-200">
                        {blog.title}
                    </h1>

                    {blog.description && (
                        <p className="text-lg text-[#6B7280] max-w-2xl leading-relaxed mb-10 fade-up delay-200">{blog.description}</p>
                    )}

                    <div className="flex items-center gap-4 pb-10 fade-up delay-300">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C77F1F] to-[#E8A33D] flex items-center justify-center text-white font-bold text-sm">
                            {blog.author?.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#0F172A]">{blog.author?.name || 'Biondesk Team'}</div>
                            <div className="text-xs text-[#9CA3AF]">Author at Biondesk</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero image — full bleed */}
            {thumbnailUrl && (
                <div className="w-full bg-[#F9FAFB] fade-up">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="w-full aspect-[2.4/1] rounded-2xl overflow-hidden border border-[#F0F0F0] shadow-lg">
                            <img src={thumbnailUrl} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}

            {/* Content grid: article + sidebar */}
            <main className="max-w-5xl mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-16">
                    {/* Article content */}
                    <div ref={articleRef}>
                        <article className="prose-bion fade-up" dangerouslySetInnerHTML={{ __html: blog.content }} />

                        {/* Share row */}
                        <div className="mt-16 pt-8 border-t border-[#F3F4F6]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 fade-up">
                                <div>
                                    <p className="text-sm font-semibold text-[#0F172A] mb-0.5">Found this helpful?</p>
                                    <p className="text-xs text-[#9CA3AF]">Share it with your network</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(blog.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn"
                                        title="Share on Twitter"
                                    >
                                        <Twitter className="w-4 h-4" />
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn"
                                        title="Share on LinkedIn"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                    <button onClick={handleCopy} className="share-btn" title="Copy link">
                                        {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Author card */}
                        <div className="mt-10 p-6 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] flex items-start gap-5 fade-up">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#C77F1F] to-[#E8A33D] flex items-center justify-center text-white font-bold text-lg">
                                {blog.author?.name?.charAt(0) || 'B'}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-[#0F172A] mb-1">{blog.author?.name || 'Biondesk Team'}</div>
                                <p className="text-xs text-[#6B7280] leading-relaxed">
                                    Writing about freelance operations, client management, and building sustainable service businesses. Sharing real insights from building Biondesk.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sticky sidebar — TOC */}
                    {toc.length > 2 && (
                        <aside className="sidebar-toc">
                            <div className="sticky top-24">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3 px-3">On this page</p>
                                <nav>
                                    {toc.map(({ id, text, level }) => (
                                        <a
                                            key={id}
                                            href={`#${id}`}
                                            className={`toc-link level-${level} ${activeSection === id ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                        >
                                            {text}
                                        </a>
                                    ))}
                                </nav>

                                <div className="mt-8 px-3">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
                                        <p className="text-xs font-semibold text-[#0F172A] mb-1">Try Biondesk free</p>
                                        <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">Manage clients, projects & invoices in one place.</p>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C77F1F] hover:gap-2 transition-all"
                                        >
                                            Get started <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>

            {/* Related articles */}
            {relatedBlogs.length > 0 && (
                <section className="border-t border-[#F0F0F0] bg-[#FAFAFA] py-20">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-center justify-between mb-10 fade-up">
                            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Continue reading</h2>
                            <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#C77F1F] transition-colors">
                                View all <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className={`grid gap-5 fade-up delay-100 ${relatedBlogs.length === 1 ? 'grid-cols-1 max-w-sm' : 'md:grid-cols-2'}`}>
                            {relatedBlogs.map((rb) => (
                                <Link key={rb.id} href={`/blog/${rb.slug}`} className="related-card group block">
                                    {rb.media?.[0] && (
                                        <div className="related-card-img">
                                            <img src={rb.media[0].original_url} alt={rb.title} />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C77F1F]">{rb.category?.name}</span>
                                            <span className="text-[#E5E7EB]">·</span>
                                            <span className="text-[11px] text-[#9CA3AF]">
                                                {new Date(rb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-[#0F172A] leading-snug mb-2 group-hover:text-[#C77F1F] transition-colors">
                                            {rb.title}
                                        </h3>
                                        {rb.description && <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">{rb.description}</p>}
                                        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C77F1F] group-hover:gap-2 transition-all">
                                            Read article <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA banner */}
            <section className="bg-[#0F172A] py-20">
                <div className="max-w-3xl mx-auto px-6 text-center fade-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/70 mb-6">
                        <div className="w-1.5 h-1.5 bg-[#C77F1F] rounded-full" />
                        Built for freelancers & agencies
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Stop juggling tools. Start winning clients.</h2>
                    <p className="text-[#94A3B8] mb-8 text-base leading-relaxed">Biondesk brings your leads, proposals, invoices, and projects into a single clean workspace.</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C77F1F] text-white font-semibold text-sm hover:bg-[#E8A33D] transition-colors"
                    >
                        Start for free <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#1E293B] bg-[#0F172A] py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-[#1E293B] border border-[#334155] rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#C77F1F] rounded-full" />
                        </div>
                        <span className="text-xs font-semibold text-white">Biondesk</span>
                    </div>
                    <div className="flex gap-6 text-xs font-medium text-[#64748B]">
                        <a href="#" className="hover:text-white transition-colors">Changelog</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                    <div className="text-[10px] text-[#475569] font-mono">System OK — © {new Date().getFullYear()}</div>
                </div>
            </footer>
        </div>
    );
}
