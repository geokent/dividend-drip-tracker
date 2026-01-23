import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, FileText, Image, Save, Loader2, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExportShareActionsProps {
  fireCalculations: {
    yearsToFire: number | null;
    fireNumber: number;
    dividendFireNumber: number;
    progressPercentage: number;
    currentMonthlyDividends: number;
  };
  currentMetrics: {
    totalPortfolioValue: number;
    totalAnnualDividends: number;
    portfolioYield: number;
  };
  projectionData: Record<number, { monthlyIncome: number; portfolioValue: number }>;
  monthlyExpensesInRetirement: number;
  monthlyInvestment: number;
  portfolioGrowthRate: number;
  dividendGrowthRate: number;
  reinvestDividends: boolean;
  scenarioCalculations: Array<{
    name: string;
    tenYearMonthlyIncome: number;
    yearsToFire: number | null;
  }>;
  yearRange: number;
  onSaveScenario: () => void;
  user: { id: string } | null;
}

export const ExportShareActions: React.FC<ExportShareActionsProps> = ({
  fireCalculations,
  currentMetrics,
  projectionData,
  monthlyExpensesInRetirement,
  monthlyInvestment,
  portfolioGrowthRate,
  dividendGrowthRate,
  reinvestDividends,
  scenarioCalculations,
  yearRange,
  onSaveScenario,
  user
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'image' | null>(null);
  const shareableRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header with gradient effect simulation
      pdf.setFillColor(34, 197, 94);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('DivTrkr - FIRE Projections', pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(11);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth / 2, 28, { align: 'center' });
      
      // Current Portfolio Summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 Portfolio Summary', 14, 50);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Current Portfolio Value: $${currentMetrics.totalPortfolioValue.toLocaleString()}`, 14, 60);
      pdf.text(`Annual Dividend Income: $${currentMetrics.totalAnnualDividends.toLocaleString()}`, 14, 68);
      pdf.text(`Portfolio Yield: ${currentMetrics.portfolioYield.toFixed(2)}%`, 14, 76);
      
      // FIRE Progress Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🔥 FIRE Progress', 14, 92);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Monthly Expenses Target: $${monthlyExpensesInRetirement.toLocaleString()}`, 14, 102);
      pdf.text(`FIRE Number (4% Rule): $${fireCalculations.fireNumber.toLocaleString()}`, 14, 110);
      pdf.text(`Dividend FIRE Number: $${fireCalculations.dividendFireNumber.toLocaleString()}`, 14, 118);
      pdf.text(`Progress: ${fireCalculations.progressPercentage.toFixed(1)}%`, 14, 126);
      
      if (fireCalculations.yearsToFire !== null) {
        pdf.setTextColor(34, 197, 94);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`🎉 Projected FIRE Year: ${new Date().getFullYear() + fireCalculations.yearsToFire} (${fireCalculations.yearsToFire} years)`, 14, 138);
      }
      
      // Projection Parameters
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚙️ Projection Parameters', 14, 154);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Monthly Investment: $${monthlyInvestment.toLocaleString()}`, 14, 164);
      pdf.text(`Portfolio Growth Rate: ${(portfolioGrowthRate * 100).toFixed(0)}%`, 14, 172);
      pdf.text(`Dividend Growth Rate: ${dividendGrowthRate}%`, 14, 180);
      pdf.text(`Reinvest Dividends: ${reinvestDividends ? 'Yes' : 'No'}`, 14, 188);
      
      // Milestone Projections
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📈 Milestone Projections', 14, 204);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      let yPos = 214;
      [5, 10, 15, 30].forEach(years => {
        const data = projectionData[years];
        if (data) {
          pdf.text(`${years} Years: $${data.portfolioValue?.toLocaleString()} portfolio | $${data.monthlyIncome?.toLocaleString()}/mo dividends`, 14, yPos);
          yPos += 8;
        }
      });
      
      // Scenario Comparison
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 Scenario Comparison', 14, yPos + 10);
      
      yPos += 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      scenarioCalculations.forEach(scenario => {
        pdf.text(`${scenario.name}: $${scenario.tenYearMonthlyIncome.toLocaleString()}/mo at 10yr | FIRE in ${scenario.yearsToFire !== null ? `${scenario.yearsToFire} years` : '30+ years'}`, 14, yPos);
        yPos += 7;
      });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Projections are estimates based on historical data and may not reflect future performance.', pageWidth / 2, 285, { align: 'center' });
      pdf.text('Generated by DivTrkr.com', pageWidth / 2, 290, { align: 'center' });
      
      pdf.save(`fire-projections-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Exported Successfully! 📄",
        description: "Your FIRE projections have been saved",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleShareImage = async () => {
    if (!shareableRef.current) return;
    setIsExporting(true);
    setExportType('image');
    
    try {
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(shareableRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      const downloadImage = () => {
        const link = document.createElement('a');
        link.download = `fire-milestone-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      
      // Try native share API first (mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, 'image/png')
          );
          
          if (blob) {
            const file = new File([blob], 'fire-milestone.png', { type: 'image/png' });
            const shareData = {
              title: 'My FIRE Journey',
              text: `I'll reach financial independence in ${fireCalculations.yearsToFire || 'the future'}! Track your dividends at DivTrkr.com`,
              files: [file]
            };
            
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              toast({
                title: "Shared Successfully! 🎉",
                description: "Your FIRE milestone has been shared",
              });
              return;
            }
          }
        } catch (shareError) {
          // Fall back to download if share fails
          console.log('Native share failed, falling back to download');
        }
      }
      
      // Desktop or fallback: download the image
      downloadImage();
      
      toast({
        title: "Image Downloaded! 📸",
        description: "Share your milestone on social media!",
      });
    } catch (error) {
      console.error('Share image error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to create shareable image.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save scenarios",
        variant: "destructive"
      });
      return;
    }
    onSaveScenario();
  };

  return (
    <>
      {/* Hidden Shareable Card for Image Generation */}
      <div 
        ref={shareableRef}
        className="fixed -left-[9999px] -top-[9999px] w-[600px] p-8"
        style={{ 
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="text-center space-y-5">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold" style={{ color: '#065f46' }}>
            I'll reach Financial Independence in
          </h2>
          <div className="text-7xl font-black" style={{ color: '#059669' }}>
            {fireCalculations.yearsToFire !== null 
              ? `${fireCalculations.yearsToFire} Years!`
              : 'My Future!'
            }
          </div>
          <div className="text-xl" style={{ color: '#047857' }}>
            ${fireCalculations.currentMonthlyDividends.toLocaleString()}/mo → ${projectionData[yearRange]?.monthlyIncome?.toLocaleString() || '0'}/mo
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 mt-4" style={{ borderTop: '2px solid #10b981' }}>
            <div className="flex items-center gap-2" style={{ color: '#047857' }}>
              <Trophy className="h-6 w-6" />
              <span className="font-bold text-lg">Track your dividends at DivTrkr.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions Card */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Your Progress
          </CardTitle>
          <CardDescription>
            Export your projections or share your FIRE journey with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export to PDF */}
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-auto py-4 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800 transition-colors group"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting && exportType === 'pdf' ? (
                <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold">Export PDF</div>
                <div className="text-xs text-muted-foreground">Save for your records</div>
              </div>
            </Button>

            {/* Share Image */}
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-auto py-4 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-colors group"
              onClick={handleShareImage}
              disabled={isExporting}
            >
              {isExporting && exportType === 'image' ? (
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image className="h-5 w-5 text-blue-500" />
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold">Share Image</div>
                <div className="text-xs text-muted-foreground">Post your milestone</div>
              </div>
            </Button>

            {/* Save Scenario (Premium) */}
            <Button 
              variant="outline" 
              className="flex items-center gap-3 h-auto py-4 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/20 dark:hover:border-purple-800 transition-colors group relative"
              onClick={handleSaveClick}
              disabled={isExporting}
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Save className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  Save Scenario
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                    PRO
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Compare strategies</div>
              </div>
            </Button>
          </div>

          {/* Viral sharing tip */}
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-medium text-foreground">Tip:</span> Share your FIRE milestone on social media to inspire others on their financial independence journey!
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
