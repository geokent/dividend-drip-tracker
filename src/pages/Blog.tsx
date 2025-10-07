import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BlogList } from '@/components/BlogList';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  return (
    <AppLayout>
      <SEOHead
        title="Dividend Investing Blog | Tips, Strategies & Portfolio Guides"
        description="Expert dividend investing advice, portfolio strategies, and wealth-building tips. Learn about dividend stocks, FIRE movement, tax optimization, and building passive income."
        keywords="dividend blog, dividend investing tips, passive income strategies, FIRE movement, dividend portfolio, investment blog"
        canonicalUrl="https://www.divtrkr.com/blog"
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <PageHeader
          title="Dividend Investing Blog"
          description="Learn about dividend investing, portfolio strategies, and financial independence"
          icon={BookOpen}
        />
        <BlogList />
      </div>
    </AppLayout>
  );
}