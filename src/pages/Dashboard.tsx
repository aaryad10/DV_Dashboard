import React, { useState, useEffect } from 'react';
import { 
  ForestData, 
  AggregatedMetrics, 
  ChartData, 
  FilterOptions, 
  FilterValues,
  Benchmark,
  Projection
} from '@/types/forest-data';
import { 
  calculateMetrics, 
  filterData, 
  preprocessData, 
  prepareStateChartData, 
  prepareYearChartData, 
  extractFilterOptions,
  calculateBenchmarks,
  calculateProjections
} from '@/utils/data-parser';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FileUpload from '@/components/dashboard/FileUpload';
import MetricsDisplay from '@/components/dashboard/MetricsDisplay';
import BenchmarksDisplay from '@/components/dashboard/BenchmarksDisplay';
import ProjectionsDisplay from '@/components/dashboard/ProjectionsDisplay';
import BarChart from '@/components/dashboard/BarChart';
import LineChart from '@/components/dashboard/LineChart';
import PieChart from '@/components/dashboard/PieChart';
import { Button } from '@/components/ui/button';
import { TreeDeciduous } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Data states
  const [originalData, setOriginalData] = useState<ForestData[]>([]);
  const [filteredData, setFilteredData] = useState<ForestData[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    totalDeforestation: 0,
    totalReforestation: 0,
    netChange: 0
  });
  
  // Chart states
  const [stateChartData, setStateChartData] = useState<ChartData[]>([]);
  const [yearChartData, setYearChartData] = useState<ChartData[]>([]);
  const [activeVisualization, setActiveVisualization] = useState<'bar' | 'line' | 'pie'>('bar');
  
  // Benchmark and projection states
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    years: []
  });
  const [filterValues, setFilterValues] = useState<FilterValues>({
    state: null,
    year: null,
    dateRange: null
  });
  
  // UI states
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  
  // Handle data upload
  const handleDataLoaded = (data: ForestData[]) => {
    setOriginalData(data);
    setFilteredData(data);
    setIsDataLoaded(true);
    setShowUpload(false);
    
    // Extract filter options from data
    const options = extractFilterOptions(data);
    setFilterOptions(options);
    
    // Find current year (most recent year in data)
    const years = data.map(item => item.year);
    const maxYear = Math.max(...years);
    setCurrentYear(maxYear);
    
    // Calculate initial metrics, chart data, benchmarks and projections
    updateMetrics(data);
    updateChartData(data);
    updateBenchmarksAndProjections(data);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    const newFilteredData = filterData(originalData, newFilters);
    setFilteredData(newFilteredData);
    updateMetrics(newFilteredData);
    updateChartData(newFilteredData);
    updateBenchmarksAndProjections(newFilteredData);
  };
  
  // Handle preprocessing request
  const handlePreprocessData = () => {
    const processedData = preprocessData(filteredData);
    setFilteredData(processedData);
    updateMetrics(processedData);
    updateChartData(processedData);
    updateBenchmarksAndProjections(processedData);
  };
  
  // Helper function to update metrics
  const updateMetrics = (data: ForestData[]) => {
    const newMetrics = calculateMetrics(data);
    setMetrics(newMetrics);
  };
  
  // Helper function to update chart data
  const updateChartData = (data: ForestData[]) => {
    setStateChartData(prepareStateChartData(data));
    setYearChartData(prepareYearChartData(data));
  };
  
  // Helper function to update benchmarks and projections
  const updateBenchmarksAndProjections = (data: ForestData[]) => {
    setBenchmarks(calculateBenchmarks(data));
    setProjections(calculateProjections(data));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <SidebarProvider>
        <div className="flex w-full max-w-screen-2xl mx-auto">
          <DashboardSidebar 
            isDataLoaded={isDataLoaded}
            filterOptions={filterOptions}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onPreprocessData={handlePreprocessData}
            onVisualizationChange={setActiveVisualization}
            activeVisualization={activeVisualization}
            onShowUpload={() => setShowUpload(true)}
          />
          
          <main className="flex-1 p-4 md:p-6 w-full ml-[80px] md:ml-[320px] max-w-[calc(100%-400px)]">
            {!isDataLoaded && !showUpload && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)]">
                <div className="h-24 w-24 rounded-full bg-forest/20 flex items-center justify-center mb-6">
                  <TreeDeciduous size={48} className="text-forest" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-forest-dark">India Forest Pulse Dashboard</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                  Upload forest data to visualize deforestation vs. reforestation trends across India
                </p>
                <Button 
                  onClick={() => setShowUpload(true)}
                  size="lg"
                  className="bg-forest hover:bg-forest-dark"
                >
                  Upload Forest Data
                </Button>
              </div>
            )}
            
            {showUpload && (
              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Upload Forest Data</h1>
                <FileUpload onDataLoaded={handleDataLoaded} />
              </div>
            )}
            
            {isDataLoaded && !showUpload && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h1 className="text-2xl font-bold">India Forest Pulse Dashboard</h1>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUpload(true)}
                    >
                      Upload New Data
                    </Button>
                  </div>
                </div>
                
                <MetricsDisplay metrics={metrics} />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {activeVisualization === 'bar' && (
                    <>
                      <BarChart 
                        data={yearChartData} 
                        title="Year-wise Forest Change" 
                        xAxisLabel="Year"
                      />
                      <BarChart 
                        data={stateChartData} 
                        title="State-wise Forest Change" 
                        xAxisLabel="State"
                      />
                    </>
                  )}
                  
                  {activeVisualization === 'line' && (
                    <LineChart 
                      data={yearChartData} 
                      title="Yearly Forest Change Trends" 
                      height={500}
                    />
                  )}
                  
                  {activeVisualization === 'pie' && (
                    <>
                      <PieChart 
                        data={stateChartData} 
                        title="Deforestation Distribution by State" 
                        dataKey="deforestation"
                      />
                      <PieChart 
                        data={stateChartData} 
                        title="Reforestation Distribution by State" 
                        dataKey="reforestation"
                      />
                    </>
                  )}
                </div>
                
                {/* Benchmarks Section */}
                {benchmarks.length > 0 && (
                  <BenchmarksDisplay benchmarks={benchmarks} />
                )}
                
                {/* Projections Section */}
                {projections.length > 0 && (
                  <ProjectionsDisplay 
                    projections={projections} 
                    currentYear={currentYear || new Date().getFullYear()} 
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
