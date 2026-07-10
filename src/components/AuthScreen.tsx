import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User, Phone, Check, AlertCircle, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Sparkles, TrendingUp, Cpu, Landmark 
} from 'lucide-react';
import GlowTiltCard from './GlowTiltCard';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Rotating financial tips states
  const [tipIndex, setTipIndex] = useState(0);
  const financialTips = [
    { category: "INSIGHT", text: "Automating 10% of your paycheck directly into savings helps build a robust emergency fund." },
    { category: "TIP", text: "The 50/30/20 rule simplifies budgeting: 50% for Needs, 30% for Wants, and 20% for Savings." },
    { category: "STRATEGY", text: "Diversification does not ensure profit, but it is the most crucial tool to manage investment risk." },
    { category: "TACTIC", text: "Subscription creep can silently siphon ₹5,000+ monthly. Audit your recurring services regularly." },
    { category: "WISDOM", text: "An emergency fund should cover 3 to 6 months of fixed living expenses for maximum safety." }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % financialTips.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Helper to validate email format
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Pre-seed Demo account
  React.useEffect(() => {
    const existingUsers = localStorage.getItem('finora_users');
    if (!existingUsers) {
      const demoUsers = [
        { name: 'Jane Doe', email: 'demo@finora.ai', password: 'Password123' }
      ];
      localStorage.setItem('finora_users', JSON.stringify(demoUsers));
    }
  }, []);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    const usersStr = localStorage.getItem('finora_users') || '[]';
    const users = JSON.parse(usersStr);

    const user = users.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!user) {
      setLoginError('No account found with this email. Please register.');
      return;
    }

    if (user.password !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    // Success
    const session = { name: user.name, email: user.email };
    localStorage.setItem('finora_session', JSON.stringify(session));
    onLoginSuccess(session);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(regEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    const usersStr = localStorage.getItem('finora_users') || '[]';
    const users = JSON.parse(usersStr);

    const emailExists = users.some((u: any) => u.email.toLowerCase() === regEmail.toLowerCase());
    if (emailExists) {
      setRegError('An account with this email already exists.');
      return;
    }

    // Add new user
    const newUser = {
      name: regName,
      email: regEmail,
      password: regPassword
    };

    users.push(newUser);
    localStorage.setItem('finora_users', JSON.stringify(users));

    setRegSuccess(true);
    setTimeout(() => {
      // Auto transition to login with registered credentials
      setLoginEmail(regEmail);
      setLoginPassword('');
      setView('login');
      setRegSuccess(false);
      // Clean register state
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans text-slate-100">
      
      {/* Background visual grid elements */}
      <div className="absolute inset-0 bg-slate-950 z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-slate-950 to-purple-950/20 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">
          
          {/* ================= LANDING PAGE VIEW ================= */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Premium Value Proposition */}
              <div className="lg:col-span-7 space-y-8 pr-4">
                
                {/* Logo with violet/blue gradient glow */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30 border border-indigo-500/40 select-none">
                    F
                  </div>
                  <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">FINORA AI</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight uppercase font-sans">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">FINORA AI</span>
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Empowering smarter financial decisions with AI-driven insights, predictive analytics, and personalized wealth intelligence. Keep track of cash flows, automate statement sorting, and plan investments inside our unified personal treasury system.
                  </p>
                </div>

                {/* Features Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2 flex gap-3.5 items-start">
                    <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                      <Cpu className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Intelligence Hub</h3>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Deep context financial suggestions and live advisory chatbots.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2 flex gap-3.5 items-start">
                    <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Interactive Predictions</h3>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Simulate compound trajectories with responsive savings models.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2 flex gap-3.5 items-start">
                    <span className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
                      <Landmark className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Compliant Auditing</h3>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Generate PDF ledgers or clean ledger backups securely.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2 flex gap-3.5 items-start">
                    <span className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Privacy Safeguards</h3>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Client session hashing ensures bank credentials stay offline.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => setView('login')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/15 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    Access Wealth Platform <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Preview Dashboard Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <GlowTiltCard 
                  glowColor="rgba(99, 102, 241, 0.2)"
                  className="p-6 w-full max-w-sm space-y-6 bg-slate-950/45 border border-slate-850 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">SYSTEM ACTIVE</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">NODE v2.4.0</span>
                  </div>

                   {/* Rotating Financial Insights */}
                   <div className="space-y-1 bg-slate-900/30 p-3.5 rounded-2xl border border-slate-900 min-h-[72px] flex flex-col justify-center">
                     <span className="text-[7.5px] text-indigo-400 font-extrabold font-mono tracking-widest uppercase block animate-pulse">
                       FINORA DAILY {financialTips[tipIndex].category}
                     </span>
                     <p className="text-[10px] font-semibold text-slate-200 leading-normal font-sans">
                       "{financialTips[tipIndex].text}"
                     </p>
                   </div>

                  {/* Mock Health Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">FINANCIAL HEALTH SCORE</span>
                      <span className="text-emerald-400 font-bold">84%</span>
                    </div>
                    <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                      <div className="h-full w-[84%] bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* Simulated Briefing */}
                  <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/15 text-[10px] text-slate-350 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1 text-indigo-400 font-bold uppercase text-[8px] tracking-wider">
                      <Sparkles className="h-3 w-3" /> AI Suggestion
                    </div>
                    <p>Compounding rate increased by 4.2% after subscription cleanup. Total surplus balance yields optimal growth indices.</p>
                  </div>

                  <button
                    onClick={() => setView('login')}
                    className="w-full py-2.5 text-center bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300"
                  >
                    Quick demo (demo@finora.ai)
                  </button>
                </GlowTiltCard>
              </div>

            </motion.div>
          )}

          {/* ================= LOGIN VIEW ================= */}
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <GlowTiltCard 
                glowColor="rgba(139, 92, 246, 0.2)"
                className="p-8 space-y-6 bg-slate-950/50 border border-slate-850 shadow-2xl relative"
              >
                {/* Logo and Headings */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30 border border-indigo-500/40 select-none">
                      F
                    </div>
                    <span className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">FINORA AI</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-sans">Welcome to FINORA AI</h2>
                    <p className="text-[11px] text-slate-450 leading-relaxed max-w-sm mx-auto">
                      Empowering smarter financial decisions with AI-driven insights, predictive analytics, and personalized wealth intelligence.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-3 text-xs text-rose-300 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input 
                        type="email"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                        placeholder="e.g. demo@finora.ai"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none transition duration-300 placeholder-slate-700 font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                        placeholder="Enter password"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-200 outline-none transition duration-300 placeholder-slate-700 font-sans"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox and Forgot Password link */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-900 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 accent-indigo-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-450 font-medium">Remember Me</span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setLoginError("Reset link sent! Please check your mailbox.")}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 transition font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Log In
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono uppercase tracking-widest py-1">
                  <span className="h-px bg-slate-900 w-[40%]" />
                  <span>OR</span>
                  <span className="h-px bg-slate-900 w-[40%]" />
                </div>

                {/* Register redirection */}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="w-full py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 hover:bg-slate-850/60 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300"
                >
                  Create New Account
                </button>

                {/* Credentials Hints */}
                <div className="p-3 rounded-lg bg-slate-900/40 text-[9px] text-slate-500 text-center font-mono space-y-0.5 border border-slate-900">
                  <p>Demo Account Sandbox Access</p>
                  <p className="text-slate-350">demo@finora.ai  /  Password123</p>
                </div>
              </GlowTiltCard>
            </motion.div>
          )}

          {/* ================= REGISTER VIEW ================= */}
          {view === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <GlowTiltCard 
                glowColor="rgba(59, 130, 246, 0.2)"
                className="p-8 space-y-5 bg-slate-950/50 border border-slate-850 shadow-2xl relative"
              >
                {/* Logo and Headings */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-500/30 border border-indigo-500/40 select-none">
                      F
                    </div>
                    <span className="text-xs font-extrabold tracking-widest text-white uppercase font-sans">FINORA AI</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight font-sans">Create Account</h2>
                    <p className="text-[10px] text-slate-450">
                      Join the premium AI wealth management sandbox.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {regError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {regSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>Account registered successfully! Redirecting...</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input 
                        type="text"
                        value={regName}
                        onChange={(e) => { setRegName(e.target.value); setRegError(''); }}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 outline-none transition placeholder-slate-700 font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                      </span>
                      <input 
                        type="email"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); setRegError(''); }}
                        placeholder="e.g. john@example.com"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 outline-none transition placeholder-slate-700 font-sans"
                        required
                      />
                    </div>
                  </div>



                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <input 
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                        placeholder="Minimum 6 characters"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2 pl-9 pr-10 text-xs text-slate-200 outline-none transition placeholder-slate-700 font-sans"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition"
                      >
                        {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <input 
                        type={showRegPassword ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={(e) => { setRegConfirmPassword(e.target.value); setRegError(''); }}
                        placeholder="Verify password"
                        className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 outline-none transition placeholder-slate-700 font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Create Account
                  </button>
                </form>

                {/* Back to login */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setView('login')}
                    className="text-[10px] text-slate-400 hover:text-white font-semibold transition"
                  >
                    Already have an account? <span className="text-indigo-400 font-bold">Login</span>
                  </button>
                </div>
              </GlowTiltCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
