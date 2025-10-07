import { useEffect } from 'react';

interface ArticleSchemaProps {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  imageUrl?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  author,
  publishedDate,
  modifiedDate,
  imageUrl,
  url
}: ArticleSchemaProps) {
  useEffect(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Person",
        "name": author
      },
      "datePublished": publishedDate,
      "dateModified": modifiedDate || publishedDate,
      ...(imageUrl && {
        "image": imageUrl
      }),
      "url": url,
      "publisher": {
        "@type": "Organization",
        "name": "DivTrkr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.divtrkr.com/favicon.ico"
        }
      }
    };

    // Remove any existing article schema
    const existingScript = document.querySelector('script[data-article-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new article schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-article-schema', 'true');
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-article-schema]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, author, publishedDate, modifiedDate, imageUrl, url]);

  return null;
}
