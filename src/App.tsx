import React, { useState, useEffect } from 'react';
import { 
  PieChart, Activity, Upload, DollarSign, Target, Zap, Bot, Settings, 
  Menu, X, Sparkles, RefreshCw, LogOut, ShieldCheck, HelpCircle 
} from 'lucide-react';

import DashboardOverview from './components/DashboardOverview';
import StatementUpload from './components/StatementUpload';
import BudgetPlanner from './components/BudgetPlanner';
import SavingsForecast from './components/SavingsForecast';
import InvestmentAdvisor from './components/InvestmentAdvisor';
import UnnecessarySpending from './components/UnnecessarySpending';
import AIAdvisorChat from './components/AIAdvisorChat';
import ReportGenerator from './components/ReportGenerator';
import ThreeBackground from './components/ThreeBackground';
import AuthScreen from './components/AuthScreen';
import AIFloatingChat from './components/AIFloatingChat';

import { Transaction, Budget, SavingsGoal, ChatMessage, FinancialHealth } from './types';

export default function App() {
  const [session, setSession] = useState<{ name: string; email: string } | null>(() => {
    try {
      const stored = localStorage.getItem('finora_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('finora_session');
    setSession(null);
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'budgets' | 'forecast' | 'investments' | 'waste' | 'chat' | 'reports'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const theme = 'dark';
  const currencySymbol = '₹';
  const [language, setLanguage] = useState('English');
  const bgStyle = 'cosmic';

  // Unified financial state fetched from Express server API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [financials, setFinancials] = useState<{
    totalIncome: number;
    totalExpenses: number;
    currentSavings: number;
    savingsRate: number;
    health: FinancialHealth;
  }>({
    totalIncome: 0,
    totalExpenses: 0,
    currentSavings: 0,
    savingsRate: 0,
    health: {
      score: 75,
      savingsRate: 0,
      debtRatio: 0,
      emergencyFundScore: 50,
      investmentRatio: 0,
      status: 'Fair',
      suggestions: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load consolidated metrics from server
  const loadConsolidatedMetrics = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const response = await fetch('/api/financials');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setBudgets(data.budgets);
        setGoals(data.goals);
        setChatHistory(data.chatHistory);
        setFinancials({
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          currentSavings: data.currentSavings,
          savingsRate: data.savingsRate,
          health: data.health
        });
      }
    } catch (err) {
      console.error("Error connecting to financials server:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadConsolidatedMetrics();
  }, []);

  // Sync entire local data block to backend
  const syncLocalStateToBackend = async (updatedTxs: Transaction[], updatedBudgets: Budget[], updatedGoals: SavingsGoal[]) => {
    try {
      await fetch('/api/data/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: updatedTxs,
          budgets: updatedBudgets,
          goals: updatedGoals,
          chatHistory
        })
      });
      await loadConsolidatedMetrics();
    } catch (err) {
      console.error("Sync failure:", err);
    }
  };

  // Create Transaction
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Transaction Category/Amount
  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Set Budget limit
  const handleUpdateBudgetLimit = async (category: string, limit: number) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit })
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save/Update Goals
  const handleSaveGoal = async (goal: Partial<SavingsGoal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Goals
  const handleDeleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadConsolidatedMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send message to AI Financial Advisor Chatbot
  const handleSendChatMessage = async (text: string) => {
    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chatHistory);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear Chat History logs
  const handleClearChatHistory = async () => {
    // Optimistic UI update: instantly reset chat to initial greeting
    const welcomeMessage = {
      id: "c-1",
      sender: "advisor" as const,
      text: "Welcome to FINORA AI Assistant! I am ready to help you analyze your cash flows, plan budgets, and answer any financial literacy questions (such as SIP vs FD, Mutual Funds, emergency funds, or credit score improvement) right now. Upload your bank statement to unlock personalized insights!",
      timestamp: new Date().toISOString()
    };
    setChatHistory([welcomeMessage]);

    try {
      const response = await fetch('/api/advisor/chat/clear', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chatHistory);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render proper tab panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            financials={financials}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            onAddTransaction={() => setActiveTab('upload')}
            onRefresh={() => loadConsolidatedMetrics(true)}
            isRefreshing={isRefreshing}
            onTabChange={setActiveTab}
            chatHistory={chatHistory}
            onSendMessage={handleSendChatMessage}
            onClearHistory={handleClearChatHistory}
          />
        );
      case 'upload':
        return (
          <StatementUpload 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUploadSuccess={() => loadConsolidatedMetrics(true)}
            currencySymbol={currencySymbol}
          />
        );
      case 'budgets':
        return (
          <BudgetPlanner 
            budgets={budgets}
            goals={goals}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            currencySymbol={currencySymbol}
          />
        );
      case 'forecast':
        return (
          <SavingsForecast 
            currentSavings={goals.reduce((sum, g) => sum + g.current, 0)}
            monthlySavings={financials.currentSavings}
            currencySymbol={currencySymbol}
          />
        );
      case 'investments':
        return (
          <InvestmentAdvisor 
            salary={financials.totalIncome}
            monthlySavings={financials.currentSavings}
            currencySymbol={currencySymbol}
          />
        );
      case 'waste':
        return (
          <UnnecessarySpending 
            transactions={transactions}
            currencySymbol={currencySymbol}
          />
        );
      case 'chat':
        return (
          <AIAdvisorChat 
            chatHistory={chatHistory}
            onSendMessage={handleSendChatMessage}
            onClearHistory={handleClearChatHistory}
            currencySymbol={currencySymbol}
          />
        );
      case 'reports':
        return (
          <ReportGenerator 
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            currencySymbol={currencySymbol}
            setCurrencySymbol={() => {}}
            language={language}
            setLanguage={setLanguage}
            userEmail={session?.email || "demo@finora.ai"}
            userName={session?.name || "Jane Doe"}
            financials={financials}
          />
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'upload', label: 'Transactions', icon: Upload },
    { id: 'budgets', label: 'Savings', icon: Target },
    { id: 'forecast', label: 'Predictions', icon: PieChart },
    { id: 'investments', label: 'Investments', icon: DollarSign },
    { id: 'waste', label: 'Outflows', icon: Zap },
    { id: 'chat', label: 'Ask AI', icon: Bot },
    { id: 'reports', label: 'Reports', icon: Settings }
  ] as const;

  const getBackgroundStyles = () => {
    return {
      wrapper: theme === 'dark' ? 'text-slate-100' : 'text-slate-800',
      decorations: null
    };
  };

  const bgConfig = getBackgroundStyles();

  if (!session) {
    return (
      <div className={`min-h-screen font-sans antialiased relative transition-colors duration-300 ${bgConfig.wrapper}`}>
        {bgConfig.decorations}
        <ThreeBackground theme={theme} bgStyle={bgStyle} />
        <div className="relative z-10">
          <AuthScreen onLoginSuccess={(user) => {
            setSession(user);
            loadConsolidatedMetrics();
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased relative transition-colors duration-300 pb-12 ${bgConfig.wrapper}`}>
      
      {/* Visual background gradient mesh and dynamic decorations */}
      {bgConfig.decorations}

      {/* Stunning 3D interactive background */}
      <ThreeBackground theme={theme} bgStyle={bgStyle} />

      {/* Main Layout Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Sleek Horizontal Header exactly matching FINORA AI */}
        <header className={`border-b sticky top-0 z-30 transition-all duration-300 shadow-xl h-[76px] flex items-center backdrop-blur-xl ${
          theme === 'dark' 
            ? 'border-slate-900 bg-[#07070c]/85 shadow-black/15' 
            : 'border-slate-200 bg-white/75 shadow-slate-100'
        }`}>
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            
            {/* Left: Logo FINORA AI */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-500/30 border border-indigo-500/40 transition-all duration-300 group-hover:scale-110 select-none">
                F
              </div>
              <div>
                <span className={`text-sm font-extrabold tracking-widest uppercase block transition-all duration-300 group-hover:text-indigo-450 font-sans ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>FINORA AI</span>
              </div>
            </div>

            {/* Middle: Horizontal Nav List (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.filter(item => ['dashboard', 'upload', 'budgets', 'investments', 'reports'].includes(item.id)).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                      isActive 
                        ? theme === 'dark'
                          ? 'text-white bg-indigo-600/10 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'text-indigo-600 bg-indigo-600/10 border border-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : theme === 'dark'
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3.5">

              {/* Upload Statement (Action button matching top right of the screenshot) */}
              <button
                onClick={() => setActiveTab('upload')}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Upload Statement
              </button>

              {/* User Avatar Circle badge */}
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold font-sans select-none border-2 bg-[#111827] border-indigo-500/40 text-white hover:border-indigo-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer" 
                title="View My Account Settings"
              >
                {(session?.name || "Jane Doe").split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </button>

              {/* Sleek Logout Button */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-xl border hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm ${
                  theme === 'dark'
                    ? 'bg-[#09090e] border-slate-900 text-slate-400 hover:text-red-400'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-red-500'
                }`}
                title="Log Out Session"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-[#09090e] border-slate-900 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-900 bg-[#09090e] px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setActiveTab('upload');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition mt-2 cursor-pointer"
              >
                Upload Statement
              </button>
            </div>
          )}
        </header>

        {/* Active Workspace Viewport Frame */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading comprehensive ledger metrics...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>

      </div>

      {/* Beautiful backdrop-blurred Profile Settings & Purge Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#0d0d15] border border-slate-900 rounded-3xl p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-500 hover:text-slate-300 rounded-full hover:bg-white/5 transition"
              aria-label="Close Profile Settings"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="text-center space-y-1.5">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 border-2 border-indigo-400/40 flex items-center justify-center text-xl font-extrabold text-white shadow-xl shadow-indigo-500/15">
                {(session?.name || "Jane Doe").split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
              <h3 className="text-lg font-extrabold text-slate-100">{session?.name}</h3>
              <p className="text-xs font-mono text-slate-400">{session?.email}</p>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-3.5">
              <h4 className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Finora Ledger Metrics</h4>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">TRANSACTIONS</span>
                  <span className="text-base font-bold font-mono text-slate-300 mt-1 block">{transactions.length}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">SAVINGS GOALS</span>
                  <span className="text-base font-bold font-mono text-slate-300 mt-1 block">{goals.length} active</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-3">
              <h4 className="text-[10px] font-bold font-mono text-red-500 uppercase tracking-widest">Danger Zone</h4>
              <p className="text-[10px] text-slate-450 leading-normal">
                Deleting your account will permanently wipe all uploaded PDF/CSV bank statements, custom budgets, savings goals, and transaction logs from Finora's persistent storage servers. This operation cannot be undone.
              </p>
              <button
                onClick={async () => {
                  if (confirm("Are you absolutely sure you want to permanently delete your account data? This will instantly wipe all statement logs and log you out.")) {
                    try {
                      const response = await fetch('/api/users/me', {
                        method: 'DELETE'
                      });
                      if (response.ok) {
                        setIsProfileModalOpen(false);
                        handleLogout();
                      }
                    } catch (err) {
                      console.error("Failed to delete account data:", err);
                    }
                  }
                }}
                className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer text-center"
              >
                Delete Account & Purge Ledger Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Floating Glassmorphic AI Assistant */}
      <AIFloatingChat 
        chatHistory={chatHistory}
        onSendMessage={handleSendChatMessage}
        onClearHistory={handleClearChatHistory}
        currencySymbol={currencySymbol}
      />

    </div>
  );
}
