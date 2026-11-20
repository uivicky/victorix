import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  const schemaItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://victorixglobal.vercel.app',
    },
    ...items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 2,
      name: item.label,
      item: item.path ? `https://victorixglobal.vercel.app${item.path.startsWith('/') ? item.path : `/${item.path}`}` : undefined,
    })),
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-1 hover:text-white transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5 text-[#8B45FF]" />
        <span>Home</span>
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
          {item.active || !item.path ? (
            <span className="text-[#B68AFF] font-medium truncate max-w-[200px] sm:max-w-none">
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(item.path!)}
              className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
