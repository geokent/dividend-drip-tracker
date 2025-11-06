import { useEffect } from 'react';

export function OrganizationSchema() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "name": "DivTrkr",
      "description": "Track your dividend income, monitor portfolio performance, and build passive wealth with comprehensive dividend tracking platform",
      "url": "https://www.divtrkr.com",
      "logo": "https://www.divtrkr.com/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png",
      "sameAs": [
        "https://twitter.com/divtrkr",
        "https://facebook.com/divtrkr"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@divtrkr.com"
      },
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Dividend Tracking Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Dividend Portfolio Tracking",
              "description": "Track dividend income, monitor yields, and analyze portfolio performance"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Investment Account Sync",
              "description": "Automatically sync holdings from major brokerages"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Dividend Income Projections",
              "description": "Forecast future dividend income based on portfolio growth"
            }
          }
        ]
      }
    };

    // Remove any existing organization schema
    const existingScript = document.querySelector('script[data-organization-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new organization schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-organization-schema', 'true');
    script.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-organization-schema]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}
