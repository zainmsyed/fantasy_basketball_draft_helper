import { CategoryName } from './ranking';

export interface PuntStrategy {
  id: string;
  name: string;
  includedCategories: CategoryName[];
  createdAt: Date;
  isActive: boolean;
}

export interface StatDisplayConfig {
  currentView: 'projected' | 'lastYear';
  availableViews: ('projected' | 'lastYear')[];
}