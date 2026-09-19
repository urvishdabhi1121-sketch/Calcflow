import {
  Percent, Tag, Receipt, Utensils, Users, Wallet, Fuel, Ruler,
  Landmark, PiggyBank, TrendingUp, Clock, Calendar, Scale,
} from 'lucide-react';

import Percentage from '@/pages/tools/Percentage';
import Discount from '@/pages/tools/Discount';
import Tax from '@/pages/tools/Tax';
import Tip from '@/pages/tools/Tip';
import SplitBill from '@/pages/tools/SplitBill';
import UnitConverter from '@/pages/tools/UnitConverter';
import Salary from '@/pages/tools/Salary';
import FuelTool from '@/pages/tools/Fuel';
import Loan from '@/pages/tools/Loan';
import Savings from '@/pages/tools/Savings';
import Profit from '@/pages/tools/Profit';
import WorkHours from '@/pages/tools/WorkHours';
import DateTime from '@/pages/tools/DateTime';

export const TOOLS = [
  { id: 'percentage', name: 'Percentage', category: 'Everyday', icon: Percent, component: Percentage, subtitle: 'Percent of, change, increase' },
  { id: 'discount', name: 'Discount', category: 'Everyday', icon: Tag, component: Discount, subtitle: 'Sale price + tax' },
  { id: 'tax', name: 'Tax', category: 'Everyday', icon: Receipt, component: Tax, subtitle: 'Add sales tax' },
  { id: 'tip', name: 'Tip', category: 'Everyday', icon: Utensils, component: Tip, subtitle: 'Tip + split' },
  { id: 'split-bill', name: 'Split Bill', category: 'Everyday', icon: Users, component: SplitBill, subtitle: 'Equal or custom shares' },
  { id: 'salary', name: 'Salary', category: 'Money', icon: Wallet, component: Salary, subtitle: 'Hourly to annual' },
  { id: 'loan', name: 'Loan', category: 'Money', icon: Landmark, component: Loan, subtitle: 'Payment + amortization' },
  { id: 'savings', name: 'Savings', category: 'Money', icon: PiggyBank, component: Savings, subtitle: 'Growth + interest' },
  { id: 'profit', name: 'Profit / Margin', category: 'Money', icon: TrendingUp, component: Profit, subtitle: 'Markup vs margin' },
  { id: 'fuel', name: 'Fuel Cost', category: 'Automotive', icon: Fuel, component: FuelTool, subtitle: 'Trip + comparison' },
  { id: 'unit-converter', name: 'Unit Converter', category: 'Conversions', icon: Ruler, component: UnitConverter, subtitle: 'Length, weight, more' },
  { id: 'work-hours', name: 'Work Hours', category: 'Time', icon: Clock, component: WorkHours, subtitle: 'Shifts + overtime' },
  { id: 'date-time', name: 'Date & Time', category: 'Time', icon: Calendar, component: DateTime, subtitle: 'Difference, add days' },
];

export const CATEGORIES = ['Everyday', 'Money', 'Time', 'Automotive', 'Conversions'];

export function getTool(id) {
  return TOOLS.find((t) => t.id === id);
}