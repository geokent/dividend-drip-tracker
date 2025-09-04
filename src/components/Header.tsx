import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { useAuth } from "@/components/AuthProvider";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", requireAuth: true },
    { name: "Income Projections", href: "/future-income-projects" },
    { name: "Learning Academy", href: "/learning-academy" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/10 backdrop-blur-lg bg-background/95 sticky top-0 z-50 shadow-card">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-8 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              if (item.requireAuth && !user) return null;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-smooth ${
                    isActivePath(item.href)
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <PWAInstallButton />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                if (item.requireAuth && !user) return null;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-lg transition-smooth ${
                      isActivePath(item.href)
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="px-3 py-2 flex items-center space-x-3">
                <PWAInstallButton />
                
                {user ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={signOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};