import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import FrontendNavbar from '@/components/frontend-navbar';

export default function Index({ blogs, categories, currentCategory }: { blogs: any, categories: any[], currentCategory: string | null }) {

    useEffect(() => {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.fade-up').forEach(el => {
            fadeObserver.observe(el);
        });

        return () => fadeObserver.disconnect();
    }, []);

    const featuredBlog = blogs.data.length > 0 ? blogs.data[0] : null;
    const regularBlogs = blogs.data.length > 1 ? blogs.data.slice(1) : [];

    return (
        <div className="font-sans relative bg-[#F6F7F9] text-[#12161F] min-h-screen selection:bg-[#C77F1F] selection:text-white">
            <Head title="Blog | Biondesk" />
            <style dangerouslySetInnerHTML={{ __html: `
                .fluid-transition { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                .fade-up.is-visible { opacity: 1; transform: translateY(0); }
                .delay-100 { transition-delay: 100ms; }
                .delay-200 { transition-delay: 200ms; }
                .bg-radial-glow { background-image: radial-gradient(circle at 50% 0%, rgba(199, 127, 31, 0.08) 0%, transparent 60%); }
            `}} />

            <FrontendNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-[#E4E6EB] bg-white">
                <div className="absolute top-0 w-full h-full bg-radial-glow pointer-events-none opacity-50"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#12161F] mb-6 leading-[1.1] fade-up">
                        Writing on independent work, <br className="hidden md:block" /> client management, and design.
                    </h1>
                    <p className="text-[#6B7280] max-w-2xl mx-auto text-lg fade-up delay-100">
                        Insights and field notes from building Biondesk and running service businesses. No fluff, just what works.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <div className="sticky top-14 z-40 bg-[#F6F7F9]/80 backdrop-blur-xl border-b border-[#E4E6EB] py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <Link
                        href="/blog"
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${!currentCategory ? 'bg-[#12161F] text-white border-[#12161F]' : 'bg-transparent text-[#6B7280] border-transparent hover:text-[#12161F] hover:bg-neutral-200/50'}`}
                    >
                        View all
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}`}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${currentCategory == cat.slug ? 'bg-[#12161F] text-white border-[#12161F]' : 'bg-transparent text-[#6B7280] border-transparent hover:text-[#12161F] hover:bg-neutral-200/50'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <section className="py-16 md:py-24 bg-[#F6F7F9] min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-6">
                    {featuredBlog && !currentCategory && (
                        <Link href={`/blog/${featuredBlog.slug}`} className="group block mb-24 fade-up">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                                <div className="w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] bg-white border border-[#E4E6EB] rounded-2xl overflow-hidden relative shadow-sm transition-transform duration-500 group-hover:scale-[1.01]">
                                    {featuredBlog.media && featuredBlog.media.length > 0 ? (
                                        <img src={featuredBlog.media[0].original_url} alt={featuredBlog.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#F6F7F9] flex items-center justify-center">
                                            <div className="w-64 h-64 rounded-full border-4 border-[#C77F1F]/20 absolute -top-10 -left-10"></div>
                                            <div className="w-96 h-96 rounded-full border-2 border-[#C77F1F]/10 absolute -bottom-20 -right-10"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C77F1F] px-2 py-1 bg-white border border-[#E4E6EB] rounded-full">{featuredBlog.category?.name || 'Uncategorized'}</span>
                                        <span className="w-1 h-1 rounded-full bg-[#E4E6EB]"></span>
                                        <span className="text-xs text-[#6B7280] font-medium">{new Date(featuredBlog.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#12161F] mb-4 group-hover:text-[#C77F1F] transition-colors leading-[1.2]">
                                        {featuredBlog.title}
                                    </h2>
                                    <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">
                                        {featuredBlog.description || 'Read more about this topic...'}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center font-bold text-xs">
                                            {featuredBlog.author?.name?.charAt(0) || 'B'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-[#12161F]">{featuredBlog.author?.name || 'Biondesk Team'}</div>
                                            <div className="text-[11px] font-medium text-[#6B7280]">Author</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Blog Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(currentCategory ? blogs.data : regularBlogs).map((blog: any, i: number) => (
                            <Link key={blog.id} href={`/blog/${blog.slug}`} className={`group flex flex-col fade-up delay-${Math.min(i * 100, 300)}`}>
                                <div className="w-full aspect-[3/2] bg-white border border-[#E4E6EB] rounded-xl mb-6 shadow-sm overflow-hidden relative">
                                    {blog.media && blog.media.length > 0 ? (
                                        <img src={blog.media[0].original_url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#F6F7F9]"></div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#12161F]">{blog.category?.name || 'Uncategorized'}</span>
                                    <span className="w-1 h-1 rounded-full bg-[#E4E6EB]"></span>
                                    <span className="text-[11px] text-[#6B7280] font-medium">{new Date(blog.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight mb-3 group-hover:text-[#C77F1F] transition-colors leading-[1.3] text-[#12161F]">
                                    {blog.title}
                                </h3>
                                <p className="text-[#6B7280] text-sm leading-relaxed mb-4 line-clamp-2">
                                    {blog.description}
                                </p>
                                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-[#E4E6EB]/50">
                                    <span className="text-xs font-medium text-[#12161F]">Read article</span>
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#E4E6EB] bg-white py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-white border border-[#E4E6EB] shadow-sm rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#C77F1F] rounded-full"></div>
                        </div>
                        <span className="text-xs font-semibold text-[#12161F]">Biondesk</span>
                    </div>
                    <div className="flex gap-6 text-xs font-medium text-[#6B7280]">
                        <a href="#" className="hover:text-[#12161F] transition-colors">Changelog</a>
                        <a href="#" className="hover:text-[#12161F] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[#12161F] transition-colors">Terms</a>
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-mono">
                        System OK — &copy; {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
}
