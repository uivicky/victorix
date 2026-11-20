import { ProjectCaseStudy, ServiceItem, BlogPost, TeamMember } from '../types';

export const BRAND_INFO = {
  name: 'VICTORIX',
  tagline: 'AI FOR A BETTER TOMORROW',
  founder: 'Vicky Vishwakarma',
  whatsappNumber: '+91 6387661594',
  whatsappUrl: 'https://wa.me/916387661594',
  plannedDomain: 'victorixglobal.vercel.app',
  siteUrl: 'https://victorixglobal.vercel.app',
  location: 'Mumbai, India',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Vicky Vishwakarma',
    role: 'Founder & Lead Architect',
    bio: 'Directs website engineering, SEO architectures, and AI integration. Passionate about building fast, conversion-driven web solutions that solve tangible business problems.',
    focus: 'Full-Stack Architecture, Performance Engineering, SEO Systems & AI Integrations',
  },
  {
    name: 'Abhishek',
    role: 'Team Member & Web Specialist',
    bio: 'Specializes in modern frontend implementations, responsive interfaces, cross-browser optimization, and client implementation workflows.',
    focus: 'UI/UX Engineering, Mobile Responsiveness, Quality Assurance & Client Deployments',
  },
];

export const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: 'little-world-school',
    slug: 'little-world-school',
    title: 'Little World School',
    client: 'Little World Educational Institution',
    category: 'School Website Development',
    liveUrl: 'https://little-world-school.vercel.app/',
    tagline: 'Modern, Trust-Building Digital Campus & Admissions Portal',
    summary:
      'Engineered an intuitive, responsive, and high-performance digital presence for Little World School. The platform presents curriculum details, campus facilities, faculty highlights, and a streamlined admissions enquiry process designed to build parental trust.',
    challenge:
      'The school needed an informative, mobile-first web presence that parents could easily browse on any device to evaluate academic programs, download notices, and submit direct admission queries without friction.',
    solution:
      'Built a modern, ultra-fast web application with structured academic information, interactive campus galleries, event calendars, and instant WhatsApp inquiry routing directly to the school administrative desk.',
    technologies: ['React', 'Next.js Architecture', 'Tailwind CSS', 'Vercel Edge Network', 'Structured Schema.org'],
    keyFeatures: [
      'Comprehensive Curriculum & Grade Showcases',
      'Mobile-Optimized Admissions Enquiry Flow',
      'Instant Parent WhatsApp Connect',
      'Campus Infrastructure & Activity Highlights',
      'Sub-second page load times with 95+ Mobile Score',
    ],
    metrics: [
      { label: 'Mobile Performance', value: '98/100' },
      { label: 'Admissions Queries', value: 'Streamlined' },
      { label: 'Page Load Speed', value: '< 1.1s' },
      { label: 'Responsive Coverage', value: '100%' },
    ],
    accentColor: '#3B82F6',
  },
  {
    id: 'fixdesk',
    slug: 'fixdesk',
    title: 'FixDesk',
    client: 'FixDesk IT & Device Solutions',
    category: 'Business & Service Platform',
    liveUrl: 'https://fixdesk-3.vercel.app/',
    tagline: 'High-Conversion On-Demand Repair & IT Support Portal',
    summary:
      'Developed a modern digital service hub for FixDesk, allowing individuals and businesses to diagnose hardware/software problems, check upfront repair pricing, and request immediate service technicians.',
    challenge:
      'FixDesk required a high-trust digital storefront that simplified technical service options for non-technical users while converting urgent repair searchers into direct WhatsApp consultations within seconds.',
    solution:
      'Constructed a streamlined, high-contrast user interface with service category breakdowns, diagnostic request questionnaires, transparent turnaround expectations, and direct WhatsApp dispatch integration.',
    technologies: ['React', 'Modern TypeScript', 'Tailwind CSS', 'Micro-interactions', 'Vercel Deployment'],
    keyFeatures: [
      'Interactive Service & Repair Catalog',
      'Urgent Diagnostic Problem Selector',
      'Direct WhatsApp Booking Pipeline',
      'Transparent Process & Warranty Information',
      'Fully Responsive Dark/Light UI Experience',
    ],
    metrics: [
      { label: 'Interaction Speed', value: '< 80ms' },
      { label: 'Lead Conversion Path', value: '2 Clicks' },
      { label: 'Mobile Usability', value: '100%' },
      { label: 'SEO Architecture', value: 'Fully Structured' },
    ],
    accentColor: '#8B45FF',
  },
  {
    id: 'it-support',
    slug: 'it-support',
    title: 'IT SUPPORT – Your Complete IT Troubleshooting Guide',
    client: 'Internal / Independent Web Platform (No external client claimed)',
    category: 'IT Knowledge Base & Interactive Learning Web App',
    liveUrl: 'https://it-support-engg.vercel.app/',
    tagline: 'Interactive IT Troubleshooting Runbooks, Simulators, CLI Trainer & AI Assistant',
    summary:
      'Designed and deployed by Vicky Vishwakarma (credited as VICKY VICTORIX on the live site), IT SUPPORT is a public dark-themed IT troubleshooting web application covering 325+ structured issues across Windows 10/11, Networking, Active Directory, Microsoft 365, Linux, and Azure, paired with networking utilities, an interactive IT simulator, 3D Quick Desk, commands trainer, and IT SUPPORT AI.',
    challenge:
      'Aspiring IT support engineers and helpdesk technicians often face fragmented guides without hands-on ticket workflows, CLI command practice, or structured troubleshooting steps across Windows, Active Directory, networking, and cloud platforms.',
    solution:
      'Built a unified, dark-mode responsive web platform organized into focused troubleshooting categories, search-indexed issue runbooks (`/issues`), interactive ticket simulator (`/simulator`), 3D Quick Desk (`/quick-desk`), networking tools (`/networking-tools`), commands trainer (`/commands`), quizzes, learning roadmap, and an integrated IT SUPPORT AI assistant (`/ai-assistant`).',
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS (Dark UI)',
      'Vercel Hosting',
      'Schema.org JSON-LD',
      'Google Tag Manager',
    ],
    keyFeatures: [
      '325+ Structured Troubleshooting Guides across Windows, Networking, AD, M365, Linux & Azure',
      'IT SUPPORT AI Assistant with Troubleshooting & Tutor Modes (/ai-assistant)',
      'Real-World IT Ticket Simulator (/simulator) & 3D Quick Desk (/quick-desk)',
      'CLI Commands Trainer (/commands) & Subnet / Networking Tools (/networking-tools)',
      'Quizzes, Daily Challenges, Interview Prep & IT Career Roadmap',
      'SEO Structured Metadata (WebSite SearchAction & Organization Schema.org JSON-LD)',
    ],
    metrics: [
      { label: 'Published Runbooks', value: '325+ Issues' },
      { label: 'Observed Tech', value: 'React + TS' },
      { label: 'Live Deployment', value: 'Vercel CDN' },
      { label: 'Traffic / Outcomes', value: 'Not Confirmed' },
    ],
    verifiedProjectDetails: [
      'Live URL https://it-support-engg.vercel.app/ verified active (HTTP 200 on Vercel).',
      'Live page title, meta description, and Schema.org JSON-LD confirm 325+ troubleshooting guides across Windows, Networking, Active Directory, Microsoft 365, Linux, and Azure.',
      'Observed client routes and interactive modules: /issues, /ai-assistant, /simulator, /quick-desk, /learning-lab, /commands, /networking-tools, /challenges, /interview-questions, /roadmap, and /beginners.',
      'Live site UI explicitly credits VICKY VICTORIX (Website Designer & Developer) and states "Responsive React & TypeScript architecture with 325+ structured runbooks."',
      'Embedded WebSite + Organization Schema.org JSON-LD, canonical URL tag, and Google Tag Manager container confirmed in live HTML source.',
    ],
    unconfirmedDetails: [
      'No third-party corporate client contract or external organization ownership is claimed or confirmed.',
      'Monthly visitor traffic, Google Search rankings, revenue, and user adoption statistics are not publicly verified and are not fabricated.',
      'User testimonials, review ratings, and backend AI infrastructure/API details outside the public client bundle are not independently verified.',
    ],
    accentColor: '#27D3F0',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'website-development',
    slug: 'website-development',
    title: 'Website Development',
    shortDesc: 'Modern, responsive, custom-coded websites built for high speed, search visibility, and real customer conversions.',
    fullDesc:
      'We design and build clean, custom websites from the ground up without bloated page builders. Every line of code is optimized for search engines, mobile responsiveness, fast Core Web Vitals, and effortless user interaction.',
    iconName: 'Globe',
    benefits: [
      'No slow or bloated third-party themes',
      'Flawless responsiveness across phones, tablets, and desktops',
      'Optimized Core Web Vitals (LCP < 2.5s, CLS < 0.1)',
      'Custom branding aligned with your business identity',
    ],
    deliverables: [
      'Custom responsive design & frontend architecture',
      'High-speed deployment on global CDN',
      'Technical SEO audit & On-Page tag implementation',
      'Direct WhatsApp conversion integration',
    ],
    idealFor: 'Businesses and professionals who need a dependable, modern digital storefront that stands out from generic templates.',
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Vercel'],
    typicalTimeline: '1 to 2 Weeks',
  },
  {
    id: 'business-website-development',
    slug: 'business-website-development',
    title: 'Business Website Development',
    shortDesc: 'Credibility-building digital headquarters engineered to convert local and global visitors into paying clients.',
    fullDesc:
      'A business website is your highest-leverage sales asset. VICTORIX engineers business platforms that clearly articulate your value proposition, showcase social proof, answer prospect questions, and drive warm inbound leads directly to your WhatsApp.',
    iconName: 'Briefcase',
    benefits: [
      'Structured to guide prospects from curiosity to inquiry',
      'Local SEO setup for city and regional search discovery',
      'Clear service tiering, FAQs, and trust badges',
      'Zero maintenance headaches or plugin vulnerability risks',
    ],
    deliverables: [
      'Complete multi-page business architecture',
      'Lead qualification workflows & WhatsApp chat buttons',
      'Google Search Console & sitemap submission ready',
      'Company profile, founder showcase, and services catalog',
    ],
    idealFor: 'Service companies, consultants, agencies, clinics, and manufacturing firms seeking steady client inquiries.',
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Schema.org'],
    typicalTimeline: '2 to 3 Weeks',
  },
  {
    id: 'ecommerce-development',
    slug: 'ecommerce-development',
    title: 'Ecommerce Development',
    shortDesc: 'Lightning-fast product catalogs and shopping experiences built for maximum checkout completion and mobile sales.',
    fullDesc:
      'Slow online stores lose customers at every click. We engineer ultra-fast ecommerce interfaces with friction-free browsing, instant product filtering, clean visual galleries, and simplified order flows optimized for WhatsApp or gateway checkout.',
    iconName: 'ShoppingCart',
    benefits: [
      'Sub-second catalog browsing and instant image loads',
      'Mobile-first checkout optimized for Indian & international buyers',
      'Integrated WhatsApp order confirmation and inquiry flows',
      'Inventory management architecture tailored to your catalog',
    ],
    deliverables: [
      'Product catalog system with categories & variations',
      'Shopping cart & streamlined checkout',
      'Direct WhatsApp order placement button',
      'Product Schema markup for Google Rich Search Snippets',
    ],
    idealFor: 'Direct-to-consumer brands, boutiques, wholesale merchants, and retail businesses expanding online.',
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'REST API / PostgreSQL', 'Stripe / Razorpay'],
    typicalTimeline: '3 to 4 Weeks',
  },
  {
    id: 'school-website-development',
    slug: 'school-website-development',
    title: 'School Website Development',
    shortDesc: 'Trustworthy, organized digital campuses for schools, colleges, and training academies to attract and enroll students.',
    fullDesc:
      'Parents and students judge educational institutions by the clarity of their digital presence. Having built platforms like Little World School, we create organized, safe, and engaging school websites that handle admissions inquiries, notices, and academic showcases with complete ease.',
    iconName: 'GraduationCap',
    benefits: [
      'Simple navigation for parents, teachers, and prospective students',
      'Clear digital admission guidelines and downloadable forms',
      'Notice board, academic calendar, and photo gallery modules',
      'Direct WhatsApp routing to admissions coordinators',
    ],
    deliverables: [
      'Digital campus architecture inspired by Little World School',
      'Admissions inquiry capture flow',
      'Faculty profiles, achievements & infrastructure showcase',
      'High-speed, child-safe, mobile-friendly interface',
    ],
    idealFor: 'K-12 schools, international academies, coaching institutes, preschools, and vocational colleges.',
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'Vercel Edge', 'Educational Schema'],
    typicalTimeline: '2 to 3 Weeks',
  },
  {
    id: 'portfolio-website-development',
    slug: 'portfolio-website-development',
    title: 'Portfolio Website Development',
    shortDesc: 'Bespoke, high-impact personal brands and creative showcases for founders, architects, doctors, and freelancers.',
    fullDesc:
      'Elevate your professional reputation with a tailored personal website. We build minimalist, high-impact portfolios that highlight your best work, case studies, client results, and media features with unmistakable authority.',
    iconName: 'UserCheck',
    benefits: [
      'Distinguish yourself from competitors relying only on LinkedIn or PDF resumes',
      'Flawless interactive project galleries and case study writeups',
      'Fast loading to impress hiring managers, investors, and high-value clients',
      'Personal branding SEO for your individual name search',
    ],
    deliverables: [
      'Custom personal branding aesthetic',
      'In-depth case study template and project viewer',
      'Direct WhatsApp booking link for discovery calls',
      'Social proof & press mention sections',
    ],
    idealFor: 'Creative directors, consultants, freelance engineers, physicians, architects, and founders.',
    techStack: ['React', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
    typicalTimeline: '1 to 2 Weeks',
  },
  {
    id: 'ai-web-solutions',
    slug: 'ai-web-solutions',
    title: 'AI Web Solutions',
    shortDesc: 'Smart web applications embedded with conversational AI, automated client discovery, and workflow intelligence.',
    fullDesc:
      'VICTORIX integrates artificial intelligence into modern web apps to automate repetitive business tasks. From smart client recommendation engines and automated lead discovery to intelligent document summaries, we make AI practical and profitable.',
    iconName: 'Sparkles',
    benefits: [
      'Automate repetitive customer queries and lead triaging',
      'Incorporate modern Google Gemini AI models directly into your workflows',
      'Private internal dashboards with explainable metrics',
      'Enterprise-grade security without client-side API key leaks',
    ],
    deliverables: [
      'Custom AI pipeline integration (Google Gemini)',
      'Secure backend API proxy with rate limiting',
      'Automated data analysis and lead discovery tools',
      'Admin monitoring dashboard with performance tracking',
    ],
    idealFor: 'Forward-looking businesses wanting to leverage AI to cut operational overhead and capture more customers.',
    techStack: ['Node.js', '@google/genai', 'Express / Next.js', 'PostgreSQL', 'Tailwind CSS'],
    typicalTimeline: '3 to 5 Weeks',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-choose-a-professional-website-developer',
    title: 'How to Choose a Professional Website Developer for Your Business',
    excerpt: 'Key criteria to evaluate when hiring a web developer or agency in India. Avoid costly mistakes, hidden fees, and bloated templates.',
    readTime: '6 min read',
    date: 'March 2025',
    author: 'Vicky Vishwakarma',
    category: 'Guides',
    keywords: ['choose website developer', 'freelance web developer', 'hire web developer India', 'website development company'],
    content: `
### Why Choosing the Right Developer Defines Your Digital Growth

A website is often the very first interaction a prospect has with your business. Yet, thousands of business owners in India and worldwide make the mistake of choosing a web developer based solely on the lowest price tag. Within six months, they find themselves with a broken, slow, unranked site that produces zero inquiries.

When vetting a developer or agency, use this practical framework:

#### 1. Ask to Inspect Real, Live Projects
Do not settle for static Figma mockups or stock photos. Ask for live URLs that you can open on your own smartphone. 
- Does the page load in under two seconds?
- Are the navigation buttons easy to tap with one thumb?
- Is there a clear, working WhatsApp or direct contact option?

At VICTORIX, we point clients directly to verified live deployments like **Little World School** and **FixDesk** so they can see our engineering firsthand.

#### 2. Beware of Bloated WordPress Templates
Many budget freelancers install heavy commercial themes packed with 40+ plugins. While it looks complete on day one:
- Page load times frequently exceed 6 to 8 seconds.
- Plugin security vulnerabilities leave the database open to spam injection.
- Upgrading WordPress often crashes custom styling.

Modern businesses should opt for clean, custom-coded component architectures (such as React and Next.js) that remain stable, fast, and secure year after year.

#### 3. Verify Direct Communication Channels
Ensure you have direct access to the actual builder handling your code. At VICTORIX, founder Vicky Vishwakarma and team specialist Abhishek speak directly with every client over official WhatsApp (+91 6387661594), ensuring your requirements are implemented without bureaucratic delays.
    `,
  },
  {
    id: '2',
    slug: 'business-website-development-cost-in-india',
    title: 'Business Website Development Cost in India: Realistic Breakdown & What to Expect',
    excerpt: 'An honest, transparent guide to website pricing in India. Understand where your budget goes, from design to hosting and technical SEO.',
    readTime: '8 min read',
    date: 'March 2025',
    author: 'Vicky Vishwakarma',
    category: 'Pricing',
    keywords: ['website development cost in India', 'business website price', 'custom website development cost', 'web developer charges'],
    content: `
### Transparency in Website Pricing

One of the most frustrating aspects of building a website is encountering wild price disparities—some freelancers quote ₹5,000 while agencies quote ₹2,50,000 for what sounds like the same project.

Here is a realistic breakdown of what quality business website development actually costs in India, and what each tier delivers.

#### Tier 1: Budget Template Sites (₹5,000 - ₹12,000)
- **What you get:** Generic WordPress theme installed with demo content swapped out.
- **Hidden costs:** Slow shared hosting, annual plugin license renewals, security vulnerability risks.
- **Best for:** Personal hobby projects or temporary event flyers where speed and SEO do not matter.

#### Tier 2: Professional Custom Business Website (₹15,000 - ₹45,000)
- **What you get:** Custom responsive design, hand-crafted code (React/Next.js/Tailwind), sub-2-second load speed, mobile optimization, technical SEO meta tags, and official WhatsApp lead integration.
- **Outcome:** A dependable digital asset that ranks for local queries and converts visitors into paying customers.
- **This is VICTORIX's core sweet spot for small and medium enterprises.**

#### Tier 3: Complex Web Platforms & Custom Web Apps (₹50,000 - ₹1,50,000+)
- **What you get:** Custom database architectures (PostgreSQL), dynamic client portals, custom AI integrations, multi-role dashboards, and comprehensive automated workflows.
- **Best for:** Startups, institutions, and growing companies automating core business workflows.

To get a clear, itemized quote tailored to your exact scope, message Vicky on WhatsApp at +91 6387661594.
    `,
  },
  {
    id: '3',
    slug: 'why-every-business-needs-a-website',
    title: 'Why Every Business Needs a Modern Website in 2025 (Even If You Have Social Media)',
    excerpt: 'Relying exclusively on Instagram or Facebook leaves your business at the mercy of algorithms. Here is why an owned website is essential.',
    readTime: '5 min read',
    date: 'February 2025',
    author: 'Vicky Vishwakarma',
    category: 'Strategy',
    keywords: ['why business needs website', 'business website development', 'digital presence', 'website vs social media'],
    content: `
### Social Media Is Rented Land; Your Website Is Digital Real Estate

Many local business owners tell us: *"We already have an active Instagram page and a Google Business Profile—why do we need a website?"*

While social media channels are valuable for top-of-funnel awareness, relying solely on them carries severe operational risks:

#### 1. You Do Not Own the Audience
Social media algorithms constantly suppress organic business post reach to force ad spending. If an account is suspended or hacked, your entire customer acquisition pipeline vanishes overnight. Your website on your own domain (e.g., yourbusiness.in) is permanent, controlled real estate.

#### 2. High-Intent Buyers Search Google, Not Reels
When someone needs an urgent IT repair (like **FixDesk**) or a reputable school for their child (like **Little World School**), they turn to Google Search. Without an SEO-optimized website, your business does not exist for the highest-intent commercial queries in your city.

#### 3. Establish Instant Credibility
High-value clients will not wire payments or sign annual contracts based on a DM. A clean, professional website with transparent team information, documented case studies, and structured services establishes the trust needed to close larger deals.
    `,
  },
  {
    id: '4',
    slug: 'custom-website-development-vs-wordpress',
    title: 'Custom Website Development vs. WordPress: Which Is Better for Your Company?',
    excerpt: 'An unbiased technical comparison between custom React/Next.js architectures and traditional WordPress themes.',
    readTime: '7 min read',
    date: 'February 2025',
    author: 'Abhishek',
    category: 'Technology',
    keywords: ['custom website vs wordpress', 'custom website development', 'react vs wordpress', 'website speed comparison'],
    content: `
### The Battle of Web Technologies

Choosing the underlying technology for your website impacts your loading speed, maintenance overhead, and security for years to come.

| Factor | Custom React / Next.js (VICTORIX) | Traditional WordPress |
| :--- | :--- | :--- |
| **Page Speed** | Instant (sub-1s via Edge CDN) | Often 4-8s due to database queries & plugins |
| **Security** | Static/Pre-rendered, zero SQL injection surface | Frequent target for brute-force and plugin exploits |
| **Maintenance** | Zero maintenance; no plugin updates breaking styling | Requires weekly backups and plugin compatibility testing |
| **Mobile UX** | 100% bespoke micro-interactions | Rigid layouts constrained by theme templates |
| **SEO Flexibility**| Full programmatic control over Schema & HTML | Dependent on third-party SEO plugins |

#### When WordPress Makes Sense
If you are running a high-frequency news publication publishing 30 articles daily with dozens of non-technical contributors, WordPress's native admin panel is convenient.

#### When Custom Web Development Wins
For corporate websites, service agencies, school portals, and web applications where brand identity, speed, and reliability are paramount, custom development delivers superior ROI and zero ongoing maintenance stress.
    `,
  },
  {
    id: '5',
    slug: 'how-to-make-a-website-seo-friendly',
    title: 'How to Make a Website SEO-Friendly: The Technical Checklist That Actually Ranks',
    excerpt: 'Discover the technical SEO pillars that search engines demand in 2025: Schema markup, Core Web Vitals, canonical tags, and semantic HTML.',
    readTime: '9 min read',
    date: 'January 2025',
    author: 'Vicky Vishwakarma',
    category: 'SEO',
    keywords: ['how to make website seo friendly', 'technical SEO checklist', 'website developer in Mumbai', 'seo website development'],
    content: `
### What Does Google Actually Reward?

Google does not rank websites because of keyword stuffing or spam tricks. Modern search engines evaluate user experience, page speed, structural markup, and search intent alignment.

At VICTORIX, every site we produce adheres to this strict 6-point technical checklist:

#### 1. Semantic HTML Structure
Use valid semantic tags (\`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<footer>\`). Search crawlers parse semantic landmarks to identify your core content without ambiguity. Ensure each page has exactly one \`<h1>\` tag that clearly states the primary subject.

#### 2. JSON-LD Structured Data
Search engine bots are machines. When you embed Schema.org structured data in JSON-LD format, you tell Google explicitly:
- Who founded the company (Organization schema)
- What services are offered and at what terms (Service schema)
- Who authored the article and when it was updated (Article schema)
- How to navigate the site hierarchy (BreadcrumbList schema)

#### 3. Core Web Vitals Optimization
- **LCP (Largest Contentful Paint):** Must load in <= 2.5 seconds.
- **INP (Interaction to Next Paint):** Must respond to taps in <= 200ms.
- **CLS (Cumulative Layout Shift):** Must remain <= 0.1 so content does not jump around while loading.

#### 4. Canonical Tags & Clean URLs
Never let search engines index duplicate versions of your URLs (e.g., http vs https, www vs non-www). Include an explicit \`<link rel="canonical">\` tag on every public route.

#### 5. Mobile-First Indexing
Google crawls your website using a smartphone user agent. If your navigation breaks on a 375px mobile screen, your desktop rankings will plummet.
    `,
  },
  {
    id: '6',
    slug: 'what-makes-a-website-fast',
    title: 'What Makes a Website Fast? Inside VICTORIX’s Performance Architecture',
    excerpt: 'A deep dive into image optimization, code splitting, edge delivery, and how fast page speeds directly increase client inquiries.',
    readTime: '6 min read',
    date: 'January 2025',
    author: 'Vicky Vishwakarma',
    category: 'Performance',
    keywords: ['what makes website fast', 'website speed optimization', 'fast loading website', 'core web vitals'],
    content: `
### Speed Is Not a Luxury—It Is a Conversion Feature

Studies across global e-commerce and lead-generation websites consistently prove that every 100ms delay in page load reduces conversion rates by 7%. On mobile networks in India, slow sites cause visitors to bounce before the hero section even finishes rendering.

Here is how VICTORIX achieves 95+ PageSpeed scores:

#### 1. Modern Image Formats (WebP & AVIF)
Uncompressed PNGs and high-res JPEGs are the number one cause of slow websites. We convert all photography to modern WebP or AVIF formats, serving responsive \`srcset\` images that match the user's viewport.

#### 2. Zero Unnecessary JavaScript
Every kilobyte of JavaScript has to be downloaded, parsed, compiled, and executed by the mobile CPU. By using clean CSS and lean modern component libraries like Tailwind CSS and Lucide React, we keep initial bundle sizes minimal.

#### 3. Global Edge Caching (Vercel & Cloudflare CDN)
Instead of serving pages from a single slow server, your website is distributed to hundreds of edge data centers worldwide. When a user in Mumbai, Delhi, or London visits your site, the content is delivered from a server just miles away.
    `,
  },
  {
    id: '7',
    slug: 'school-website-development-guide',
    title: 'School Website Development Guide: Features Every Modern Educational Institution Needs',
    excerpt: 'How schools and academies can build trust with parents, streamline admissions, and showcase student achievements through their website.',
    readTime: '7 min read',
    date: 'December 2024',
    author: 'Vicky Vishwakarma',
    category: 'Education',
    keywords: ['school website development', 'school website developer in India', 'education website design', 'admissions website'],
    content: `
### The Digital Front Gate of Your School

When parents consider enrolling their children, they visit the school website before attending an open house. Based on our work building **Little World School**, here are the critical pillars every educational institution must implement:

#### 1. Friction-Free Admissions Enquiries
Do not bury admission guidelines under multiple PDF downloads. Present age criteria, fee structures, and required documents clearly on a dedicated Admissions page with a direct WhatsApp button to the school admissions desk.

#### 2. Transparent Academic & Co-Curricular Showcase
Highlight curriculum boards (CBSE, ICSE, State, IB), lab infrastructure, sports complexes, and extracurricular clubs through crisp, professional photo galleries.

#### 3. Instant Notice Board & Calendar
Parents need quick access to exam schedules, holiday notices, and emergency announcements. A fast, mobile-friendly notice board saves administrative staff countless phone calls.

#### 4. Safety and Fast Mobile Browsing
Over 85% of parents access school websites from smartphones. The website must load in under two seconds on 4G connections without disruptive popups or confusing menus.
    `,
  },
  {
    id: '8',
    slug: 'ecommerce-website-development-guide',
    title: 'Ecommerce Website Development Guide: From Product Catalog to WhatsApp Checkout',
    excerpt: 'Learn how modern direct-to-consumer businesses use conversational commerce and lightning-fast web catalogs to increase sales.',
    readTime: '8 min read',
    date: 'December 2024',
    author: 'Abhishek',
    category: 'Ecommerce',
    keywords: ['ecommerce website developer', 'ecommerce development in India', 'whatsapp checkout store', 'online shop development'],
    content: `
### Conversational Commerce Meets Ultra-Fast Catalogs

In India and emerging markets, the standard multi-step ecommerce checkout often results in 60-70% cart abandonment. Customers have questions about sizing, delivery times, and payment options that traditional product pages do not address.

#### The Power of WhatsApp-Assisted Checkout
By pairing an ultra-fast product catalog with an instant **"Order via WhatsApp"** button, merchants achieve significantly higher conversion rates:
- The customer clicks a product and taps "Buy on WhatsApp".
- A pre-formatted message is automatically generated: *"Hi, I want to order [Product Name] - Size: L - SKU: 104. Is this available for delivery to [Pincode]?"*
- Your sales team can answer questions, confirm order details, and send payment links directly.

#### Technical Pillars for Ecommerce Success
1. **Instant Search & Category Filters:** Shoppers should find products within three keystrokes.
2. **Product Schema Markup:** Enable Google to show product prices, stock status, and ratings directly in search results.
3. **Optimized Mobile Gallery:** High-resolution zoom without lag or freezing.
    `,
  },
];

export const FAQS = [
  {
    question: 'How much does a custom business website cost with VICTORIX?',
    answer:
      'Our Starter Business websites begin at ₹5,999 for fast, static, database-free websites hosted on Cloudflare Pages Free (zero compulsory monthly hosting bills). Multi-page business & SEO platforms start from ₹14,999, and custom AI or institutional platforms are quoted transparently upfront. Optional monthly maintenance starts at ₹999/month.',
  },
  {
    question: 'Do my client websites require expensive database or monthly server fees?',
    answer:
      'No. For businesses, clinics, schools, salons, and local shops, VICTORIX deploys clean static websites on Cloudflare Pages Free with free HTTPS, global CDN, and WhatsApp lead routing—no compulsory PostgreSQL or monthly server fees.',
  },
  {
    question: 'How long does it take to design and launch my website?',
    answer:
      'Starter static business websites launch in 3 to 5 days. Multi-page Growth websites typically complete in 1 to 2 weeks, and custom web applications take 2 to 4 weeks.',
  },
  {
    question: 'Do you guarantee first-page ranking on Google?',
    answer:
      'No honest, ethical developer can guarantee a #1 Google ranking or specific traffic numbers, as search engine algorithms evaluate hundreds of external and competitive factors. VICTORIX implements rigorous technical SEO, semantic Schema.org structured data, sub-2-second Core Web Vitals, XML sitemaps, and clean HTML architecture to maximize legitimate organic visibility.',
  },
  {
    question: 'Can I see real examples of websites you have built?',
    answer:
      'Yes, absolutely. You can visit live client deployments like Little World School (https://little-world-school.vercel.app/) and FixDesk (https://fixdesk-3.vercel.app/) to verify our code quality, responsive design, and speed firsthand.',
  },
  {
    question: 'Who will I be communicating with during the project?',
    answer:
      'You communicate directly with our core team—founder Vicky Vishwakarma and team member Abhishek—via official WhatsApp (+91 6387661594). There are no account managers or middlemen.',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Starter Business Static',
    tagline: 'Ideal for local shops, clinics, salons, restaurants, tutors & consultants',
    price: '₹5,999',
    timeline: '3-5 Days',
    features: [
      'Clean Single or 3-Page Static Architecture',
      'Zero Database & Zero Compulsory Hosting Cost',
      'Cloudflare Pages Free Global CDN + HTTPS Setup',
      'Mobile-First & Sub-Second Core Web Vitals',
      'Official WhatsApp Inquiry & Map Routing',
      'XML Sitemap, robots.txt & Basic Local SEO Schema',
      'Direct Ownership & Git Repository Handover',
    ],
    popular: false,
    cta: 'Start at ₹5,999',
  },
  {
    name: 'Growth Business & SEO',
    tagline: 'Multi-page digital headquarters engineered for local & national search visibility',
    price: '₹14,999',
    timeline: '7-12 Days',
    features: [
      'Up to 8 Custom Structured Static/SPA Pages',
      'Advanced Schema.org (Organization, Service, Breadcrumb)',
      'Dedicated Service & Location Landing Pages',
      'Google Search Console & GA4 Connection Setup',
      'Interactive Portfolio / Service Galleries',
      'Custom Lead Qualification & WhatsApp Routing',
      'Zero Plugin Bloat & Direct Code Ownership',
      '30 Days Post-Launch Technical Support',
    ],
    popular: true,
    cta: 'Choose Growth Plan',
  },
  {
    name: 'Custom / AI & Monthly Care',
    tagline: 'Institutional platforms, ecommerce catalogs, AI workflows & optional monthly maintenance',
    price: 'From ₹24,999',
    timeline: '2-4 Weeks',
    features: [
      'Everything in Growth Business & SEO',
      'School Admissions / Interactive Catalog Flows',
      'Optional Monthly Maintenance Plan (from ₹999/mo)',
      'Monthly SEO Health & PageSpeed Insights Reports',
      'Serverless / AI Workflow Integrations (Quota-Safe)',
      'Strict Security Hardening & Input Validation',
      'Priority Support with Vicky & Abhishek',
    ],
    popular: false,
    cta: 'Discuss Custom Scope',
  },
];

