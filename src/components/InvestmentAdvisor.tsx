import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Award, ShieldAlert, Sparkles, HelpCircle, 
  ChevronRight, RefreshCw, Calculator, PieChart, Check, Info, ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart as ReChartsPieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { InvestmentProfile, InvestmentAllocation } from '../types';
import GlowTiltCard from './GlowTiltCard';
import AnimatedCounter from './AnimatedCounter';

interface InvestmentAdvisorProps {
  salary: number;
  monthlySavings: number;
  currencySymbol: string;
}

export default function InvestmentAdvisor({
  salary,
  monthlySavings,
  currencySymbol
}: InvestmentAdvisorProps) {
  // Questionnaire state
  const [profile, setProfile] = useState<InvestmentProfile>({
    age: 30,
    salary: salary || 6000,
    monthlySavings: monthlySavings || 1500,
    riskAppetite: 'medium',
    financialGoals: ['Retirement Buffer', 'Downpayment Fund']
  });

  const [allocations, setAllocations] = useState<InvestmentAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // SIP Calculator state
  const [sipMonthly, setSipMonthly] = useState('500');
  const [sipRate, setSipRate] = useState('8'); // 8% average index fund returns
  const [sipYears, setSipYears] = useState('15');
  const [sipResult, setSipResult] = useState<{ totalInvested: number; wealthGained: number; maturityValue: number } | null>(null);
  const [sipChartData, setSipChartData] = useState<Array<{ name: string; Invested: number; Value: number }>>([]);

  // Fetch AI/Local portfolio allocations
  const generatePortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/investments/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age,
          salary: profile.salary,
          monthlySavings: profile.monthlySavings,
          riskAppetite: profile.riskAppetite
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations);
        setIsGenerated(true);
      }
    } catch (err) {
      console.error("Investment suggest api failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePortfolio();
    calculateSIP();
  }, [profile.riskAppetite]);

  // SIP Math calculation + chart plotting
  const calculateSIP = () => {
    const monthly = parseFloat(sipMonthly) || 0;
    const annualRate = parseFloat(sipRate) || 0;
    const years = parseFloat(sipYears) || 0;

    if (monthly <= 0 || annualRate < 0 || years <= 0) return;

    const monthlyRate = (annualRate / 100) / 12;
    const months = years * 12;

    const maturityValue = monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalInvested = monthly * months;
    const wealthGained = Math.max(maturityValue - totalInvested, 0);

    setSipResult({
      totalInvested: Math.round(totalInvested),
      wealthGained: Math.round(wealthGained),
      maturityValue: Math.round(maturityValue)
    });

    // Generate annual growth datapoints for Recharts
    const dataPoints = [];
    for (let i = 1; i <= years; i++) {
      const m = i * 12;
      const mv = monthly * (((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate));
      const inv = monthly * m;
      dataPoints.push({
        name: `Yr ${i}`,
        Invested: Math.round(inv),
        Value: Math.round(mv)
      });
    }
    setSipChartData(dataPoints);
  };

  useEffect(() => {
    calculateSIP();
  }, [sipMonthly, sipRate, sipYears]);

  // Donut colors
  const ALLOC_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  // Detail recommendations specs builder
  const getRecommendationSpecs = (assetClass: string) => {
    const name = assetClass.toLowerCase();
    if (name.includes('fixed') || name.includes('ppf') || name.includes('bonds')) {
      return {
        returnRange: '6% - 8%',
        riskLevel: 'Low',
        riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        horizon: '3 - 7 Years',
        liquidity: 'Moderate (Locked)',
        tax: 'Sec 80C Exemptions',
        suitable: 'Conservative wealth builders & emergency pools'
      };
    }
    if (name.includes('index') || name.includes('mutual')) {
      return {
        returnRange: '10% - 13%',
        riskLevel: 'Medium',
        riskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        horizon: '5+ Years',
        liquidity: 'High (Immediate payout)',
        tax: '15% STCG / 10% LTCG',
        suitable: 'Long term balanced equity planners'
      };
    }
    if (name.includes('gold') || name.includes('commodity')) {
      return {
        returnRange: '7% - 9%',
        riskLevel: 'Low',
        riskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        horizon: '5+ Years',
        liquidity: 'High (T+1 Liquidation)',
        tax: 'Standard capital gains rates',
        suitable: 'Inflation hedges & systemic portfolio diversifiers'
      };
    }
    // High speculative
    return {
      returnRange: '15% - 25%+',
      riskLevel: 'High',
      riskColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      horizon: '3+ Years',
      liquidity: 'Instant (24/7 markets)',
      tax: '30% Flat Tax Rates',
      suitable: 'Aggressive traders with high volatility tolerance'
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2 tracking-tight">
          Capital Allocator & Wealth Advisor
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Machine recommended strategic indexing allocations matched to your current risk profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Risk profile questionnaire */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor="rgba(99, 102, 241, 0.12)"
            className="p-5 space-y-4"
          >
            <div>
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">Risk Profile Architect</h3>
              <p className="text-[10px] text-slate-450 mt-1">Declare parameters to optimize asset deployment.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Your Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 30 })}
                  className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Monthly Salary ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={profile.salary}
                  onChange={(e) => setProfile({ ...profile, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Monthly Savings ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={profile.monthlySavings}
                  onChange={(e) => setProfile({ ...profile, monthlySavings: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">Risk Appetite</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setProfile({ ...profile, riskAppetite: r })}
                      className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                        profile.riskAppetite === r 
                          ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
                          : 'bg-slate-950/45 text-slate-450 border-slate-900 hover:border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generatePortfolio}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer mt-2"
            >
              <Sparkles className="h-3.5 w-3.5" /> Recalculate Portfolio
            </button>
          </GlowTiltCard>

          {/* Quick SIP compound calculator widget with Annual Growth Graph */}
          <GlowTiltCard 
            glowColor="rgba(16, 185, 129, 0.08)"
            className="p-5 space-y-4"
          >
            <h3 className="text-xs font-bold font-sans text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Calculator className="h-4 w-4 text-emerald-400" /> SIP Compound Calculator
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Monthly Deposit ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Expected Rate (%)</label>
                  <input 
                    type="number" 
                    value={sipRate}
                    onChange={(e) => setSipRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Years Duration</label>
                  <input 
                    type="number" 
                    value={sipYears}
                    onChange={(e) => setSipYears(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850/80 rounded-xl p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {sipResult && (
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 bg-[#09090e]/60 border border-slate-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Total Invested:</span>
                      <span className="text-slate-300 font-bold">{currencySymbol}{sipResult.totalInvested.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Wealth Gained:</span>
                      <span className="text-emerald-450 font-bold">+{currencySymbol}{sipResult.wealthGained.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-2 border-t border-slate-900/60 font-mono font-bold">
                      <span className="text-slate-300">Future Corpus:</span>
                      <span className="text-indigo-400">{currencySymbol}{sipResult.maturityValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Dynamic SIP Annual Growth Chart */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Compounding Growth</span>
                    <div className="h-28 w-full bg-slate-950/50 border border-slate-900 rounded-2xl p-1 select-none overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sipChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#334155" fontSize={8} tickLine={false} />
                          <YAxis stroke="#334155" fontSize={8} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#07070a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '9px', backdropBlur: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`]}
                          />
                          <Area type="monotone" dataKey="Value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={1.5} />
                          <Area type="monotone" dataKey="Invested" stroke="#64748b" fill="#64748b" fillOpacity={0.03} strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlowTiltCard>
        </div>

        {/* Right Column: Suggested asset allocations & portfolios */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[24px] border border-slate-900/80 bg-[#07070c]/70 backdrop-blur-xl shadow-xl">
            <div className="pb-3 border-b border-slate-900/60 mb-5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Recommended Distribution</h3>
                <p className="text-[10px] text-slate-400">Structured index weighting optimized for {profile.riskAppetite} risk parameters.</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full uppercase">Asset Allocation Engine</span>
            </div>

            {loading ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400 mb-2" />
                Analyzing market variables...
              </div>
            ) : allocations.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 font-sans text-xs">
                Submit risk parameters to render layout.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* INTERACTIVE DONUT CHART REPLACE PERCENTAGE BARS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#09090e]/50 border border-slate-900/60 p-4 rounded-2xl">
                  <div className="h-44 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsPieChart>
                        <Pie
                          data={allocations}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="percentage"
                          nameKey="assetClass"
                        >
                          {allocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ALLOC_COLORS[index % ALLOC_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#07070a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', backdropBlur: '8px' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(val) => [`${val}%`, 'Allocation']}
                        />
                      </ReChartsPieChart>
                    </ResponsiveContainer>
                  </div>
 
                  {/* Donut Legend */}
                  <div className="space-y-2">
                    {allocations.map((a, i) => (
                      <div key={a.assetClass} className="flex justify-between items-center text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                          <span className="text-slate-300 font-medium truncate max-w-[150px]">{a.assetClass}</span>
                        </div>
                        <span className="font-mono text-indigo-400 font-bold">{a.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend list cards with rich specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allocations.map((a, i) => {
                    const borderColors = [
                      'border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40',
                      'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40',
                      'border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40',
                      'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                    ];
                    const textColors = [
                      'text-indigo-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400'
                    ];
                    
                    const specs = getRecommendationSpecs(a.assetClass);

                    return (
                      <div key={a.assetClass} className={`p-4 rounded-2xl border ${borderColors[i % borderColors.length]} space-y-3.5 transition-all duration-300 shadow-md`}>
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-250 font-sans">{a.assetClass}</h4>
                          <span className={`text-xs font-mono font-bold ${textColors[i % textColors.length]}`}>{a.percentage}%</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{a.description}</p>
                        
                        {/* Rich details specs */}
                        <div className="p-3 bg-slate-950/40 rounded-xl text-[10px] space-y-2 border border-slate-900/60 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Expected Yield:</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <ArrowUpRight className="h-3 w-3" /> {specs.returnRange}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Risk Profile:</span>
                            <span className={`px-1.5 py-0.2 rounded-full border text-[8px] font-bold ${specs.riskColor}`}>
                              {specs.riskLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Horizon Frame:</span>
                            <span className="text-slate-350 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {specs.horizon}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Liquidity Out:</span>
                            <span className="text-slate-350">{specs.liquidity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tax Exempt:</span>
                            <span className="text-indigo-400/90">{specs.tax}</span>
                          </div>
                          <div className="border-t border-slate-900/65 pt-2 mt-1.5">
                            <span className="text-slate-550 block uppercase tracking-wider text-[8px] font-bold">Ideal target:</span>
                            <span className="text-slate-400 not-italic block mt-0.5 font-sans leading-relaxed text-[10px]">{specs.suitable}</span>
                          </div>
                        </div>

                        {/* Examples of asset tickers */}
                        <div className="pt-2.5 border-t border-slate-900/60 mt-2">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest mb-2 flex items-center gap-1 font-bold">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Recommended Instruments
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {a.examples.map(ex => (
                              <span key={ex} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-900 text-[9px] text-slate-450 font-mono font-semibold">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
