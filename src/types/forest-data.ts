
export interface ForestData {
  id: string;
  state: string;
  year: number;
  deforestation: number; // in hectares
  reforestation: number; // in hectares
  netChange?: number; // calculated field: reforestation - deforestation
}

export interface AggregatedMetrics {
  totalDeforestation: number;
  totalReforestation: number;
  netChange: number;
}

export interface ChartData {
  name: string;
  deforestation: number;
  reforestation: number;
  netChange: number;
}

export type FilterType = 'state' | 'year' | 'dateRange';

export interface FilterOptions {
  states: string[];
  years: number[];
  minYear?: number;
  maxYear?: number;
}

export interface FilterValues {
  state: string | null;
  year: number | null;
  dateRange: [number, number] | null;
}
