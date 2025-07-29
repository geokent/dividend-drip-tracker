-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image_url TEXT,
  author_id UUID NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[]
);

-- Create index for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts
CREATE POLICY "Published blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authors can view their own blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Authors can create their own blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.ensure_blog_post_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = public.generate_slug(NEW.title);
    
    -- Ensure uniqueness by appending number if needed
    WHILE EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug = public.generate_slug(NEW.title) || '-' || extract(epoch from now())::integer;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_blog_post_slug_trigger
BEFORE INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_blog_post_slug();