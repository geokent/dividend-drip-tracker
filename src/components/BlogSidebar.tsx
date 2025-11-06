import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { TrendingUp, Tag } from "lucide-react";

export function BlogSidebar() {
  // Fetch popular posts (most recent 5)
  const { data: popularPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["popularBlogPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Fetch all tags with counts
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["blogTags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("tags")
        .eq("status", "published");

      if (error) throw error;

      // Count tags
      const tagCounts = new Map<string, number>();
      data.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag: string) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      // Convert to array and sort by count
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  return (
    <aside className="space-y-6">
      {/* Popular Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popular Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {popularPosts?.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm hover:text-primary transition-colors line-clamp-2"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Categories/Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tagsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-7 w-20" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags?.map(({ tag, count }) => (
                <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    {tag} ({count})
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
