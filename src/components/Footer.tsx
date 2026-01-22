import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/10 bg-gradient-subtle mt-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo Section */}
          <div className="flex flex-col">
            <Link to="/" className="mb-4">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-6 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Building wealth through dividend investing.
            </p>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dividend-calendar" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Dividend Calendar
                </Link>
              </li>
              <li>
                <Link to="/stock-screener" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Stock Screener
                </Link>
              </li>
              <li>
                <Link to="/future-income-projects" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Income Projections
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/editorial" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Editorial Standards
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/10 pt-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              © 2025 DivTrkr. Building wealth through dividend investing.
            </p>
            <p className="text-xs text-muted-foreground">
              This is not investment advice. We are not investment professionals. All data is provided for educational and entertainment purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
