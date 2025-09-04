import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BlogList } from '@/components/BlogList';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  return (
    <AppLayout>
      <PageHeader
        title="Dividend Investing Blog"
        description="Learn about dividend investing, portfolio strategies, and financial independence"
        icon={BookOpen}
      />
      <BlogList />
    </AppLayout>
  );
}