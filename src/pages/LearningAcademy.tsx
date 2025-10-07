import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Target, Snowflake, Clock, Users, Star } from "lucide-react";
import { useEffect } from "react";

// SEO metadata
const seoData = {
  title: "Learning Academy - Master Dividend Investing, FIRE & Wealth Building | DivTrkr",
  description: "Comprehensive dividend investing education covering dividend fundamentals, FIRE strategy, and the dividend snowball effect. Learn from experts and build lasting wealth through proven investment strategies.",
  keywords: "dividend investing education, FIRE financial independence, dividend snowball strategy, wealth building course, investment learning, passive income education",
  ogImage: "/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png"
};

export const LearningAcademy = () => {
  // Set page metadata for SEO
  useEffect(() => {
    document.title = seoData.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoData.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seoData.description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoData.keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = seoData.keywords;
      document.head.appendChild(meta);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://www.divtrkr.com/learning-academy');
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://www.divtrkr.com/learning-academy';
      document.head.appendChild(link);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seoData.title);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = seoData.title;
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seoData.description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = seoData.description;
      document.head.appendChild(meta);
    }

    // Add structured data for Learning Academy
    const existingStructuredData = document.querySelector('script[type="application/ld+json"][data-page="learning-academy"]');
    if (!existingStructuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page', 'learning-academy');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "DivTrkr Learning Academy",
        "description": seoData.description,
        "provider": {
          "@type": "Organization",
          "name": "DivTrkr",
          "url": "https://www.divtrkr.com"
        },
        "educationalLevel": "Beginner to Advanced",
        "about": [
          "Dividend Investing",
          "FIRE Strategy", 
          "Financial Independence",
          "Passive Income"
        ],
        "teaches": [
          "Dividend yield calculations",
          "FIRE methodology",
          "Compound growth strategies",
          "Portfolio allocation"
        ]
      });
      document.head.appendChild(script);
    }
  }, []);

  const learningModules = [
    {
      id: "dividends",
      title: "Dividend Fundamentals",
      description: "Master the basics of dividend investing, from understanding yield calculations to evaluating dividend sustainability and building a solid foundation for passive income.",
      href: "/learn-dividends",
      icon: TrendingUp,
      difficulty: "Beginner",
      duration: "15 min read",
      topics: ["Dividend Yield", "Payout Ratios", "Ex-Dividend Dates", "Tax Implications"],
      color: "bg-gradient-to-br from-blue-500/10 to-blue-600/20",
      badge: "Essential"
    },
    {
      id: "fire",
      title: "FIRE Strategy",
      description: "Learn the Financial Independence, Retire Early methodology and how dividend investing can accelerate your path to financial freedom through strategic planning.",
      href: "/learn-fire",
      icon: Target,
      difficulty: "Intermediate",
      duration: "20 min read",
      topics: ["25x Rule", "Safe Withdrawal Rate", "Portfolio Allocation", "Early Retirement Planning"],
      color: "bg-gradient-to-br from-orange-500/10 to-red-600/20",
      badge: "Popular"
    },
    {
      id: "snowball",
      title: "Dividend Snowball Effect",
      description: "Discover how reinvesting dividends creates compound growth, turning small investments into substantial wealth over time through the power of exponential returns.",
      href: "/learn-dividend-snowball",
      icon: Snowflake,
      difficulty: "Advanced",
      duration: "25 min read",
      topics: ["Compound Growth", "DRIP Programs", "Reinvestment Strategy", "Long-term Wealth Building"],
      color: "bg-gradient-to-br from-cyan-500/10 to-blue-600/20",
      badge: "Expert"
    }
  ];

  const stats = [
    { icon: BookOpen, value: "3", label: "Learning Modules" },
    { icon: Clock, value: "60+", label: "Minutes of Content" },
    { icon: Users, value: "1000+", label: "Students Educated" },
    { icon: Star, value: "4.9", label: "Average Rating" }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Learning Academy"
        description="Master dividend investing, FIRE strategy, and wealth-building techniques with our comprehensive educational modules"
        icon={BookOpen}
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="metric-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="metric-value">{stat.value}</div>
            <div className="metric-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Modules Section */}
      <section className="mb-12">
        <div className="text-center space-y-4 mb-8">
          <h2 className="section-title">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Progress through our carefully crafted modules designed to take you from beginner to expert in dividend investing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {learningModules.map((module, index) => (
            <Card key={module.id} className={`card-elevated group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${module.color} border-0 animate-fade-in`} style={{ animationDelay: `${index * 0.2}s` }}>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {module.badge}
                    </Badge>
                  </div>
                </div>
                <div>
                  <CardTitle className="card-title">{module.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {module.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {module.topics.length} topics
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {module.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors duration-300">
                  <Link to={module.href}>
                    Start Learning
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="gradient-secondary rounded-lg p-8 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="section-title">
            Ready to Start Building Wealth?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of investors who have transformed their financial future through dividend investing education
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/learn-dividends">
              Start with Fundamentals
              <TrendingUp className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/dashboard">
              Track Your Portfolio
              <Target className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};