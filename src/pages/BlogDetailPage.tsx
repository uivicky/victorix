import React, { useState, useEffect } from 'react';
import { BLOG_POSTS as INITIAL_POSTS, BRAND_INFO } from '../data/agencyData';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageCircle,
  Share2,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  ArrowRight,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';
import { BlogPost } from '../types';

interface BlogDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onNavigate: (page: string, slug?: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  slug,
  onBack,
  onSelectPost,
  onNavigate,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.blogs) {
          setPosts(data.blogs);
        }
      })
      .catch((err) => {
        console.warn('Fallback to bundled posts:', err);
      });
  }, []);

  const post = posts.find((p) => p.slug === slug) || posts[0];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.author === 'Vicky Vishwakarma' ? 'Founder & Lead Architect' : 'Team Member',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VICTORIX',
      url: 'https://victorixglobal.vercel.app',
    },
    datePublished: '2025-01-15T08:00:00+05:30',
    dateModified: post.updatedAt || '2025-03-01T10:00:00+05:30',
    mainEntityOfPage: `https://victorixglobal.vercel.app/blog/${post.slug}`,
  };

  const relatedPosts = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEOHead
        title={post.seoTitle || `${post.title} – VICTORIX Blog`}
        description={post.seoDescription || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        schema={articleSchema}
      />

      <Breadcrumb
        items={[
          { label: 'Engineering Blog', path: 'blog' },
          { label: post.title, active: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog Articles</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#8B45FF]/15 text-[#B68AFF] font-mono font-semibold">
            {post.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center gap-1 text-gray-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#8B45FF]" />
            {post.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        {/* Author Byline */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B45FF] to-[#B68AFF] flex items-center justify-center text-white font-bold text-sm">
              {post.author[0]}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{post.author}</p>
              <p className="text-[11px] text-gray-400">VICTORIX Engineering</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-mono">Published {post.date}</div>
        </div>
      </header>

      {/* Article Markdown Content */}
      <div className="prose prose-invert max-w-none text-gray-300 text-sm sm:text-base leading-relaxed space-y-6">
        {post.content
          .trim()
          .split('\n\n')
          .map((block, idx) => {
            const clean = block.trim();
            if (clean.startsWith('### ')) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-display font-bold text-white pt-6 border-t border-white/5"
                >
                  {clean.replace('### ', '')}
                </h2>
              );
            }
            if (clean.startsWith('#### ')) {
              return (
                <h3 key={idx} className="text-xl font-display font-semibold text-[#B68AFF] pt-4">
                  {clean.replace('#### ', '')}
                </h3>
              );
            }
            if (clean.startsWith('- ')) {
              const items = clean.split('\n- ');
              return (
                <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-[#8B45FF]">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{clean}</p>;
          })}
      </div>

      {/* Internal Link Suggestions */}
      <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-3">
        <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Related Services &amp; Live Proof</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => onNavigate('service-detail', 'website-development')}
            className="p-3 rounded-xl bg-[#101014] hover:bg-white/5 text-left border border-white/5 flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#B68AFF]">Website Development</p>
              <p className="text-[11px] text-gray-400">Custom Next.js &amp; Tailwind architecture</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </button>
          <button
            onClick={() => onNavigate('case-study-little-world-school')}
            className="p-3 rounded-xl bg-[#101014] hover:bg-white/5 text-left border border-white/5 flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-white group-hover:text-[#B68AFF]">Little World School Case Study</p>
              <p className="text-[11px] text-gray-400">Verified live deployment proof</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Author Bio Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101014] border border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B45FF]/20 text-[#B68AFF] flex items-center justify-center font-display font-bold text-lg">
            {post.author.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h4 className="text-base font-display font-bold text-white">Written by {post.author}</h4>
            <p className="text-xs text-gray-400">Core Team Member at VICTORIX</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          At VICTORIX, we believe software engineering should be transparent and measurable. Have a question about implementing these principles on your site?
        </p>
        <a
          href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
            `Hi ${post.author.split(' ')[0]}, I read your article "${post.title}" on the VICTORIX blog and had a question.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Discuss with {post.author.split(' ')[0]} on WhatsApp</span>
        </a>
      </div>

      {/* Related Articles */}
      <div className="pt-8 border-t border-white/10 space-y-6">
        <h3 className="text-xl font-display font-bold text-white">More From Our Engineering Desk</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedPosts.map((rel) => (
            <button
              key={rel.id}
              onClick={() => onSelectPost(rel.slug)}
              className="text-left p-5 rounded-xl bg-[#0d0d12] hover:bg-[#14141c] border border-white/5 transition-colors space-y-2 group"
            >
              <span className="text-[10px] font-mono text-[#B68AFF]">{rel.category}</span>
              <p className="text-sm font-display font-bold text-white group-hover:text-[#B68AFF] transition-colors leading-snug">
                {rel.title}
              </p>
              <p className="text-xs text-gray-400 line-clamp-2">{rel.excerpt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
