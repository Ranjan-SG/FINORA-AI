import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Trash2, Edit2, 
  Search, Filter, Plus, Save, X, ArrowUpRight, ArrowDownRight, Sparkles,
  Coffee, Utensils, Flame, ShoppingBag, TrendingUp, Landmark, CreditCard, 
  Plane, Heart, Play, Film, HelpCircle, ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { Transaction } from '../types';
import GlowTiltCard from './GlowTiltCard';
import ParticleExplosion from './ParticleExplosion';
import AnimatedCounter from './AnimatedCounter';

interface StatementUploadProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onUploadSuccess: () => void;
  currencySymbol: string;
}

export default function StatementUpload({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUploadSuccess,
  currencySymbol
}: StatementUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<{ name: string; size: number; content: string; type: string } | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessState, setUploadSuccessState] = useState(false);

  // Manual Transaction entry Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Food',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    merchant: ''
  });

  // Editing Transaction state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  // Filtering & Search
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'merchant' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation helper
  const validateFileType = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['csv', 'txt', 'xlsx', 'xls', 'pdf'].includes(ext || '');
  };

  // Handler for drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFileText = (name: string, size: number, text: string) => {
    if (!validateFileType(name)) {
      setDragError("Unsupported file extension. Please upload a valid CSV, PDF, TXT or Excel document.");
      setFilePreview(null);
      return;
    }
    const ext = name.split('.').pop() || 'csv';
    setFilePreview({ name, size, content: text, type: ext });
    setDragError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDragError("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileText(file.name, file.size, text);
      };
      if (ext === 'pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileText(file.name, file.size, text);
      };
      if (ext === 'pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  // Submit file for AI/Local Parsing
  const handleUploadSubmit = async () => {
    if (!filePreview) return;
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 120);

    try {
      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: filePreview.content,
          fileName: filePreview.name,
          fileType: filePreview.type
        })
      });

      if (response.ok) {
        setUploadProgress(100);
        setUploadSuccessState(true);
        setTimeout(() => {
          setFilePreview(null);
          setUploadProgress(null);
          setUploadSuccessState(false);
          onUploadSuccess();
        }, 1800);
      } else {
        const errData = await response.json();
        setDragError(errData.error || "Failed to process bank statement.");
        setUploadProgress(null);
      }
    } catch (err) {
      setDragError("Network error. Ensure server is active.");
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const [pastedText, setPastedText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const handlePasteSubmit = () => {
    if (pastedText.trim().length > 0) {
      processFileText("pasted-statement.csv", pastedText.length, pastedText);
      setShowPasteBox(false);
      setPastedText('');
    }
  };

  const handleSaveAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    await onAddTransaction({
      date: newTx.date,
      description: newTx.description,
      category: newTx.category,
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      merchant: newTx.merchant || newTx.description.split(' ')[0]
    });

    setNewTx({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Food',
      amount: '',
      type: 'expense',
      merchant: ''
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditForm(tx);
  };

  const handleSaveEdit = async (id: string) => {
    await onUpdateTransaction(id, editForm);
    setEditingId(null);
  };

  const categories = [
    'Food', 'Shopping', 'Entertainment', 'Rent', 'Fuel', 'Travel', 'EMI', 
    'Bills', 'Medical', 'Insurance', 'Education', 'Salary', 'Investment', 
    'Subscriptions', 'Others'
  ];

  // Map category icons helper
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'food':
        return <Coffee className="h-3.5 w-3.5 text-amber-400" />;
      case 'fuel':
        return <Flame className="h-3.5 w-3.5 text-orange-400" />;
      case 'shopping':
        return <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />;
      case 'salary':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
      case 'investment':
        return <Landmark className="h-3.5 w-3.5 text-indigo-400" />;
      case 'bills':
      case 'emi':
        return <CreditCard className="h-3.5 w-3.5 text-purple-400" />;
      case 'travel':
        return <Plane className="h-3.5 w-3.5 text-sky-400" />;
      case 'medical':
        return <Heart className="h-3.5 w-3.5 text-rose-400" />;
      case 'subscriptions':
        return <Play className="h-3.5 w-3.5 text-violet-400" />;
      case 'entertainment':
        return <Film className="h-3.5 w-3.5 text-pink-400" />;
      default:
        return <Utensils className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  // Toggle sorting directions
  const requestSort = (field: 'date' | 'merchant' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // 1. Filtering transactions
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.merchant.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase()) ||
                          t.amount.toString().includes(search);
    const matchesCat = catFilter === 'All' || t.category === catFilter;
    const matchesType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
    
    // Amount range checks
    const min = parseFloat(amountMin);
    const max = parseFloat(amountMax);
    const matchesMin = isNaN(min) || t.amount >= min;
    const matchesMax = isNaN(max) || t.amount <= max;

    return matchesSearch && matchesCat && matchesType && matchesMin && matchesMax;
  });

  // 2. Sorting transactions
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    let fieldA: any = a[sortField];
    let fieldB: any = b[sortField];

    if (sortField === 'amount') {
      fieldA = a.amount;
      fieldB = b.amount;
    } else {
      fieldA = String(fieldA).toLowerCase();
      fieldB = String(fieldB).toLowerCase();
    }

    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // 3. Paginated transactions
  const totalItems = sortedTxs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTxs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          Statement Ingestion Ledger
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload statements from Chase, Citi, Revolut, HSBC, or custom bank logs. Categorized instantly by Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Drag/Drop Statement area */}
        <div className="lg:col-span-1 space-y-4">
          <GlowTiltCard 
            glowColor={isDragging ? "rgba(99, 102, 241, 0.25)" : "rgba(139, 92, 246, 0.15)"}
            className={`p-6 text-center cursor-pointer flex flex-col items-center justify-center min-h-60 relative overflow-hidden transition-all duration-300 border-2 ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                : 'border-slate-800/80 bg-slate-900/25 hover:bg-slate-900/40 hover:border-slate-700'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Background canvas particle explosion */}
            <ParticleExplosion active={uploadSuccessState} />

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".csv,.txt,.xlsx,.xls,.pdf"
            />
            
            {/* Ambient background light mesh inside upload box */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-all duration-500 ${
              isDragging ? 'bg-indigo-500/20' : 'bg-purple-500/10'
            }`} />
            
            {/* Glowing Icon Container */}
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${
              isDragging 
                ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                : 'bg-slate-950/80 text-indigo-400 border border-slate-800 group-hover:border-slate-700 group-hover:scale-105'
            }`}>
              <Upload className={`h-6 w-6 transition-transform duration-300 ${isDragging ? 'animate-bounce' : 'group-hover:-translate-y-0.5'}`} />
            </div>

            <h3 className="text-sm font-semibold text-slate-100 tracking-wide font-sans">
              {isDragging ? 'Drop your statement here' : 'Ingest Bank Statement'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Supports CSV, PDF, TXT or Excel exported from your financial institution (Max 5MB)
            </p>

            <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-mono tracking-wide font-medium group-hover:bg-indigo-500/20 transition-all">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> OR SELECT A FILE
            </div>
          </GlowTiltCard>

          {/* Quick paste text option */}
          <div className="p-4 rounded-2xl border border-slate-850/80 bg-slate-900/10 backdrop-blur-md text-center">
            <button 
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="text-xs text-slate-450 hover:text-indigo-450 transition font-mono flex items-center gap-1.5 mx-auto"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" /> Or paste raw ledger / CSV lines
            </button>

            {showPasteBox && (
              <div className="mt-3 space-y-2 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                <textarea 
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Date,Description,Amount&#10;2026-07-04,Starbucks Coffee,-12.50&#10;2026-07-05,Amazon Retail,-84.90"
                  className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 placeholder-slate-650"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowPasteBox(false)}
                    className="px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900/60 rounded-lg border border-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePasteSubmit}
                    className="px-3 py-1.5 text-[11px] text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition"
                  >
                    Load Ledger
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error display */}
          {dragError && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex gap-2 animate-in shake duration-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{dragError}</span>
            </div>
          )}

          {/* File Loaded Preview Panel with circular Progress indicators */}
          {filePreview && (
            <div className="p-4 rounded-2xl border border-indigo-500/25 bg-slate-950/90 backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden shadow-lg">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/15">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{filePreview.name}</p>
                    <p className="text-[9px] text-slate-450 font-mono">{(filePreview.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFilePreview(null)}
                  className="p-1 hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {uploadProgress !== null ? (
                <div className="flex items-center gap-4 py-1.5">
                  {/* Premium circular SVG progress ring */}
                  <div className="relative flex-shrink-0 w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        className="stroke-slate-900 fill-none" 
                        strokeWidth="3.5"
                      />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        className={`fill-none transition-all duration-300 ${
                          uploadSuccessState ? 'stroke-emerald-500 shadow-emerald-500/20' : 'stroke-indigo-500 shadow-indigo-500/20'
                        }`} 
                        strokeWidth="3.5"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 - (uploadProgress / 100) * (2 * Math.PI * 20)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-200">
                      {uploadProgress}%
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {uploadSuccessState ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 font-sans">Ingestion Complete</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                          <span className="text-slate-200 font-sans">Gemini AI Ingestion...</span>
                        </>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-450 font-mono mt-0.5 truncate">
                      {uploadSuccessState ? 'Synthesizing ledger transactions...' : 'Categorizing and validating transactions...'}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 group"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-200 group-hover:rotate-12 transition-transform" /> Parse Ledger via Gemini AI
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Transactions list, sorting, filter, search, quick manual entry */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Action Row for Filter / Search */}
          <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search by merchant, categories, descriptions..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={catFilter}
                  onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-indigo-500/20 shrink-0 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Manual
                </button>
              </div>
            </div>

            {/* Advanced Range Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1.5 border-t border-slate-850/60 items-center">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Min Amount</span>
                <input 
                  type="number" 
                  placeholder="Min"
                  value={amountMin}
                  onChange={(e) => { setAmountMin(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Max Amount</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={amountMax}
                  onChange={(e) => { setAmountMax(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                {(amountMin || amountMax || catFilter !== 'All' || typeFilter !== 'All' || search) && (
                  <button 
                    onClick={() => {
                      setAmountMin('');
                      setAmountMax('');
                      setCatFilter('All');
                      setTypeFilter('All');
                      setSearch('');
                      setCurrentPage(1);
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 mt-3"
                  >
                    <X className="h-3 w-3" /> CLEAR FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Manual Entry Form */}
          {showAddForm && (
            <form onSubmit={handleSaveAddForm} className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Merchant / Vendor</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Costco Wholesale"
                    value={newTx.merchant}
                    onChange={(e) => setNewTx({ ...newTx, merchant: e.target.value, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Amount</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Transaction Type</label>
                  <select 
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value as 'income' | 'expense' })}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-300"
                  >
                    <option value="expense">Expense (Debit)</option>
                    <option value="income">Income (Credit)</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                  >
                    Save Entry
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Transactions Table / List */}
          <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-900/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase tracking-wider select-none">
                    <th className="p-3 cursor-pointer hover:text-slate-200 transition" onClick={() => requestSort('date')}>
                      <div className="flex items-center gap-1">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-slate-200 transition" onClick={() => requestSort('merchant')}>
                      <div className="flex items-center gap-1">
                        Merchant <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-slate-200 transition" onClick={() => requestSort('category')}>
                      <div className="flex items-center gap-1">
                        Category <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-slate-200 transition text-right" onClick={() => requestSort('amount')}>
                      <div className="flex items-center gap-1 justify-end">
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-mono space-y-2">
                        <div className="text-xl">📭</div>
                        <p className="text-xs">No transactions match your query parameters.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((tx) => {
                      const isEditing = editingId === tx.id;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-850/30 text-slate-300 transition">
                          <td className="p-3 font-mono">
                            {isEditing ? (
                              <input 
                                type="date" 
                                value={editForm.date || ''} 
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 max-w-[110px]"
                              />
                            ) : (
                              tx.date
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editForm.description || ''} 
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value, merchant: e.target.value })}
                                className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2 font-medium text-slate-200">
                                {/* Type icon */}
                                {tx.type === 'income' ? (
                                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                                ) : (
                                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0"><ArrowDownRight className="h-3.5 w-3.5" /></span>
                                )}
                                <span className="truncate max-w-[140px]" title={tx.description}>{tx.description}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <select 
                                value={editForm.category || ''} 
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300"
                              >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-850 text-slate-300 border border-slate-800">
                                {getCategoryIcon(tx.category)}
                                {tx.category}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            {isEditing ? (
                              <input 
                                type="number" 
                                step="0.01"
                                value={editForm.amount || ''} 
                                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 max-w-[80px] text-right"
                              />
                            ) : (
                              <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                                {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => handleSaveEdit(tx.id)}
                                    className="p-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-600/20"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setEditingId(null)}
                                    className="p-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleStartEdit(tx)}
                                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => onDeleteTransaction(tx.id)}
                                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="p-3.5 bg-slate-900 border-t border-slate-850 flex items-center justify-between text-xs select-none">
                <span className="text-slate-450 font-mono">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 border border-slate-800 rounded hover:bg-slate-850 text-slate-300 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 font-bold">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 border border-slate-800 rounded hover:bg-slate-850 text-slate-300 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
