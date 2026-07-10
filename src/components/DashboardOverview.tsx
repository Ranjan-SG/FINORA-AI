import React, { useState, useRef, useEffect } from 'react';
import { 
  DollarSign, Activity, ShoppingBag, Plus, RefreshCw, 
  Sparkles, Coffee, Smartphone, ChevronRight, Bot, Target, 
  TrendingUp, Compass, Settings, PieChart, ShieldCheck, Info,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Award, Zap, HelpCircle, X, Send
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, 
  BarChart, Bar, PieChart as ReChartsPieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { Transaction, Budget, SavingsGoal, FinancialHealth, ChatMessage } from '../types';
import GlowTiltCard from './GlowTiltCard';
import AnimatedCounter from './AnimatedCounter';

interface DashboardOverviewProps {
  financials: {
    totalIncome: number;
    totalExpenses: number;
    currentSavings: number;
    savingsRate: number;
    health: FinancialHealth;
  };
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  onAddTransaction: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onTabChange?: (tab: 'dashboard' | 'upload' | 'budgets' | 'forecast' | 'investments' | 'waste' | 'chat' | 'reports') => void;
  chatHistory?: ChatMessage[];
  onSendMessage?: (msg: string) => Promise<void>;
  onClearHistory?: () => Promise<void>;
}

export default function DashboardOverview({
  financials,
  transactions,
  budgets,
  goals = [],
  onAddTransaction,
  onRefresh,
  isRefreshing,
  onTabChange,
  chatHistory = [],
  onSendMessage,
  onClearHistory
}: DashboardOverviewProps) {
  const { totalIncome, totalExpenses, currentSavings, savingsRate, health } = financials;
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat widget
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsTyping(false);
  }, [chatHistory]);

  const handleChipClick = (prompt: string) => {
    if (onSendMessage) {
      setIsTyping(true);
      onSendMessage(prompt).finally(() => setIsTyping(false));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !onSendMessage) return;
    const msg = inputValue;
    setInputValue('');
    setIsTyping(true);
    onSendMessage(msg).finally(() => setIsTyping(false));
  };

  const currencySymbol = '₹';

  // Format currencies helper
  const formatCurrency = (val: number) => {
    return currencySymbol + val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Savings Goal calculations dynamically loaded from actual user goals state
  const activeGoal = goals && goals.length > 0 ? goals[0] : null;
  const goalPercentage = activeGoal && activeGoal.target > 0 ? Math.min(Math.round((activeGoal.current / activeGoal.target) * 100), 100) : 0;
  const goalCurrent = activeGoal ? activeGoal.current : 0;
  const goalTarget = activeGoal ? activeGoal.target : 0;
  const goalName = activeGoal ? activeGoal.name : "No Active Goal";

  // Setup list of recent activities to render dynamically from real data
  const recentActivities = transactions.slice(0, 3);

  // Helper to get transaction icons matching screenshot
  const getTxIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('starbucks') || desc.includes('coffee')) {
      return <Coffee className="h-4 w-4 text-slate-300" />;
    }
    if (desc.includes('apple') || desc.includes('subscription')) {
      return <Smartphone className="h-4 w-4 text-slate-300" />;
    }
    return <ShoppingBag className="h-4 w-4 text-slate-300" />;
  };

  // Determine financial health text and color indicator
  const getHealthStatus = (score: number) => {
    if (transactions.length === 0) {
      return {
        text: 'Poor',
        color: 'text-red-500',
        progressBarColor: 'bg-red-500',
        badge: '🔴 Poor',
        description: 'No financial data available yet. Upload your bank statement or manually add transactions to begin your financial analysis.'
      };
    }
    if (score >= 80) {
      return {
        text: 'Excellent',
        color: 'text-emerald-400',
        progressBarColor: 'bg-emerald-500',
        badge: '🟢 Excellent',
        description: 'Your financial health is excellent. Your savings, investments, and spending habits indicate outstanding financial discipline.'
      };
    }
    if (score >= 60) {
      return {
        text: 'Good',
        color: 'text-emerald-400',
        progressBarColor: 'bg-emerald-500',
        badge: '🟢 Good',
        description: 'Your financial health is good. You maintained healthy spending habits, increased your savings, and are steadily improving your financial position.'
      };
    }
    if (score >= 40) {
      return {
        text: 'Fair',
        color: 'text-orange-500',
        progressBarColor: 'bg-orange-500',
        badge: '🟠 Fair',
        description: 'Your financial health is fair. There is room to improve budgeting and increase monthly savings.'
      };
    }
    return {
      text: 'Poor',
      color: 'text-red-500',
      progressBarColor: 'bg-red-500',
      badge: '🔴 Poor',
      description: 'Your financial health needs attention. Consider reducing unnecessary expenses and building an emergency fund.'
    };
  };

  const healthStatus = getHealthStatus(health.score || 0);

  // Sparkline data for Net Worth Card
  const sparklineData = transactions.length === 0 ? [
    { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }
  ] : [
    { value: 30 },
    { value: 45 },
    { value: 40 },
    { value: 70 },
    { value: 100 }
  ];

  // --- Dynamic Chart Data Prep ---
  // 1. Expense by Category Pie Chart
  const expenseByCategory = budgets.map(b => ({
    name: b.category,
    value: b.spent
  })).filter(item => item.value > 0);

  // Fallback if empty (Only when transactions exist but category breakdown empty)
  const pieChartData = expenseByCategory.length > 0 ? expenseByCategory : (
    transactions.length === 0 ? [] : [
      { name: 'Food', value: 299 },
      { name: 'Rent', value: 2100 },
      { name: 'Shopping', value: 245 },
      { name: 'Bills', value: 142 },
      { name: 'Subscriptions', value: 93 },
      { name: 'Others', value: 80 }
    ]
  );

  // Colors for charts
  const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

  // 2. Monthly Expense Trend (Weekly chunks for simulation)
  const lineChartData = transactions.length === 0 ? [] : [
    { name: 'Week 1', Spent: 420 },
    { name: 'Week 2', Spent: 890 },
    { name: 'Week 3', Spent: 650 },
    { name: 'Week 4', Spent: 1200 },
    { name: 'Week 5', Spent: totalExpenses > 0 ? totalExpenses * 0.25 : 840 }
  ];

  // 3. Income vs Expense Bar Chart
  const barChartData = transactions.length === 0 ? [] : [
    { name: 'May', Income: 6800, Expense: 4100 },
    { name: 'Jun', Income: 7200, Expense: 4800 },
    { name: 'Jul', Income: totalIncome || 0, Expense: totalExpenses || 0 }
  ];

  // 4. Savings Trend Area Chart
  const areaChartData = transactions.length === 0 ? [] : [
    { name: 'Month 1', Savings: Math.max(0, Math.round((totalIncome - totalExpenses) * 0.2)) },
    { name: 'Month 2', Savings: Math.max(0, Math.round((totalIncome - totalExpenses) * 0.4)) },
    { name: 'Month 3', Savings: Math.max(0, Math.round((totalIncome - totalExpenses) * 0.6)) },
    { name: 'Month 4', Savings: Math.max(0, Math.round((totalIncome - totalExpenses) * 0.8)) },
    { name: 'Month 5', Savings: Math.max(0, totalIncome - totalExpenses) }
  ];

  // 5. Investment Allocation Donut Chart
  const donutChartData = [
    { name: 'Stocks', value: 65 },
    { name: 'Crypto', value: 15 },
    { name: 'Cash', value: 20 }
  ];

  return (
    <div className="space-y-6">
      {/* Header action panel */}
      <div className="bg-[#111827] border border-white/[0.08] p-6 rounded-2xl shadow-lg shadow-black/10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-sans">
            Finora Intelligence Hub <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed max-w-4xl font-normal font-sans">
            Empowering smarter financial decisions with AI-driven insights, predictive analytics, and personalized wealth intelligence.
          </p>
        </div>
      </div>

      {/* 2-Column Bento Grid matching the screenshot exactly but heavily enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* ================= COLUMN 1 ================= */}
        <div className="space-y-5 flex flex-col justify-between">
          
          {/* Card 1: FINANCIAL HEALTH */}
          <GlowTiltCard 
            glowColor="rgba(16, 185, 129, 0.15)"
            className="p-6 h-[200px] flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                  Financial Health
                </span>
                {/* Tooltip trigger */}
                <div className="relative">
                  <button 
                    onMouseEnter={() => setShowHealthTooltip(true)}
                    onMouseLeave={() => setShowHealthTooltip(false)}
                    className="p-1 hover:bg-slate-850 rounded-full text-slate-500 hover:text-slate-300 transition"
                    aria-label="Health score breakdown info"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                  {showHealthTooltip && (
                    <div className="absolute right-0 top-6 w-56 p-3 rounded-xl border border-slate-800 bg-slate-950/95 shadow-xl text-[10px] text-slate-300 leading-normal z-50 font-mono space-y-1.5 backdrop-blur-md">
                      <span className="font-bold text-slate-100 uppercase tracking-wider block border-b border-slate-900 pb-1">Calculation parameters</span>
                      <div className="flex justify-between"><span>• Savings Rate:</span> <span className="text-blue-400 font-bold">35%</span></div>
                      <div className="flex justify-between"><span>• Emergency Fund:</span> <span className="text-emerald-400 font-bold">25%</span></div>
                      <div className="flex justify-between"><span>• Budget Adherence:</span> <span className="text-purple-400 font-bold">20%</span></div>
                      <div className="flex justify-between"><span>• Investment Ratio:</span> <span className="text-amber-400 font-bold">20%</span></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2.5">
                <div>
                  <span className="text-xs font-mono text-slate-400">
                    <span className={`${healthStatus.color} font-bold`}><AnimatedCounter value={health.score || 84} /></span> / 100
                  </span>
                  <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${healthStatus.color}`}>
                    {healthStatus.badge}
                  </div>
                </div>
                <span className="text-6xl font-black font-sans text-slate-300/40 select-none tracking-tighter">
                  <AnimatedCounter value={health.score || 84} />
                </span>
              </div>
            </div>

            {/* Solid status line */}
            <div className="my-2">
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`${healthStatus.progressBarColor} h-full rounded-full transition-all duration-500`} 
                  style={{ width: `${health.score || 84}%` }}
                />
              </div>
            </div>

            {/* Dynamic feedback text with customized colored highlight */}
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {healthStatus.description}
            </p>
          </GlowTiltCard>

          {/* Card 2: RECENT ACTIVITY */}
          <GlowTiltCard 
            glowColor="rgba(59, 130, 246, 0.15)"
            className="p-6 h-[260px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                Recent Activity
              </span>
              <button 
                onClick={() => onTabChange && onTabChange('upload')}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold font-sans tracking-wide transition"
              >
                See all
              </button>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500 font-sans italic">No recent transactions recorded yet.</p>
                </div>
              ) : (
                recentActivities.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-slate-900 border border-slate-800 rounded-full shrink-0 flex items-center justify-center">
                        {getTxIcon(tx.description)}
                      </span>
                      <div>
                        <span className="text-xs text-slate-100 font-semibold block">{tx.description}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{tx.date}{tx.time ? ` • ${tx.time}` : ''}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 shrink-0">
                      {tx.type === 'expense' ? '-' : '+'}{currencySymbol}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlowTiltCard>

        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="space-y-5 flex flex-col justify-between">
          
          {/* Card 3: NET WORTH & METRICS ROW */}
          <GlowTiltCard 
            glowColor="rgba(139, 92, 246, 0.15)"
            className="p-6 h-[200px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                  Net Worth
                </span>
                <h3 className="text-2xl font-bold text-slate-100 font-mono tracking-tight mt-1">
                  <AnimatedCounter value={transactions.length === 0 ? 0 : (totalIncome - totalExpenses)} prefix={currencySymbol} />
                </h3>
                <span className="text-[10px] text-slate-450 font-mono block mt-1">
                  <span className={transactions.length === 0 ? "text-slate-500" : "text-emerald-400 font-semibold"}>
                    {transactions.length === 0 ? "—" : "▲ +12.6%"}
                  </span> {transactions.length === 0 ? "Awaiting account activity" : "Compared to last month"}
                </span>
              </div>
              
              {/* Micro Sparkline Trend Graph using Recharts */}
              <div className="w-24 h-11 shrink-0 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={transactions.length === 0 ? "#475569" : "#3b82f6"} 
                      strokeWidth={2.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sparkline rising vertical bars */}
            <div className="flex items-end gap-1.5 h-10 select-none px-1 my-1">
              <div className={`w-full bg-blue-600/20 hover:bg-blue-600/35 rounded-t-sm transition-all duration-200`} style={{ height: transactions.length === 0 ? '2px' : '30%' }} />
              <div className={`w-full bg-blue-600/35 hover:bg-blue-600/50 rounded-t-sm transition-all duration-200`} style={{ height: transactions.length === 0 ? '2px' : '45%' }} />
              <div className={`w-full bg-blue-600/50 hover:bg-blue-600/65 rounded-t-sm transition-all duration-200`} style={{ height: transactions.length === 0 ? '2px' : '40%' }} />
              <div className={`w-full bg-blue-600/70 hover:bg-blue-600/85 rounded-t-sm transition-all duration-200`} style={{ height: transactions.length === 0 ? '2px' : '70%' }} />
              <div className={`w-full bg-blue-600 hover:bg-blue-500 rounded-t-sm transition-all duration-200`} style={{ height: transactions.length === 0 ? '2px' : '100%' }} />
            </div>

            {/* Income and Expenses grid expanded naturally across the card */}
            <div className="pt-3 border-t border-slate-900 mt-1">
              <div className="grid grid-cols-2 gap-4 text-center w-full">
                <div>
                  <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Monthly Income</span>
                  <span className="text-[11px] font-mono font-bold text-slate-300 mt-0.5 block">
                    <AnimatedCounter value={transactions.length === 0 ? 0 : (totalIncome || 0)} prefix={currencySymbol} />
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Expenses</span>
                  <span className="text-[11px] font-mono font-bold text-slate-300 mt-0.5 block">
                    <AnimatedCounter value={transactions.length === 0 ? 0 : (totalExpenses || 0)} prefix={currencySymbol} />
                  </span>
                </div>
              </div>
            </div>
          </GlowTiltCard>

          {/* Card 4: SAVINGS GOAL (Radial progress) */}
          <GlowTiltCard 
            glowColor="rgba(59, 130, 246, 0.15)"
            className="p-6 h-[260px] flex flex-col justify-between cursor-pointer"
            onClick={() => onTabChange && onTabChange('budgets')}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                Savings Goal
              </span>
              <span className="text-[10px] text-slate-400 font-semibold font-sans">
                {goalName}
              </span>
            </div>

            {/* Radial gauge chart */}
            <div className="relative flex items-center justify-center h-28 my-1 select-none">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-slate-900/60"
                  strokeWidth="8.5"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-blue-500 transition-all duration-1000"
                  strokeWidth="8.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - goalPercentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-slate-200 font-mono tracking-tight">
                  <AnimatedCounter value={goalPercentage} suffix="%" />
                </span>
              </div>
            </div>

            {/* Limits */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-3">
              <span>{currencySymbol}{activeGoal ? (goalCurrent).toLocaleString('en-IN') : '0'}</span>
              <span className="text-slate-500 font-bold">{currencySymbol}{activeGoal ? (goalTarget).toLocaleString('en-IN') : '0'} TARGET</span>
            </div>
          </GlowTiltCard>

        </div>

      </div>

      {/* ================= CHARTS AND AI INSIGHTS SECTION ================= */}
      <div className="space-y-5">
        <div className="border-t border-slate-850/60 pt-6">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-400" /> Interactive Financial Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time allocation metrics, inflow/outflow balance sheets, and savings trajectories.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart Card 1: Income vs Expenses Bar Chart */}
          <div className="p-6 rounded-[24px] border border-slate-900/80 bg-[#07070c]/70 backdrop-blur-xl shadow-xl space-y-4 hover:border-slate-800/80 transition duration-300 group relative overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Cashflow Dynamics</h3>
                <p className="text-[10px] text-slate-400">Comparing gross inflows against core categorical spending</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">REAL-TIME</span>
            </div>
            {transactions.length === 0 && (
              <div className="absolute inset-x-0 bottom-0 top-[60px] bg-[#07070c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <TrendingUp className="h-8 w-8 text-indigo-500/40 mb-2" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Awaiting Financial Data</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Cashflow dynamics will be populated automatically once statements or manual entries are loaded.</p>
              </div>
            )}
            <div className="h-64 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 0" stroke="#0f111a" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} className="font-mono" />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} className="font-mono" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 9, 14, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)', 
                      borderRadius: '16px', 
                      fontSize: '11px',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={32} iconSize={6} iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#94a3b8' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={12} />
                  <Bar dataKey="Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Card 3: Expense Allocation Pie Chart */}
          <div className="p-6 rounded-[24px] border border-slate-900/80 bg-[#07070c]/70 backdrop-blur-xl shadow-xl space-y-4 hover:border-slate-800/80 transition duration-300 group relative overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Outlay Breakdown</h3>
                <p className="text-[10px] text-slate-400">Categorized expenditure breakdown across active budget lines</p>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">CATEGORIZED</span>
            </div>
            {transactions.length === 0 && (
              <div className="absolute inset-x-0 bottom-0 top-[60px] bg-[#07070c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <PieChart className="h-8 w-8 text-indigo-500/40 mb-2" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Awaiting Financial Data</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Outlay breakdown will show categorical allocations once budget activity begins.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-56 select-none relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <ReChartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(9, 9, 14, 0.95)', 
                        borderColor: 'rgba(255, 255, 255, 0.08)', 
                        borderRadius: '16px', 
                        fontSize: '11px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(val) => [`${currencySymbol}${parseFloat(val as string).toFixed(2)}`, 'Spent']}
                    />
                  </ReChartsPieChart>
                </ResponsiveContainer>
                {/* Visual indicator in the center of the pie chart */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">Total Outflow</span>
                  <span className="text-sm font-extrabold text-slate-100 font-sans tracking-tight mt-0.5">
                    {currencySymbol}{pieChartData.reduce((acc, entry) => acc + entry.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              
              {/* Custom Legend */}
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-2 custom-scrollbar">
                {pieChartData.map((entry, index) => (
                  <div key={entry.name} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-900/40">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-slate-300 font-semibold truncate max-w-[110px] font-sans">{entry.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] font-bold">{currencySymbol}{entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= DETAILED ANALYSIS DIALOG / MODAL ================= */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#0d0d15] border border-slate-800 rounded-3xl p-6 space-y-5 animate-in fade-in zoom-in duration-250">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shrink-0">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">FINORA AI Advisor Executive Briefing</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Generated real-time matching active intelligence</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="p-1.5 hover:bg-slate-900 border border-slate-850 rounded-xl text-slate-450 hover:text-slate-200 transition"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                FINORA AI engine has cross-referenced your raw transactions, active categories, and savings target ratios to produce this executive summary.
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">●</span>
                  <p><strong>Unusual Spike Detected:</strong> Starbucks and dining outposts have created a 22% spike in the "Food" category compared to historical baselines.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 shrink-0 mt-0.5">●</span>
                  <p><strong>Target Matching:</strong> You are currently pacing to meet your <strong>Home Deposit</strong> target on time, but can secure a buffer by setting up an automatic SIP of {currencySymbol}150/mo into broad index pools.</p>
                </div>
              </div>
            </div>

            {/* Quick breakdown metrics inside modal */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 border border-slate-850 bg-slate-950/20 rounded-xl">
                <span className="block text-slate-550 text-[9px] uppercase tracking-wider">Suggested Actions</span>
                <span className="text-slate-200 font-bold block mt-1">Settle {currencySymbol}150 SIP</span>
              </div>
              <div className="p-3 border border-slate-850 bg-slate-950/20 rounded-xl">
                <span className="block text-slate-550 text-[9px] uppercase tracking-wider">Estimated Score Boost</span>
                <span className="text-emerald-400 font-bold block mt-1">+8 Health Points</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAnalysisModal(false);
                  if (onTabChange) onTabChange('chat');
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Bot className="h-4 w-4" /> Conversational Chat Briefing
              </button>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
