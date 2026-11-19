import React, { useState, useEffect } from 'react';
import { BLOG_POSTS as INITIAL_POSTS, BRAND_INFO } from '../data/agencyData';
import { ArrowRight, Clock, User, Search, BookOpen } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';
import { BlogPost } from '../types';

interface BlogPageProps {
  onSelectPost: (slug: string) => void;
  onNavigate: (page: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost, onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.blogs && data.blogs.length > 0) {
          setPosts(data.blogs);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch live blogs, using fallback data:', err);
      });
  }, []);

  const categories = ['All', 'Guides', 'Pricing', 'Technology', 'SEO', 'Performance', 'Education', 'Ecommerce'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Engineering & SEO Blog – Web Development Guides & Cost Analysis"
        description="Actionable web development guides, technical SEO checklists, and website pricing analyses authored by Vicky Vishwakarma and the VICTORIX team."
        canonicalPath="/blog"
      />

      <Breadcrumb
        items={[{ label: 'Engineering Blog', active: true }]}
        onNavigate={onNavigate}
      />

      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-bold">
          Knowledge &amp; Engineering
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Website Engineering &amp; Growth Insights.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          Honest, technical, and practical articles on website performance, search visibility, cost expectations in India, and building digital assets that actually convert.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-y border-white/5 py-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides, SEO, costs..."
            className="w-full bg-[#101014] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8B45FF]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#8B45FF] text-white'
                  : 'bg-[#101014] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="group rounded-2xl bg-[#0d0d12] border border-white/10 hover:border-[#8B45FF]/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_35px_rgba(139,69,255,0.1)] cursor-pointer"
            onClick={() => onSelectPost(post.slug)}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8B45FF]/15 text-[#B68AFF] font-mono text-[11px] font-semibold">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-[#8B45FF]" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="text-xl font-display font-bold text-white group-hover:text-[#B68AFF] transition-colors leading-snug mb-3">
                {post.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-medium text-[11px]">{post.author}</span>
              </div>

              <div className="inline-flex items-center gap-1 text-[#B68AFF] font-semibold text-xs group-hover:translate-x-1 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
