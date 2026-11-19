import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { CaseStudyDetailPage } from './pages/CaseStudyDetailPage';
import { PricingPage } from './pages/PricingPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MumbaiLocationPage } from './pages/MumbaiLocationPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [activeServiceSlug, setActiveServiceSlug] = useState<string>('website-development');
  const [activeCaseStudyId, setActiveCaseStudyId] = useState<string>('little-world-school');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string>('how-to-choose-a-professional-website-developer');

  // Handle URL hash routing on initial load and popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) {
        setActivePage('home');
        return;
      }

      if (hash.startsWith('service/')) {
        const slug = hash.replace('service/', '');
        setActiveServiceSlug(slug);
        setActivePage('service-detail');
      } else if (hash.startsWith('blog/')) {
        const slug = hash.replace('blog/', '');
        setActiveBlogSlug(slug);
        setActivePage('blog-detail');
      } else if (hash === 'little-world-school' || hash === 'case-study-little-world-school') {
        setActiveCaseStudyId('little-world-school');
        setActivePage('case-study');
      } else if (hash === 'fixdesk' || hash === 'case-study-fixdesk') {
        setActiveCaseStudyId('fixdesk');
        setActivePage('case-study');
      } else if (hash === 'it-support' || hash === 'case-study-it-support') {
        setActiveCaseStudyId('it-support');
        setActivePage('case-study');
      } else if (hash === 'mumbai' || hash === 'mumbai-location' || hash === 'website-developer-mumbai') {
        setActivePage('mumbai');
      } else if (
        ['home', 'about', 'services', 'portfolio', 'pricing', 'blog', 'contact', 'admin', 'privacy-policy', 'terms'].includes(
          hash
        )
      ) {
        setActivePage(hash);
      } else {
        setActivePage('not-found');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activePage changes
  const handlePageChange = (page: string, extraSlug?: string) => {
    setActivePage(page);
    if (page === 'home') {
      window.location.hash = '';
    } else if (page === 'service-detail') {
      const s = extraSlug || activeServiceSlug;
      setActiveServiceSlug(s);
      window.location.hash = `service/${s}`;
    } else if (page === 'case-study') {
      const cs = extraSlug || activeCaseStudyId;
      setActiveCaseStudyId(cs);
      window.location.hash = cs;
    } else if (page === 'case-study-little-world-school') {
      setActiveCaseStudyId('little-world-school');
      setActivePage('case-study');
      window.location.hash = 'little-world-school';
    } else if (page === 'case-study-fixdesk') {
      setActiveCaseStudyId('fixdesk');
      setActivePage('case-study');
      window.location.hash = 'fixdesk';
    } else if (page === 'case-study-it-support') {
      setActiveCaseStudyId('it-support');
      setActivePage('case-study');
      window.location.hash = 'it-support';
    } else if (page === 'blog-detail') {
      const b = extraSlug || activeBlogSlug;
      setActiveBlogSlug(b);
      window.location.hash = `blog/${b}`;
    } else if (page === 'mumbai' || page === 'mumbai-location') {
      setActivePage('mumbai');
      window.location.hash = 'website-developer-mumbai';
    } else {
      window.location.hash = page;
    }
  };

  const handleSelectService = (slug: string) => {
    setActiveServiceSlug(slug);
    setActivePage('service-detail');
    window.location.hash = `service/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCaseStudy = (caseStudyId: string) => {
    setActiveCaseStudyId(caseStudyId);
    setActivePage('case-study');
    window.location.hash = caseStudyId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (slug: string) => {
    setActiveBlogSlug(slug);
    setActivePage('blog-detail');
    window.location.hash = `blog/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#8B45FF] selection:text-white">
      {/* Global Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        activeServiceSlug={activeServiceSlug}
        setActiveServiceSlug={setActiveServiceSlug}
      />

      {/* Main Page Content Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={handlePageChange}
            setActiveServiceSlug={handleSelectService}
          />
        )}

        {activePage === 'about' && <AboutPage />}

        {activePage === 'services' && (
          <ServicesPage onSelectService={handleSelectService} />
        )}

        {activePage === 'service-detail' && (
          <ServiceDetailPage
            slug={activeServiceSlug}
            onBack={() => handlePageChange('services')}
            onNavigateToCaseStudy={handleSelectCaseStudy}
            onNavigate={handlePageChange}
          />
        )}

        {activePage === 'portfolio' && (
          <PortfolioPage onSelectCaseStudy={handleSelectCaseStudy} />
        )}

        {(activePage === 'case-study' ||
          activePage === 'case-study-little-world-school' ||
          activePage === 'case-study-fixdesk' ||
          activePage === 'case-study-it-support') && (
          <CaseStudyDetailPage
            projectId={
              activePage === 'case-study-little-world-school'
                ? 'little-world-school'
                : activePage === 'case-study-fixdesk'
                ? 'fixdesk'
                : activePage === 'case-study-it-support'
                ? 'it-support'
                : activeCaseStudyId
            }
            onBack={() => handlePageChange('portfolio')}
            onSelectCaseStudy={handleSelectCaseStudy}
            onNavigate={handlePageChange}
          />
        )}

        {activePage === 'pricing' && <PricingPage />}

        {activePage === 'blog' && (
          <BlogPage onSelectPost={handleSelectPost} onNavigate={handlePageChange} />
        )}

        {activePage === 'blog-detail' && (
          <BlogDetailPage
            slug={activeBlogSlug}
            onBack={() => handlePageChange('blog')}
            onSelectPost={handleSelectPost}
            onNavigate={handlePageChange}
          />
        )}

        {activePage === 'contact' && <ContactPage />}

        {activePage === 'mumbai' && (
          <MumbaiLocationPage onNavigate={handlePageChange} />
        )}

        {activePage === 'privacy-policy' && (
          <PrivacyPolicyPage onBack={() => handlePageChange('home')} />
        )}

        {activePage === 'terms' && (
          <TermsPage onBack={() => handlePageChange('home')} />
        )}

        {activePage === 'admin' && <AdminDashboard />}

        {activePage === 'not-found' && (
          <NotFoundPage onNavigate={handlePageChange} />
        )}
      </main>

      {/* Global Footer (shown on all views) */}
      <Footer
        setActivePage={handlePageChange}
        setActiveServiceSlug={handleSelectService}
      />

      {/* WhatsApp Floating Action Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
