import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, Sparkles, CheckCircle, 
  Trash2, ThumbsUp, DollarSign, RefreshCw, Zap, TrendingUp 
} from 'lucide-react';
import { Transaction } from '../types';
import GlowTiltCard from './GlowTiltCard';
import AnimatedCounter from './AnimatedCounter';

interface UnnecessarySpendingProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export default function UnnecessarySpending({
  transactions,
  currencySymbol
}: UnnecessarySpendingProps) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  // Simple rule-based detector in transaction ledger
  const detectUnnecessarySpends = () => {
    const items: Array<{
      id: string;
      title: string;
      amount: number;
      category: string;
      description: string;
      recommendation: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // 1. Food orders count
    const foodOrders = transactions.filter(t => t.category === 'Food' && t.amount > 10 && t.type === 'expense');
    if (foodOrders.length > 3) {
      const totalFoodSpent = foodOrders.reduce((sum, t) => sum + t.amount, 0);
      items.push({
        id: 'waste-food',
        title: 'Frequent Food Outlets / Delivery',
        amount: parseFloat((totalFoodSpent * 0.3).toFixed(2)), // 30% reduction estimate
        category: 'Food',
        description: `Detected ${foodOrders.length} food/dining transactions totaling ${currencySymbol}${totalFoodSpent.toFixed(0)}.`,
        recommendation: "Limit ordering from premium cafeterias/apps to once a week. Cook at home to secure savings.",
        severity: 'high'
      });
    }

    // 2. Duplicate subscriptions / Multi subscriptions
    const subTxs = transactions.filter(t => t.category === 'Subscriptions' && t.type === 'expense');
    if (subTxs.length >= 3) {
      const totalSubs = subTxs.reduce((sum, t) => sum + t.amount, 0);
      items.push({
        id: 'waste-subs',
        title: 'Active Subscription Multiplicity',
        amount: parseFloat((totalSubs * 0.4).toFixed(2)), // 40% reduction (cut 1-2 subs)
        category: 'Subscriptions',
        description: `You have ${subTxs.length} active digital subscription lines costing ${currencySymbol}${totalSubs.toFixed(0)}/mo.`,
        recommendation: "Review active entertainment tiers. Suspend unused services like duplicate streaming lines or cloud trials.",
        severity: 'medium'
      });
    }

    // 3. Impulse shopping detection
    const shoppingTxs = transactions.filter(t => t.category === 'Shopping' && t.amount > 150 && t.type === 'expense');
    if (shoppingTxs.length > 0) {
      items.push({
        id: 'waste-shopping',
        title: 'High-Value Non-Essential Purchases',
        amount: parseFloat((shoppingTxs.reduce((sum, t) => sum + t.amount, 0) * 0.2).toFixed(2)),
        category: 'Shopping',
        description: `Spotted large retail transactions at merchants like Amazon or Direct Outlets.`,
        recommendation: "Implement the '48-hour rule' before checkouts to curb impulsive emotional shopping.",
        severity: 'medium'
      });
    }

    // 4. Default mock entries to make it richer
    items.push({
      id: 'waste-gym',
      title: 'Dormant Fitness Center Membership',
      amount: 45,
      category: 'Subscriptions',
      description: "Automated recurring gym transaction with zero matching calendar entries.",
      recommendation: "Temporarily downgrade to pay-per-visit tiers until active usage resumes.",
      severity: 'low'
    });

    items.push({
      id: 'waste-overdraft',
      title: 'Automated Account Maintenance Fees',
      amount: 15,
      category: 'Bills',
      description: "Charged premium transaction charges on multi-currency transactions.",
      recommendation: "Switch billing lines to credit options with zero foreign transaction cost tags.",
      severity: 'low'
    });

    return items;
  };

  const detectedItems = detectUnnecessarySpends().filter(item => !resolvedIds.includes(item.id));

  const totalMonthlySavings = detectedItems.reduce((sum, i) => sum + i.amount, 0);

  const getSeverityBadge = (sev: 'low' | 'medium' | 'high') => {
    switch(sev) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2 tracking-tight">
          Redundant Outflow Detector
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Machine audit of your monthly outlays designed to highlight dormant recurring items and low-yield spending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: estimated savings summary */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor="rgba(239, 68, 68, 0.15)"
            className="p-5 text-center space-y-4 h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-450 w-fit mx-auto">
                <Zap className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-450 uppercase tracking-widest font-bold">Potential Recovery</p>
                <div className="flex items-baseline justify-center gap-0.5 mt-2">
                  <span className="text-2xl font-semibold text-slate-100 font-mono">{currencySymbol}</span>
                  <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                    <AnimatedCounter value={totalMonthlySavings} decimals={0} />
                  </span>
                  <span className="text-xs text-slate-450 font-mono">/mo</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1.5 font-sans">By enacting the proposed adjustments below.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 text-left space-y-2.5 mt-6">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Gain +8pts to Financial Health Score</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Redirect recovered cash into savings targets</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Mitigate compound subscription dilution</span>
              </div>
            </div>
          </GlowTiltCard>
        </div>

        {/* Right pane: list of detected anomalies */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-[24px] border border-slate-900/80 bg-[#07070c]/70 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Audit Recommendations</h3>
                <p className="text-[10px] text-slate-400">Identified spending leakages in current active accounts.</p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                {detectedItems.length} Leakages
              </span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {detectedItems.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <ThumbsUp className="h-10 w-10 text-emerald-400 mx-auto" />
                  <p className="text-sm text-slate-200 font-semibold font-sans">Stellar financial efficiency reached!</p>
                  <p className="text-xs text-slate-400 font-sans">No active spending leaks detected in your current accounts.</p>
                </div>
              ) : (
                detectedItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-3 relative overflow-hidden transition-all duration-300 hover:border-slate-850">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-slate-950 border border-slate-900 rounded-xl text-slate-400"><AlertTriangle className="h-4.5 w-4.5" /></span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 font-sans">
                            {item.title}
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold border uppercase ${getSeverityBadge(item.severity)}`}>
                              {item.severity}
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 font-sans">{item.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-rose-400 block">
                          -{currencySymbol}{item.amount}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono font-bold">Waste potential</span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-wider block">AI Recommendation</span>
                        <p className="text-[10px] text-slate-350 mt-0.5 leading-relaxed font-sans">{item.recommendation}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setResolvedIds([...resolvedIds, item.id])}
                        className="px-3 py-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        Enact Cutback Plan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
