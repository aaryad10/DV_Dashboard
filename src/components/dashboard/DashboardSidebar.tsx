
import React from 'react';
import { FilterOptions, FilterValues } from '@/types/forest-data';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { TreeDeciduous, BarChart, LineChart, PieChart, Filter, RefreshCw, Upload, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DashboardSidebarProps {
  isDataLoaded: boolean;
  filterOptions: FilterOptions;
  filterValues: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onPreprocessData: () => void;
  onVisualizationChange: (type: 'bar' | 'line' | 'pie') => void;
  activeVisualization: 'bar' | 'line' | 'pie';
  onShowUpload: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isDataLoaded,
  filterOptions,
  filterValues,
  onFilterChange,
  onPreprocessData,
  onVisualizationChange,
  activeVisualization,
  onShowUpload
}) => {
  const { states, years, minYear, maxYear } = filterOptions;
  
  const handleStateChange = (value: string) => {
    onFilterChange({
      ...filterValues,
      state: value === 'all' ? null : value
    });
  };
  
  const handleYearChange = (value: string) => {
    onFilterChange({
      ...filterValues,
      year: value === 'all' ? null : parseInt(value, 10)
    });
  };
  
  const handleDateRangeChange = (values: number[]) => {
    if (values.length === 2) {
      onFilterChange({
        ...filterValues,
        dateRange: values as [number, number]
      });
    }
  };
  
  const handleResetFilters = () => {
    onFilterChange({
      state: null,
      year: null,
      dateRange: null
    });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 font-semibold">
          <TreeDeciduous className="h-6 w-6 text-forest" />
          <span>Forest Pulse</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onShowUpload}>
                <Upload className="h-4 w-4" />
                <span>Upload Data</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isDataLoaded && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onPreprocessData}>
                  <RefreshCw className="h-4 w-4" />
                  <span>Preprocess Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {isDataLoaded && (
          <>
            <Separator />
            
            <SidebarGroup>
              <SidebarGroupLabel>Visualizations</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onVisualizationChange('bar')}
                    className={activeVisualization === 'bar' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Bar Chart</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onVisualizationChange('line')}
                    className={activeVisualization === 'line' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                  >
                    <LineChart className="h-4 w-4" />
                    <span>Line Chart</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onVisualizationChange('pie')}
                    className={activeVisualization === 'pie' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                  >
                    <PieChart className="h-4 w-4" />
                    <span>Pie Chart</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <Separator />
            
            <SidebarGroup>
              <SidebarGroupLabel>
                <div className="flex items-center justify-between w-full">
                  <span>Filters</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="h-6 px-2 text-muted-foreground"
                  >
                    Reset
                  </Button>
                </div>
              </SidebarGroupLabel>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="sidebar-state-filter" className="text-xs font-medium">
                    State
                  </label>
                  <Select
                    value={filterValues.state || 'all'}
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger id="sidebar-state-filter" className="h-8">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sidebar-year-filter" className="text-xs font-medium">
                    Year
                  </label>
                  <Select
                    value={filterValues.year?.toString() || 'all'}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger id="sidebar-year-filter" className="h-8">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {!filterValues.year && minYear && maxYear && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Date Range</label>
                      <div className="text-xs text-muted-foreground">
                        {filterValues.dateRange?.[0] || minYear} - {filterValues.dateRange?.[1] || maxYear}
                      </div>
                    </div>
                    <Slider
                      defaultValue={[minYear, maxYear]}
                      min={minYear}
                      max={maxYear}
                      step={1}
                      value={filterValues.dateRange || [minYear, maxYear]}
                      onValueChange={handleDateRangeChange}
                    />
                  </div>
                )}
              </div>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>India Forest Pulse Dashboard</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
