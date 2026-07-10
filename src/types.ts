export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  time?: string;
  statementId?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetDate: string;
  category: 'vacation' | 'car' | 'emergency' | 'house' | 'laptop' | 'education' | 'wedding' | 'other';
}

export interface InvestmentProfile {
  age: number;
  salary: number;
  monthlySavings: number;
  riskAppetite: 'low' | 'medium' | 'high';
  financialGoals: string[];
}

export interface InvestmentAllocation {
  assetClass: string;
  percentage: number;
  description: string;
  examples: string[];
}

export interface UnnecessarySpend {
  id: string;
  title: string;
  amount: number;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FinancialHealth {
  score: number;
  savingsRate: number;
  debtRatio: number;
  emergencyFundScore: number;
  investmentRatio: number;
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
}
