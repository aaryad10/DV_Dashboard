
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ForestData, AggregatedMetrics, ChartData, FilterValues } from '@/types/forest-data';
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
