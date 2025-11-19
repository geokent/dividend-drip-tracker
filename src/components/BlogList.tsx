import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  published_at: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
  profiles: {
    display_name: string | null;
  } | null;
}

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            excerpt,
            slug,
            published_at,
            featured_image_url,
            tags,
            profiles!blog_posts_author_id_fkey (
              display_name
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) throw error;
        
        // Transform data to match interface
        const transformedData = data?.map(post => ({
          ...post,
          profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
        })) || [];
        
        setPosts(transformedData);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
        <p className="text-muted-foreground">Check back soon for dividend investing insights!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {post.featured_image_url && (
            <div className="h-48 overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2 leading-snug">
              <Link 
                to={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
              {post.profiles?.display_name && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {post.profiles.display_name}
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.published_at), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to={`/blog/${post.slug}`}>
                <Clock className="h-4 w-4 mr-2" />
                Read More
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}