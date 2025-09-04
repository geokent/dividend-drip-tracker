import { Header } from '@/components/Header';
import { BlogList } from '@/components/BlogList';

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container section-y">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Dividend Investing Blog</h1>
          <p className="text-lg text-muted-foreground">
            Learn about dividend investing, portfolio strategies, and financial independence
          </p>
        </div>
        <BlogList />
      </main>
    </div>
  );
}