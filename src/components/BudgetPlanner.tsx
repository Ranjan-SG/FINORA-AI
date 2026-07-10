import React, { useState } from 'react';
import { 
  Target, Award, Calendar, ChevronRight, Plus, Trash2, 
  AlertTriangle, CheckCircle2, TrendingUp, Sparkles, X, PiggyBank, DollarSign, Clock
} from 'lucide-react';
import { Budget, SavingsGoal } from '../types';
import GlowTiltCard from './GlowTiltCard';

interface BudgetPlannerProps {
  budgets: Budget[];
  goals: SavingsGoal[];
  onUpdateBudgetLimit: (category: string, limit: number) => Promise<void>;
  onSaveGoal: (goal: Partial<SavingsGoal>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  currencySymbol: string;
}

export default function BudgetPlanner({
  budgets,
  goals,
  onUpdateBudgetLimit,
  onSaveGoal,
  onDeleteGoal,
  currencySymbol
}: BudgetPlannerProps) {
  // Budget Limit editing
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  // Goal Form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDate, setGoalDate] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [goalCategory, setGoalCategory] = useState<'vacation' | 'car' | 'emergency' | 'house' | 'laptop' | 'education' | 'wedding' | 'other'>('emergency');

  // Interactive Goal Top-Up
  const [toppingUpId, setToppingUpId] = useState<string | null>(null);
  const [topUpAmt, setTopUpAmt] = useState('');

  const handleUpdateBudget = async (category: string) => {
    if (!tempLimit) return;
    await onUpdateBudgetLimit(category, parseFloat(tempLimit));
    setEditingCategory(null);
    setTempLimit('');
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    await onSaveGoal({
      name: goalName,
      target: parseFloat(goalTarget),
      current: parseFloat(goalCurrent) || 0,
      targetDate: goalDate,
      category: goalCategory
    });

    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
    setShowGoalForm(false);
  };

  const handleTopUpGoal = async (goal: SavingsGoal) => {
    if (!topUpAmt) return;
    const added = parseFloat(topUpAmt);
    await onSaveGoal({
      ...goal,
      current: goal.current + added
    });
    setToppingUpId(null);
    setTopUpAmt('');
  };

  const getGoalIcon = (category: string) => {
    switch(category) {
      case 'vacation': return '✈️';
      case 'car': return '🚗';
      case 'emergency': return '🛡️';
      case 'house': return '🏠';
      case 'laptop': return '💻';
      case 'education': return '🎓';
      case 'wedding': return '💍';
      default: return '💰';
    }
  };

  // Monthly Contribution calculation helper
  const calculateMonthlyContribution = (target: number, current: number, targetDateStr: string): { remaining: number; months: number; monthlyAmt: number } => {
    const remaining = Math.max(target - current, 0);
    if (remaining <= 0) return { remaining: 0, months: 0, monthlyAmt: 0 };

    const today = new Date();
    const targetDate = new Date(targetDateStr);
    
    let months = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
    if (months <= 0) months = 1; // At least 1 month if due soon

    const monthlyAmt = remaining / months;
    return { remaining, months, monthlyAmt };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Limits & Objectives
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Set monthly boundaries, declare target dates, and deploy surplus cash towards liquid milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Category Budget Planner */}
        <GlowTiltCard 
          glowColor="rgba(99, 102, 241, 0.1)"
          className="p-5 space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
            <div>
              <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Monthly Budget Thresholds</h3>
              <p className="text-[10px] text-slate-450">Guarding maximum bounds on repetitive category outlays.</p>
            </div>
            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Monitoring</span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {budgets.map((b) => {
              const spentPercent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
              const isOver = b.spent > b.limit;
              const isClose = spentPercent >= 85 && spentPercent <= 100;

              return (
                <div key={b.category} className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 relative overflow-hidden group">
                  {/* Subtle warning glow or pulse indicator */}
                  {isOver && (
                    <div className="absolute inset-0 bg-rose-500/[0.02] border-l-4 border-rose-500 animate-pulse" />
                  )}
                  {isClose && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                  )}

                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{b.category}</h4>
                      <p className="text-[10px] mt-0.5 font-mono">
                        {isOver ? (
                          <span className="text-rose-400 flex items-center gap-1 font-bold animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> ⚠ Budget Exceeded by {currencySymbol}{(b.spent - b.limit).toFixed(0)}
                          </span>
                        ) : isClose ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Approaching budget cap
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            {currencySymbol}{(b.limit - b.spent).toLocaleString(undefined, {maximumFractionDigits: 0})} Remaining safely
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      {editingCategory === b.category ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            required
                            placeholder="New limit"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded p-1 text-xs text-slate-300 w-20 text-right font-mono"
                          />
                          <button 
                            onClick={() => handleUpdateBudget(b.category)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold"
                          >
                            Set
                          </button>
                          <button 
                            onClick={() => setEditingCategory(null)}
                            className="text-slate-400 hover:text-slate-200 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-100">
                            <span className={isOver ? "text-rose-400 font-bold" : "text-slate-200"}>{currencySymbol}{b.spent.toLocaleString()}</span>
                            <span className="text-slate-500 font-normal"> Spent / {currencySymbol}{b.limit.toLocaleString()}</span>
                          </span>
                          <button 
                            onClick={() => { setEditingCategory(b.category); setTempLimit(b.limit.toString()); }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 transition"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Progress Bar with custom design and glows */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isOver 
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                          : isClose 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                      }`}
                      style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlowTiltCard>

        {/* Right Panel: Savings Goals Tracker */}
        <GlowTiltCard 
          glowColor="rgba(16, 185, 129, 0.1)"
          className="p-5 space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
            <div>
              <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Wealth Milestones</h3>
              <p className="text-[10px] text-slate-450">Track target dates, remaining values, and required contributions.</p>
            </div>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-1 shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New Objective
            </button>
          </div>

          {/* Goal Creator Form */}
          {showGoalForm && (
            <form onSubmit={handleCreateGoal} className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Goal Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. New Macbook Pro M4"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Amount</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Current Saved</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Milestone Category</label>
                  <select 
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  >
                    <option value="emergency">Emergency Fund</option>
                    <option value="vacation">Vacation / Trip</option>
                    <option value="car">Automobile / Car</option>
                    <option value="house">Real Estate / House</option>
                    <option value="laptop">Electronics / Laptop</option>
                    <option value="education">Education</option>
                    <option value="wedding">Wedding / Family</option>
                    <option value="other">Other Objective</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowGoalForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          {/* Goals Milestone List with radial loader metrics */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {goals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No milestones active. Declare a new target to organize your surplus income!
              </div>
            ) : (
              goals.map((g) => {
                const completionPct = Math.min((g.current / g.target) * 100, 100);
                const isCompleted = g.current >= g.target;

                // Calculate required contribution
                const { remaining, months, monthlyAmt } = calculateMonthlyContribution(g.target, g.current, g.targetDate);

                return (
                  <div key={g.id} className="p-5 rounded-xl border border-slate-850 bg-slate-950/20 space-y-4 hover:border-slate-800 transition duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {/* Radial Progress indicator inside savings goals list */}
                        <div className="relative flex items-center justify-center shrink-0 w-11 h-11">
                          <svg className="w-11 h-11 transform -rotate-90">
                            <circle
                              cx="22"
                              cy="22"
                              r="18"
                              className="stroke-slate-850"
                              strokeWidth="3.5"
                              fill="transparent"
                            />
                            <circle
                              cx="22"
                              cy="22"
                              r="18"
                              className={`transition-all duration-1000 ${isCompleted ? 'stroke-emerald-400' : 'stroke-indigo-500'}`}
                              strokeWidth="3.5"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 18}
                              strokeDashoffset={2 * Math.PI * 18 * (1 - completionPct / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-extrabold text-slate-200 font-mono">{completionPct.toFixed(0)}%</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                            {g.name}
                            {isCompleted && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                                <Award className="h-2.5 w-2.5" /> Met
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Target Date: {g.targetDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {toppingUpId === g.id ? (
                          <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200">
                            <input 
                              type="number" 
                              placeholder="Amount"
                              value={topUpAmt}
                              onChange={(e) => setTopUpAmt(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded p-1 text-[11px] text-slate-300 w-16 text-right font-mono focus:outline-none focus:border-indigo-500"
                            />
                            <button 
                              onClick={() => handleTopUpGoal(g)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-semibold"
                            >
                              Add
                            </button>
                            <button 
                              onClick={() => setToppingUpId(null)}
                              className="text-slate-400 hover:text-slate-200 text-[10px]"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => setToppingUpId(g.id)}
                              className="px-2 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded text-[10px] border border-indigo-500/10 flex items-center gap-0.5 font-semibold transition"
                            >
                              <PiggyBank className="h-3 w-3" /> Fund
                            </button>
                            <button 
                              onClick={() => onDeleteGoal(g.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress details metrics row */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-450">
                        <div>
                          <span className="block text-slate-500 text-[8px] uppercase">Goal Target</span>
                          <span className="font-bold text-slate-200 block mt-0.5">{currencySymbol}{g.target.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 text-[8px] uppercase">Total Saved</span>
                          <span className="font-bold text-slate-200 block mt-0.5">{currencySymbol}{g.current.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 text-[8px] uppercase">Remaining</span>
                          <span className="font-bold text-rose-400/80 block mt-0.5">{currencySymbol}{remaining.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Estimated Required Monthly Contribution Briefing Card */}
                      {!isCompleted && remaining > 0 && (
                        <div className="p-2.5 rounded-lg bg-indigo-600/[0.03] border border-indigo-500/10 flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" /> Need monthly:
                          </span>
                          <span className="font-mono font-extrabold text-indigo-400">
                            {currencySymbol}{Math.round(monthlyAmt).toLocaleString()}/mo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlowTiltCard>
      </div>
    </div>
  );
}
