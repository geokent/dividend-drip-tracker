import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/10 bg-gradient-subtle mt-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-6 w-auto mr-3 hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground mb-2">
              © 2024 DivTrkr. Building wealth through dividend investing.
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