import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Compass, Calendar, AlertCircle, ChevronUp, 
  HelpCircle, RefreshCw, BarChart2, ShieldAlert, Sparkles, Check 
} from 'lucide-react';
import GlowTiltCard from './GlowTiltCard';
import AnimatedCounter from './AnimatedCounter';

interface ForecastItem {
  label: string;
  predictedSavings: number;
  growthAmount: number;
  confidenceScore: number;
  accuracy: string;
}

interface SavingsForecastProps {
  currentSavings: number;
  monthlySavings: number;
  currencySymbol: string;
}

export default function SavingsForecast({
  currentSavings,
  monthlySavings,
  currencySymbol
}: SavingsForecastProps) {
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<'standard' | 'optimistic' | 'frugal'>('standard');

  // Load prediction intervals from server
  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setForecast(data.forecast);
      } else {
        setError("Could not parse prediction weights");
      }
    } catch (err) {
      setError("Prediction server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  // Compute alternative scenario simulations on-the-fly
  const getSimulatedSavings = (item: ForecastItem) => {
    let multiplier = 1;
    if (scenario === 'optimistic') {
      multiplier = 1.25; // 25% better savings rate due to smart cutbacks
    } else if (scenario === 'frugal') {
      multiplier = 1.5; // Extreme frugal mode (50% bonus)
    }

    const baseGrowth = item.growthAmount;
    const finalGrowth = baseGrowth * multiplier;
    return currentSavings + finalGrowth;
  };

  const getScenarioDescription = () => {
    switch (scenario) {
      case 'optimistic': return "Simulates a 25% increase in monthly savings rate by cutting redundant subscriptions and food orders.";
      case 'frugal': return "Simulates a 50% surge in monthly savings rate. Emphasizes absolute essential expenditures only.";
      default: return "Maintains your current average ledger run rate without adjusting category budgets.";
    }
  };

  // Custom high-fidelity SVG trend visualizer
  const maxForecastAmt = forecast.length > 0 
    ? Math.max(...forecast.map(f => getSimulatedSavings(f))) 
    : 10000;

  const minForecastAmt = currentSavings;

  const points = forecast.map((f, index) => {
    const x = 50 + (index * 90);
    const simulatedAmt = getSimulatedSavings(f);
    const range = maxForecastAmt - minForecastAmt || 1;
    // Map to SVG height 50 to 180 (so lower is bottom, higher is top)
    const y = 180 - ((simulatedAmt - minForecastAmt) / range) * 120;
    return { x, y, label: f.label, amount: simulatedAmt };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2 tracking-tight">
            Savings Forecasting Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Machine intelligence modeling of your cash surplus across standard intervals.
          </p>
        </div>
        <button 
          onClick={fetchForecast}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition duration-200 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Model
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: scenario selection & statistics card */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor={
              scenario === 'standard' ? 'rgba(99, 102, 241, 0.12)' :
              scenario === 'optimistic' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.12)'
            }
            className="p-5 space-y-4 h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-900">
                <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">Simulation Scenarios</h3>
                <p className="text-[10px] text-slate-450 mt-1">Toggle variables to adjust forecast models.</p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => setScenario('standard')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                    scenario === 'standard' 
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-200' 
                      : 'border-slate-850 bg-slate-950/40 text-slate-450 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold font-sans">Standard Model</p>
                    <p className="text-[9px] font-mono opacity-80 mt-1">Current run rate: {currencySymbol}{monthlySavings.toFixed(0)}/mo</p>
                  </div>
                  {scenario === 'standard' && <span className="p-1 bg-indigo-500 rounded-full text-white"><Check className="h-2.5 w-2.5" /></span>}
                </button>

                <button 
                  onClick={() => setScenario('optimistic')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                    scenario === 'optimistic' 
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-200' 
                      : 'border-slate-850 bg-slate-950/40 text-slate-450 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold font-sans">Smart Cutback (1.25x)</p>
                    <p className="text-[9px] font-mono opacity-80 mt-1">Simulated rate: {currencySymbol}{(monthlySavings * 1.25).toFixed(0)}/mo</p>
                  </div>
                  {scenario === 'optimistic' && <span className="p-1 bg-emerald-500 rounded-full text-white"><Check className="h-2.5 w-2.5" /></span>}
                </button>

                <button 
                  onClick={() => setScenario('frugal')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                    scenario === 'frugal' 
                      ? 'border-purple-500 bg-purple-500/10 text-slate-200' 
                      : 'border-slate-850 bg-slate-950/40 text-slate-450 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold font-sans">Absolute Frugal (1.50x)</p>
                    <p className="text-[9px] font-mono opacity-80 mt-1">Simulated rate: {currencySymbol}{(monthlySavings * 1.5).toFixed(0)}/mo</p>
                  </div>
                  {scenario === 'frugal' && <span className="p-1 bg-purple-500 rounded-full text-white"><Check className="h-2.5 w-2.5" /></span>}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl mt-4">
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1 font-bold">Scenario Impact</p>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{getScenarioDescription()}</p>
            </div>
          </GlowTiltCard>
        </div>

        {/* Right column: Chart visualizer and forecasted values cards */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* SVG Line Graph showing trajectory */}
          <div className="p-6 rounded-[24px] border border-slate-900/80 bg-[#07070c]/70 backdrop-blur-xl shadow-xl">
            <div className="pb-3 border-b border-slate-900/60 mb-5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest">Projected Trajectory</h3>
                <p className="text-[10px] text-slate-400">Visual path of compounding balances based on regression models.</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full">COMPOUND INTEREST GRAPH</span>
            </div>

            {loading ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400 mb-2" />
                Computing linear variables...
              </div>
            ) : points.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 font-sans text-xs">
                No active ledger transactions to base forecast on.
              </div>
            ) : (
              <div className="relative">
                <svg viewBox="0 0 500 220" className="w-full h-56 overflow-visible select-none">
                  <defs>
                    <linearGradient id="svgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <line x1="50" y1="180" x2="410" y2="180" stroke="#0f111a" strokeWidth="1" />
                  <line x1="50" y1="120" x2="410" y2="120" stroke="#0f111a" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="50" y1="60" x2="410" y2="60" stroke="#0f111a" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Draw Shaded Area below line */}
                  <path
                    d={`M 50 180 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L 410 180 Z`}
                    fill="url(#svgAreaGrad)"
                  />

                  {/* Draw connection lines */}
                  <path
                    d={`M 50 180 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Nodes & tooltip values */}
                  {points.map((p, idx) => (
                    <g key={p.label} className="group/node">
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="5" 
                        className="fill-indigo-400 stroke-slate-950 stroke-2 hover:r-7 transition-all duration-200 cursor-pointer" 
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 12} 
                        className="fill-slate-200 text-[10px] font-mono font-bold" 
                        textAnchor="middle"
                      >
                        {currencySymbol}{Math.round(p.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </text>
                      <text 
                        x={p.x} 
                        y="198" 
                        className="fill-slate-500 text-[10px] font-mono font-semibold" 
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                  <text x="40" y="180" className="fill-slate-600 text-[10px] font-mono" textAnchor="end">
                    {currencySymbol}{Math.round(minForecastAmt).toLocaleString()}
                  </text>
                  <text x="40" y="60" className="fill-slate-600 text-[10px] font-mono" textAnchor="end">
                    {currencySymbol}{Math.round(maxForecastAmt).toLocaleString()}
                  </text>
                </svg>
              </div>
            )}
          </div>

          {/* List of forecast metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {forecast.map((f) => {
              const simulatedAmt = getSimulatedSavings(f);
              const growthPct = ((simulatedAmt - currentSavings) / (currentSavings || 1)) * 100;
              return (
                <div key={f.label} className="p-3.5 rounded-2xl border border-slate-900/60 bg-[#09090e]/40 space-y-1 text-center relative overflow-hidden shadow-md">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">{f.label}</span>
                  <span className="text-xs font-mono font-bold text-slate-200 block mt-1.5">
                    {currencySymbol}{Math.round(simulatedAmt).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                    +{growthPct.toFixed(0)}% growth
                  </span>
                  <div className="pt-2 border-t border-slate-900/40 mt-2 flex items-center justify-center gap-1 font-mono">
                    <span className="text-[8px] text-slate-500">Confidence:</span>
                    <span className="text-[8px] font-bold text-indigo-400">{f.confidenceScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
