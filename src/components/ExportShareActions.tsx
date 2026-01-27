import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Colors
      const greenColor = rgb(34/255, 197/255, 94/255);
      const blackColor = rgb(0, 0, 0);
      const grayColor = rgb(128/255, 128/255, 128/255);
      const whiteColor = rgb(1, 1, 1);
      
      // Header with green background
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: greenColor,
      });
      
      // Header text
      page.drawText('DivTrkr - FIRE Projections', {
        x: width / 2 - 100,
        y: height - 50,
        size: 20,
        font: boldFont,
        color: whiteColor,
      });
      
      const dateStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      page.drawText(`Generated: ${dateStr}`, {
        x: width / 2 - 80,
        y: height - 75,
        size: 10,
        font: font,
        color: whiteColor,
      });
      
      let yPos = height - 140;
      
      // Portfolio Summary Section
      page.drawText('Portfolio Summary', {
        x: 40,
        y: yPos,
        size: 14,
        font: boldFont,
        color: blackColor,
      });
      yPos -= 25;
      
      page.drawText(`Current Portfolio Value: $${currentMetrics.totalPortfolioValue.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Annual Dividend Income: $${currentMetrics.totalAnnualDividends.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Portfolio Yield: ${currentMetrics.portfolioYield.toFixed(2)}%`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 35;
      
      // FIRE Progress Section
      page.drawText('FIRE Progress', {
        x: 40,
        y: yPos,
        size: 14,
        font: boldFont,
        color: blackColor,
      });
      yPos -= 25;
      
      page.drawText(`Monthly Expenses Target: $${monthlyExpensesInRetirement.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`FIRE Number (4% Rule): $${fireCalculations.fireNumber.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Dividend FIRE Number: $${fireCalculations.dividendFireNumber.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Progress: ${fireCalculations.progressPercentage.toFixed(1)}%`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 25;
      
      if (fireCalculations.yearsToFire !== null) {
        page.drawText(`Projected FIRE Year: ${new Date().getFullYear() + fireCalculations.yearsToFire} (${fireCalculations.yearsToFire} years)`, {
          x: 40,
          y: yPos,
          size: 11,
          font: boldFont,
          color: greenColor,
        });
        yPos -= 35;
      }
      
      // Projection Parameters Section
      page.drawText('Projection Parameters', {
        x: 40,
        y: yPos,
        size: 14,
        font: boldFont,
        color: blackColor,
      });
      yPos -= 25;
      
      page.drawText(`Monthly Investment: $${monthlyInvestment.toLocaleString()}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Portfolio Growth Rate: ${(portfolioGrowthRate * 100).toFixed(0)}%`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Dividend Growth Rate: ${dividendGrowthRate}%`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 18;
      
      page.drawText(`Reinvest Dividends: ${reinvestDividends ? 'Yes' : 'No'}`, {
        x: 40,
        y: yPos,
        size: 10,
        font: font,
        color: blackColor,
      });
      yPos -= 35;
      
      // Milestone Projections
      page.drawText('Milestone Projections', {
        x: 40,
        y: yPos,
        size: 14,
        font: boldFont,
        color: blackColor,
      });
      yPos -= 25;
      
      [5, 10, 15, 30].forEach(years => {
        const data = projectionData[years];
        if (data) {
          page.drawText(`${years} Years: $${data.portfolioValue?.toLocaleString()} portfolio | $${data.monthlyIncome?.toLocaleString()}/mo dividends`, {
            x: 40,
            y: yPos,
            size: 10,
            font: font,
            color: blackColor,
          });
          yPos -= 18;
        }
      });
      yPos -= 15;
      
      // Scenario Comparison
      page.drawText('Scenario Comparison', {
        x: 40,
        y: yPos,
        size: 14,
        font: boldFont,
        color: blackColor,
      });
      yPos -= 25;
      
      scenarioCalculations.forEach(scenario => {
        const fireText = scenario.yearsToFire !== null ? `${scenario.yearsToFire} years` : '30+ years';
        page.drawText(`${scenario.name}: $${scenario.tenYearMonthlyIncome.toLocaleString()}/mo at 10yr | FIRE in ${fireText}`, {
          x: 40,
          y: yPos,
          size: 9,
          font: font,
          color: blackColor,
        });
        yPos -= 15;
      });
      
      // Footer
      page.drawText('Projections are estimates based on historical data and may not reflect future performance.', {
        x: width / 2 - 180,
        y: 40,
        size: 7,
        font: font,
        color: grayColor,
      });
      
      page.drawText('Generated by DivTrkr.com', {
        x: width / 2 - 45,
        y: 25,
        size: 7,
        font: font,
        color: grayColor,
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fire-projections-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      
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
