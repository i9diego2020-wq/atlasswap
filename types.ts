import React from 'react';

export interface ActivityItem {
  id: string;
  type: 'order' | 'payment' | 'issue';
  title: string;
  description: string;
  timestamp: string;
  iconBg: string;
}

export interface ChartDataPoint {
  month: string;
  y2026: number;
  y2025: number;
  y2024: number;
}

/**
 * Interface para transações no sistema
 */
export interface Transaction {
  id: string;
  type: 'swap' | 'transfer' | 'deposit';
  date: string;
  amount: string;
  receive: string;
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Interface para as propriedades dos cartões de estatística
 */
export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  chartData?: any[];
  chartType?: 'bar' | 'line' | 'progress';
  progress?: number;
}

/**
 * Tipos de visualização (abas/páginas) disponíveis
 */
export type ViewType =
  | 'dashboard'
  | 'new-transaction'
  | 'profile'
  | 'statement'
  | 'customers'
  | 'all-transactions'
  | 'admin-statement'
  | 'settings'
  | 'docs'
  | 'support';
