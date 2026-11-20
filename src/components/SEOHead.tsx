import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  schema?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  schema,
}) => {
  useEffect(() => {
    // Dynamic page title
    document.title = title.includes('VICTORIX') ? title : `${title} | VICTORIX`;

    // Dynamic meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', description);
      document.head.appendChild(metaDesc);
    }

    // Dynamic OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', document.title);
    }

    // Dynamic OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }

    // Dynamic OG Type
    let ogTypeEl = document.querySelector('meta[property="og:type"]');
    if (ogTypeEl) {
      ogTypeEl.setAttribute('content', ogType);
    }

    // Dynamic Canonical & OG URL
    const normalizedPath = canonicalPath
      ? canonicalPath.startsWith('/')
        ? canonicalPath
        : `/${canonicalPath}`
      : '/';
    const currentUrl = `https://victorixglobal.vercel.app${normalizedPath}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentUrl);
    }
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    }

    // Dynamic JSON-LD Schema if provided
    let dynamicScript = document.getElementById('victorix-dynamic-schema');
    if (schema) {
      if (!dynamicScript) {
        dynamicScript = document.createElement('script');
        dynamicScript.id = 'victorix-dynamic-schema';
        dynamicScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(dynamicScript);
      }
      dynamicScript.textContent = JSON.stringify(schema);
    } else if (dynamicScript) {
      dynamicScript.remove();
    }
  }, [title, description, canonicalPath, ogType, schema]);

  return null;
};
