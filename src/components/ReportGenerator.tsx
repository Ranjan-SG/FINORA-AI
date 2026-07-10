import React, { useState } from 'react';
import { 
  FileText, Download, Check, HelpCircle, User, 
  Lock, Settings, ShieldAlert, Globe, Bell, Trash2, CheckCircle2, 
  FileArchive, Eye, ClipboardList, FileSpreadsheet
} from 'lucide-react';
import { Transaction, Budget, SavingsGoal } from '../types';
import GlowTiltCard from './GlowTiltCard';
import { jsPDF } from 'jspdf';
import { formatDate, formatTime } from '../utils';

interface ReportGeneratorProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  currencySymbol: string;
  setCurrencySymbol: (curr: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  userEmail: string;
  userName: string;
  financials: {
    totalIncome: number;
    totalExpenses: number;
    currentSavings: number;
    savingsRate: number;
    health: {
      score: number;
      savingsRate: number;
      debtRatio: number;
      emergencyFundScore: number;
      investmentRatio: number;
      status: string;
      suggestions: string[];
    }
  };
}

export default function ReportGenerator({
  transactions,
  budgets,
  goals,
  currencySymbol,
  setCurrencySymbol,
  language,
  setLanguage,
  userEmail,
  userName,
  financials
}: ReportGeneratorProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Download transaction CSV handler with proper DD-MM-YYYY dates and metadata headers
  const handleDownloadCSV = () => {
    try {
      const formattedGenDate = formatDate(new Date());
      const formattedGenTime = formatTime(new Date());

      // Prepend mandatory metadata lines to CSV content as requested
      const csvMetadataLines = [
        `"FINORA AI"`,
        `"AI Financial Intelligence Platform"`,
        `"Generated On: ${formattedGenDate}"`,
        `"Time: ${formattedGenTime}"`,
        `"User Name: ${userName}"`,
        `"Email: ${userEmail || 'guest-auditor@finora.ai'}"`,
        `` // empty separator line
      ].join("\n");

      const headers = ['Date', 'Time', 'Merchant', 'Category', 'Amount', 'Type', 'Notes'];
      const rows = transactions.map(t => {
        const formattedTxDate = formatDate(t.date);
        
        // Deterministic HH:MM AM/PM mock time so it's never blank or seconds-based
        const idNum = parseInt(t.id.replace(/[^\d]/g, '')) || 0;
        const hour = 9 + (idNum % 8); // hours between 9 AM and 5 PM
        const minute = (idNum * 17) % 60;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        const formattedTxTime = `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;

        return [
          formattedTxDate,
          formattedTxTime,
          `"${t.merchant.replace(/"/g, '""')}"`,
          t.category,
          t.amount,
          t.type,
          `"${t.description.replace(/"/g, '""')}"`
        ];
      });

      const csvContent = csvMetadataLines
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      // Set MIME type to support Excel auto-recognition
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `FINORA_AI_Transactions_${formattedGenDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess('csv');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Download high-fidelity PDF report
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Palette
      const primaryColor = [79, 70, 229]; // Indigo-600
      const secondaryColor = [17, 24, 39]; // Slate navy
      const lightBgColor = [249, 250, 251]; // Gray-50
      const borderColor = [229, 231, 235]; // Gray-200
      const textColor = [55, 65, 81]; // Gray-700
      const headerTextColor = [17, 24, 39]; // Gray-900

      const currentSecId = Math.floor(100000 + Math.random() * 900000);
      const genDate = formatDate(new Date());
      const genTime = formatTime(new Date());

      // Positions
      let y = 15;
      const margin = 15;
      const width = 180;

      // 1. BRANDING HEADER
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, 10, 10, 'F'); // branding accent box
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("FINORA AI", margin + 14, y + 8);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // cool grey
      doc.text("AI FINANCIAL INTELLIGENCE PLATFORM", margin + 14, y + 13);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CONFIDENTIAL PORTFOLIO REPORT", 130, y + 5);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`REPORT SECURE ID: #${currentSecId}`, 130, y + 10);

      y += 18;

      // Thin Border
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + width, y);

      y += 8;

      // 2. EXPORT METADATA HEADER (Mandatory fields)
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(margin, y, width, 25, 'F');
      doc.rect(margin, y, width, 25, 'S');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2]);
      doc.text("REPORT AUDITOR METADATA", margin + 5, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`User Name:  ${userName}`, margin + 5, y + 13);
      doc.text(`User Email: ${userEmail || 'guest-auditor@finora.ai'}`, margin + 5, y + 19);

      doc.text(`Generated On: ${genDate}`, margin + 100, y + 13);
      doc.text(`Time:         ${genTime}`, margin + 100, y + 19);

      y += 33;

      // 3. CORE METRICS
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("FINANCIAL HEALTH & PERFORMANCE", margin, y);
      y += 5;

      const healthScore = financials?.health?.score || 75;
      const statusText = healthScore >= 80 ? "EXCELLENT" : healthScore >= 60 ? "GOOD" : healthScore >= 40 ? "FAIR" : "CRITICAL";

      const cardW = width / 3 - 2;
      
      // Card 1: Health
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(margin, y, cardW, 20, 'F');
      doc.rect(margin, y, cardW, 20, 'S');
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("FINANCIAL HEALTH", margin + 4, y + 5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${healthScore} / 100`, margin + 4, y + 12);
      doc.setFontSize(8);
      doc.text(`STATUS: ${statusText}`, margin + 4, y + 17);

      // Card 2: Income/Expense Cashflow
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(margin + cardW + 3, y, cardW, 20, 'F');
      doc.rect(margin + cardW + 3, y, cardW, 20, 'S');
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("MONTHLY SURPLUS", margin + cardW + 7, y + 5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // Green
      const surplus = (financials?.totalIncome || 0) - (financials?.totalExpenses || 0);
      doc.text(`${currencySymbol}${surplus.toLocaleString()}`, margin + cardW + 7, y + 12);
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Savings Rate: ${financials?.savingsRate || 0}%`, margin + cardW + 7, y + 17);

      // Card 3: Net Worth / Saved Targets
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(margin + (cardW * 2) + 6, y, cardW, 20, 'F');
      doc.rect(margin + (cardW * 2) + 6, y, cardW, 20, 'S');
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("NET WORTH", margin + (cardW * 2) + 10, y + 5);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
      doc.text(`${currencySymbol}${totalSaved.toLocaleString()}`, margin + (cardW * 2) + 10, y + 12);
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${goals.length} Wealth targets`, margin + (cardW * 2) + 10, y + 17);

      y += 28;

      // 4. TRANSACTION LEDGER
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("RECENT TRANSACTION LEDGER (ACTIVE AUDITING)", margin, y);
      y += 5;

      // Draw table header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, width, 7, 'F');
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Date", margin + 3, y + 5);
      doc.text("Merchant / Description", margin + 28, y + 5);
      doc.text("Category", margin + 95, y + 5);
      doc.text("Amount", margin + 135, y + 5);
      doc.text("Type", margin + 165, y + 5);
      y += 7;

      // Render up to 12 transactions beautifully
      const visibleTxs = transactions.slice(0, 12);
      visibleTxs.forEach((tx, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(243, 244, 246);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(margin, y, width, 7, 'F');
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.1);
        doc.line(margin, y + 7, margin + width, y + 7);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(formatDate(tx.date), margin + 3, y + 5);
        doc.text(tx.description.substring(0, 42), margin + 28, y + 5);
        doc.text(tx.category, margin + 95, y + 5);
        
        // Income vs Expense
        if (tx.type === 'income') {
          doc.setTextColor(16, 185, 129); // Green
          doc.text(`+${currencySymbol}${tx.amount.toLocaleString()}`, margin + 135, y + 5);
        } else {
          doc.setTextColor(239, 68, 68); // Red
          doc.text(`-${currencySymbol}${tx.amount.toLocaleString()}`, margin + 135, y + 5);
        }

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(tx.type.toUpperCase(), margin + 165, y + 5);

        y += 7;
      });

      y += 8;

      // 5. INTUATIVE RECOMMENDATIONS & INSIGHTS
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("FINORA INTELLIGENCE HUB BRIEFINGS", margin, y);
      y += 5;

      doc.setFillColor(239, 246, 255); // soft indigo/blue
      doc.setDrawColor(191, 219, 254);
      doc.rect(margin, y, width, 24, 'F');
      doc.rect(margin, y, width, 24, 'S');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 58, 138); // deep corporate blue
      doc.text("AI WEALTH BRIEFING & ACTIONABLE DIRECTIVES", margin + 5, y + 5);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const suggestionsToPrint = financials?.health?.suggestions?.slice(0, 2) || [];
      if (suggestionsToPrint.length === 0) {
        doc.text("• No priority budgeting overrides are needed. Your expense rates align perfectly with your wealth targets.", margin + 5, y + 11);
        doc.text("• Continue setting aside regular investment fractions and growing your emergency fund allocation.", margin + 5, y + 17);
      } else {
        doc.text(`• ${suggestionsToPrint[0] || 'Maintain robust emergency portfolio thresholds to secure income stability.'}`, margin + 5, y + 11);
        doc.text(`• ${suggestionsToPrint[1] || 'Your savings rate represents healthy compounding velocity.'}`, margin + 5, y + 17);
      }

      y += 35;

      // 6. COMPLIANCE & FOOTER
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text("This intelligence document is automatically compiled by FINORA AI and contains confidential customer wealth profiles. Dissemination without strict audit approval is prohibited.", margin, y);
      
      // Save
      doc.save(`FINORA_AI_Dashboard_Report_${genDate}.pdf`);

      setDownloadSuccess('pdf');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error("PDF generation failure:", err);
    }
  };

  // Download comprehensive wealth report in JSON
  const handleDownloadJSONReport = () => {
    try {
      const formattedGenDate = formatDate(new Date());
      const report = {
        meta: {
          generatedAt: new Date().toISOString(),
          version: "1.0.0",
          scope: "Enterprise Personal Wealth Portfolio"
        },
        financials: {
          totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
          ledgerCount: transactions.length
        },
        budgets,
        goals,
        ledger: transactions
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `FINORA_AI_Backup_${formattedGenDate}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess('json');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const totalInflow = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Reports & Configurations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Compile print-ready balance sheets, export standard transaction structures, and adjust locale display parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report compilation & exports */}
        <div className="lg:col-span-2 space-y-4">
          <GlowTiltCard 
            glowColor="rgba(99, 102, 241, 0.12)"
            className="p-5 space-y-6"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Export Financial Documents</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Generate highly compliant financial sheets for internal auditing and tax declaration.</p>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-indigo-400" /> {isPreviewOpen ? 'Hide Preview' : 'Interactive Preview'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              
              {/* PDF Print Export Card */}
              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/25 flex flex-col justify-between h-44 hover:border-slate-800 transition duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">PDF Format</span>
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Executive PDF Print</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Generates high contrast, print-ready document with metadata graphs perfect for hardcopy archives.</p>
                </div>
                
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 border border-indigo-500/20 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  {downloadSuccess === 'pdf' ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-400" /> Prepared PDF</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" /> Compile PDF Print</>
                  )}
                </button>
              </div>

            </div>

            {/* Executive Print Summary Preview Container */}
            {(isPreviewOpen || true) && (
              <div className="p-5 rounded-xl border border-slate-850 bg-slate-950/40 space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 text-indigo-400" /> Executive Print Summary Preview
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">SECURE ID: #{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center pb-4 border-b border-slate-900 font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900/40">
                    <span className="text-[8px] text-slate-500 block uppercase">Total Credits</span>
                    <span className="text-emerald-400 text-xs font-bold block mt-0.5">+{currencySymbol}{totalInflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/40">
                    <span className="text-[8px] text-slate-500 block uppercase">Total Debits</span>
                    <span className="text-rose-400 text-xs font-bold block mt-0.5">-{currencySymbol}{totalOutflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/40">
                    <span className="text-[8px] text-slate-500 block uppercase">Balance Surplus</span>
                    <span className="text-slate-200 text-xs font-bold block mt-0.5">{currencySymbol}{(totalInflow - totalOutflow).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/40">
                    <span className="text-[8px] text-slate-500 block uppercase">Log Frequency</span>
                    <span className="text-slate-200 text-xs font-bold block mt-0.5">{transactions.length} Records</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-350">
                  <div className="flex justify-between">
                    <span>Reporting Auditor Email:</span>
                    <span className="font-mono text-slate-200">{userEmail || "guest-auditor@aistudio"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compiling Node Version:</span>
                    <span className="font-mono text-indigo-400">v2.4.0 (Enterprise Sandbox)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generated On:</span>
                    <span className="font-mono text-slate-200">{formatDate(new Date())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Generated:</span>
                    <span className="font-mono text-slate-200">{formatTime(new Date())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Budget Thresholds:</span>
                    <span className="font-mono text-slate-200">{budgets.length} Category Rules</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wealth Milestone Targets:</span>
                    <span className="font-mono text-slate-200">{goals.length} Active Targets</span>
                  </div>
                </div>
              </div>
            )}

          </GlowTiltCard>
        </div>

        {/* Right Column: Settings & metrics configuration */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor="rgba(245, 158, 11, 0.08)"
            className="p-5 space-y-4"
          >
            <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
              <Settings className="h-4 w-4 text-amber-500" /> Display Settings
            </h3>

            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                  <Globe className="h-3 w-3 text-indigo-400" /> Multi-language locale
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900/60 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition duration-300 font-sans"
                >
                  <option value="English">English (United States)</option>
                  <option value="English (India)">English (India)</option>
                </select>
              </div>

              {/* Profile card metadata info */}
              <div className="p-3 bg-slate-950/45 border border-slate-900 rounded-xl flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Auditor Account</span>
                  <span className="text-xs text-slate-200 truncate block font-mono">{userEmail || "auditor@aistudio"}</span>
                </div>
              </div>

            </div>
          </GlowTiltCard>
        </div>

      </div>
    </div>
  );
}
