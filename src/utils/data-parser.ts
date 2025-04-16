import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ForestData, AggregatedMetrics, ChartData, FilterValues, Benchmark, Projection } from '@/types/forest-data';
import { v4 as uuidv4 } from 'uuid';

// Function to parse CSV files
export const parseCSV = (file: File): Promise<ForestData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data.map((item: any) => processRow(item));
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to parse XLSX files
export const parseXLSX = async (file: File): Promise<ForestData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const parsedData = jsonData.map((item: any) => processRow(item));
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Helper function to process each row of data
const processRow = (row: any): ForestData => {
  // Try different possible column names for flexibility
  const state = row.state || row.State || row.STATE || row.region || row.Region || '';
  const year = parseInt(row.year || row.Year || row.YEAR || row.date || row.Date || '0', 10);
  const deforestation = parseFloat(row.deforestation || row.Deforestation || row.forest_loss || row.ForestLoss || '0');
  const reforestation = parseFloat(row.reforestation || row.Reforestation || row.forest_gain || row.ForestGain || '0');
  
  // Calculate net change
  const netChange = reforestation - deforestation;
  
  return {
    id: uuidv4(),
    state,
    year,
    deforestation,
    reforestation,
    netChange
  };
};

// Function to preprocess data (clean and validate)
export const preprocessData = (data: ForestData[]): ForestData[] => {
  return data
    .filter(row => (
      // Filter out rows with missing or invalid data
      row.state && 
      !isNaN(row.year) && 
      !isNaN(row.deforestation) && 
      !isNaN(row.reforestation) &&
      row.year > 1900 && 
      row.year <= new Date().getFullYear()
    ))
    .map(row => ({
      ...row,
      deforestation: Math.max(0, row.deforestation), // Ensure non-negative values
      reforestation: Math.max(0, row.reforestation), // Ensure non-negative values
      netChange: row.reforestation - row.deforestation
    }));
};

// Function to filter data based on user selections
export const filterData = (data: ForestData[], filters: FilterValues): ForestData[] => {
  return data.filter(row => {
    // Apply state filter if selected
    if (filters.state && row.state !== filters.state) {
      return false;
    }
    
    // Apply year filter if selected
    if (filters.year && row.year !== filters.year) {
      return false;
    }
    
    // Apply date range filter if selected
    if (filters.dateRange && (row.year < filters.dateRange[0] || row.year > filters.dateRange[1])) {
      return false;
    }
    
    return true;
  });
};

// Function to calculate aggregated metrics
export const calculateMetrics = (data: ForestData[]): AggregatedMetrics => {
  const totalDeforestation = data.reduce((sum, row) => sum + row.deforestation, 0);
  const totalReforestation = data.reduce((sum, row) => sum + row.reforestation, 0);
  const netChange = totalReforestation - totalDeforestation;
  
  return {
    totalDeforestation,
    totalReforestation,
    netChange
  };
};

// Function to prepare data for state-wise chart
export const prepareStateChartData = (data: ForestData[]): ChartData[] => {
  const stateMap = new Map<string, { deforestation: number; reforestation: number; netChange: number }>();
  
  // Aggregate data by state
  data.forEach(row => {
    if (!stateMap.has(row.state)) {
      stateMap.set(row.state, { deforestation: 0, reforestation: 0, netChange: 0 });
    }
    
    const stateData = stateMap.get(row.state)!;
    stateData.deforestation += row.deforestation;
    stateData.reforestation += row.reforestation;
    stateData.netChange += row.netChange || 0;
  });
  
  // Convert map to array for chart
  return Array.from(stateMap.entries()).map(([state, values]) => ({
    name: state,
    ...values
  }));
};

// Function to prepare data for year-wise chart
export const prepareYearChartData = (data: ForestData[]): ChartData[] => {
  const yearMap = new Map<number, { deforestation: number; reforestation: number; netChange: number }>();
  
  // Aggregate data by year
  data.forEach(row => {
    if (!yearMap.has(row.year)) {
      yearMap.set(row.year, { deforestation: 0, reforestation: 0, netChange: 0 });
    }
    
    const yearData = yearMap.get(row.year)!;
    yearData.deforestation += row.deforestation;
    yearData.reforestation += row.reforestation;
    yearData.netChange += row.netChange || 0;
  });
  
  // Convert map to array for chart and sort by year
  return Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, values]) => ({
      name: year.toString(),
      ...values
    }));
};

// Function to extract filter options from data
export const extractFilterOptions = (data: ForestData[]) => {
  const states = [...new Set(data.map(item => item.state))].sort();
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => a - b);
  
  return {
    states,
    years,
    minYear: years.length > 0 ? years[0] : undefined,
    maxYear: years.length > 0 ? years[years.length - 1] : undefined
  };
};

// Function to calculate benchmarks based on the dataset
export const calculateBenchmarks = (data: ForestData[]): Benchmark[] => {
  if (!data.length) return [];
  
  // Sort data by year to ensure chronological analysis
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  // Group data by state
  const stateMap = new Map<string, ForestData[]>();
  sortedData.forEach(row => {
    if (!stateMap.has(row.state)) {
      stateMap.set(row.state, []);
    }
    stateMap.get(row.state)!.push(row);
  });
  
  const benchmarks: Benchmark[] = [];
  
  // Overall benchmarks
  const totalDeforestation = sortedData.reduce((sum, row) => sum + row.deforestation, 0);
  const totalReforestation = sortedData.reduce((sum, row) => sum + row.reforestation, 0);
  const yearCount = new Set(sortedData.map(row => row.year)).size;
  
  benchmarks.push({
    type: 'overall',
    name: 'Average Annual Deforestation',
    value: yearCount > 0 ? totalDeforestation / yearCount : 0,
    unit: 'ha/year'
  });
  
  benchmarks.push({
    type: 'overall',
    name: 'Average Annual Reforestation',
    value: yearCount > 0 ? totalReforestation / yearCount : 0,
    unit: 'ha/year'
  });
  
  benchmarks.push({
    type: 'overall',
    name: 'Reforestation to Deforestation Ratio',
    value: totalDeforestation > 0 ? totalReforestation / totalDeforestation : 0,
    unit: 'ratio'
  });
  
  // Find best performing states (highest net gain or lowest net loss)
  const statePerformance: { state: string, netChange: number }[] = [];
  stateMap.forEach((stateData, state) => {
    const totalDef = stateData.reduce((sum, row) => sum + row.deforestation, 0);
    const totalRef = stateData.reduce((sum, row) => sum + row.reforestation, 0);
    statePerformance.push({
      state,
      netChange: totalRef - totalDef
    });
  });
  
  // Sort by netChange and get top 3 and bottom 3
  const sortedPerformance = [...statePerformance].sort((a, b) => b.netChange - a.netChange);
  
  if (sortedPerformance.length > 0) {
    // Best performing state
    benchmarks.push({
      type: 'state',
      name: 'Best Performing State',
      value: sortedPerformance[0].netChange,
      unit: 'ha net gain',
      state: sortedPerformance[0].state
    });
    
    // Worst performing state
    const worstIndex = sortedPerformance.length - 1;
    benchmarks.push({
      type: 'state',
      name: 'Most Challenged State',
      value: sortedPerformance[worstIndex].netChange,
      unit: 'ha net change',
      state: sortedPerformance[worstIndex].state
    });
  }
  
  // Year-over-year trends
  const years = [...new Set(sortedData.map(item => item.year))].sort();
  if (years.length >= 2) {
    const yearlyTotals: { year: number, def: number, ref: number }[] = [];
    
    years.forEach(year => {
      const yearData = sortedData.filter(row => row.year === year);
      const yearDef = yearData.reduce((sum, row) => sum + row.deforestation, 0);
      const yearRef = yearData.reduce((sum, row) => sum + row.reforestation, 0);
      yearlyTotals.push({ year, def: yearDef, ref: yearRef });
    });
    
    // Calculate year-over-year changes
    const lastYearIndex = yearlyTotals.length - 1;
    const firstYearIndex = 0;
    
    const deforestationChange = 
      ((yearlyTotals[lastYearIndex].def - yearlyTotals[firstYearIndex].def) / 
      yearlyTotals[firstYearIndex].def) * 100;
    
    const reforestationChange = 
      ((yearlyTotals[lastYearIndex].ref - yearlyTotals[firstYearIndex].ref) / 
      yearlyTotals[firstYearIndex].ref) * 100;
    
    benchmarks.push({
      type: 'trend',
      name: 'Deforestation Trend',
      value: deforestationChange,
      unit: '% change',
      period: `${yearlyTotals[firstYearIndex].year}-${yearlyTotals[lastYearIndex].year}`
    });
    
    benchmarks.push({
      type: 'trend',
      name: 'Reforestation Trend',
      value: reforestationChange,
      unit: '% change',
      period: `${yearlyTotals[firstYearIndex].year}-${yearlyTotals[lastYearIndex].year}`
    });
  }
  
  return benchmarks;
};

// Function to calculate future projections based on historical data
export const calculateProjections = (data: ForestData[]): Projection[] => {
  if (!data.length) return [];
  
  // Sort data by year to ensure chronological analysis
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const years = [...new Set(sortedData.map(item => item.year))].sort();
  
  if (years.length < 2) return []; // Need at least 2 years for projection
  
  const projections: Projection[] = [];
  const lastYear = years[years.length - 1];
  const projectionYears = [1, 3, 5]; // Project 1, 3, and 5 years into the future
  
  // Calculate yearly totals for each year
  const yearlyTotals: { year: number, def: number, ref: number, net: number }[] = [];
  years.forEach(year => {
    const yearData = sortedData.filter(row => row.year === year);
    const yearDef = yearData.reduce((sum, row) => sum + row.deforestation, 0);
    const yearRef = yearData.reduce((sum, row) => sum + row.reforestation, 0);
    yearlyTotals.push({ 
      year, 
      def: yearDef, 
      ref: yearRef,
      net: yearRef - yearDef 
    });
  });
  
  // Simple linear regression for projections
  // Calculate average annual change rates
  const defChanges: number[] = [];
  const refChanges: number[] = [];
  
  for (let i = 1; i < yearlyTotals.length; i++) {
    const defChange = yearlyTotals[i].def - yearlyTotals[i-1].def;
    const refChange = yearlyTotals[i].ref - yearlyTotals[i-1].ref;
    defChanges.push(defChange);
    refChanges.push(refChange);
  }
  
  const avgDefChange = defChanges.reduce((sum, val) => sum + val, 0) / defChanges.length;
  const avgRefChange = refChanges.reduce((sum, val) => sum + val, 0) / refChanges.length;
  
  // Current values (latest year)
  const currentDef = yearlyTotals[yearlyTotals.length - 1].def;
  const currentRef = yearlyTotals[yearlyTotals.length - 1].ref;
  
  // Generate projections for each future year
  projectionYears.forEach(yearsAhead => {
    const projectedDef = currentDef + (avgDefChange * yearsAhead);
    const projectedRef = currentRef + (avgRefChange * yearsAhead);
    const projectedNet = projectedRef - projectedDef;
    const projectedYear = lastYear + yearsAhead;
    
    projections.push({
      year: projectedYear,
      deforestation: Math.max(0, projectedDef), // Ensure non-negative values
      reforestation: Math.max(0, projectedRef),
      netChange: projectedNet,
      description: `Projected for ${projectedYear} based on ${years[0]}-${lastYear} trends`
    });
  });
  
  // Add a sustainability projection
  // When will reforestation equal or exceed deforestation if current trends continue?
  if (avgDefChange !== avgRefChange) {
    // Calculate years until balance (solve for x where currentDef + avgDefChange*x = currentRef + avgRefChange*x)
    const yearsToBalance = (currentDef - currentRef) / (avgRefChange - avgDefChange);
    
    if (yearsToBalance > 0 && yearsToBalance < 30) { // Only show reasonable projections (within 30 years)
      const balanceYear = Math.round(lastYear + yearsToBalance);
      
      projections.push({
        year: balanceYear,
        deforestation: currentDef + (avgDefChange * yearsToBalance),
        reforestation: currentRef + (avgRefChange * yearsToBalance),
        netChange: 0,
        description: `Projected equilibrium year (reforestation = deforestation)`,
        isSpecial: true
      });
    }
  }
  
  return projections;
};
