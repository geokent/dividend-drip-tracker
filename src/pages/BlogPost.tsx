import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEOHead } from '@/components/SEOHead';
import { ArticleSchema } from '@/components/ArticleSchema';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { toast } from 'sonner';

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
  content?: string;
  author: {
    display_name: string;
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Social sharing functions
  const shareUrl = `https://www.divtrkr.com/blog/${slug}`;
  
  const handleShare = (platform: string) => {
    const text = post?.title || '';
    let url = '';
    
    switch(platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          author: { display_name: data.author?.display_name || 'DivTrkr Team' }
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
              content,
              author:profiles(display_name)
            `)
            .eq('status', 'published')
            .neq('id', data.id)
            .overlaps('tags', data.tags)
            .limit(2);
          
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
        <SEOHead
          title="Post Not Found | DivTrkr Blog"
          description="This blog post could not be found."
          noIndex={true}
        />
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const canonicalUrl = `https://www.divtrkr.com/blog/${post.slug}`;

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.title }
            ]} 
          />
        </div>
        
        <article className="max-w-4xl mx-auto mt-6">
          {/* Featured Image with Overlay */}
          {post.featured_image_url && (
            <div className="relative w-full h-[500px] overflow-hidden rounded-2xl mb-8 shadow-elevated">
              <img 
                src={post.featured_image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {post.author?.display_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {post.author?.display_name || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {calculateReadingTime(post.content)} min read
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Social Sharing */}
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t">
              <span className="text-sm text-muted-foreground mr-2">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">Twitter</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="gap-2"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="gap-2"
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline">Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy')}
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-16
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-6 prose-ol:my-6
              prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
              prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Newsletter CTA */}
          <div className="my-16">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Stay Updated on Dividend Investing</h3>
                <p className="text-muted-foreground mb-6">
                  Get the latest dividend tips, portfolio strategies, and financial independence insights delivered to your inbox.
                </p>
                <NewsletterSignup />
              </CardContent>
            </Card>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-16 border-t">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-elevated transition-all duration-300 group-hover:scale-[1.02]">
                      <CardContent className="p-0">
                        {relatedPost.featured_image_url && (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img 
                              src={relatedPost.featured_image_url} 
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h3>
                          {relatedPost.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {relatedPost.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{calculateReadingTime(relatedPost.content || '')} min read</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-elevated z-50"
            size="icon"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
