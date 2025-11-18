import { DividendYieldCalculator } from './calculators/DividendYieldCalculator';
import { DRIPCalculator } from './calculators/DRIPCalculator';
import { FIRECalculator } from './calculators/FIRECalculator';
import { Calculator } from 'lucide-react';

export const FreeToolsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <h2 className="section-title text-3xl lg:text-5xl">
              <span className="gradient-text">Free Dividend Calculators</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No sign-up required. Start planning your dividend income strategy with our interactive tools.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto animate-scale-in">
          <DividendYieldCalculator />
          <DRIPCalculator />
          <FIRECalculator />
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Free forever.</strong> No account or credit card required to use these calculators.
          </p>
        </div>
      </div>
    </section>
  );
};
