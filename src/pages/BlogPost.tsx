import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEOHead } from '@/components/SEOHead';
import { ArticleSchema } from '@/components/ArticleSchema';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published_at: string;
  featured_image_url: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  author: {
    display_name: string;
  };
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  featured_image_url: string | null;
  tags: string[] | null;
  author: {
    display_name: string;
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles(display_name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
      } else if (data) {
        setPost({
          ...data,
          author: data.author as { display_name: string }
        });
        
        // Fetch related posts with same tags
        if (data.tags && data.tags.length > 0) {
          const { data: related } = await supabase
            .from('blog_posts')
            .select(`
              id,
              title,
              excerpt,
              slug,
              published_at,
              featured_image_url,
              tags,
              author:profiles(display_name)
            `)
            .eq('status', 'published')
            .neq('id', data.id)
            .overlaps('tags', data.tags)
            .limit(3);
          
          if (related) {
            setRelatedPosts(related.map(p => ({
              ...p,
              author: Array.isArray(p.author) ? p.author[0] : p.author
            })) as RelatedPost[]);
          }
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const canonicalUrl = `https://divtrkr.lovable.app/blog/${post.slug}`;

  return (
    <AppLayout>
      <SEOHead
        title={post.meta_title || `${post.title} | DivTrkr Blog`}
        description={post.meta_description || post.excerpt}
        keywords={post.tags?.join(', ') || 'dividend investing, passive income'}
        canonicalUrl={canonicalUrl}
        ogImage={post.featured_image_url || undefined}
      />
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        author={post.author.display_name}
        publishedDate={post.published_at}
        imageUrl={post.featured_image_url || undefined}
        url={canonicalUrl}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.title }
          ]} 
        />
        
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.display_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </time>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg mb-6"
              />
            )}
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow p-4">
                    {relatedPost.featured_image_url && (
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
