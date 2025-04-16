
import React from 'react';
import { FilterOptions, FilterValues } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FilterX, RefreshCw } from 'lucide-react';

interface DataFiltersProps {
  filterOptions: FilterOptions;
  filterValues: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onPreprocessData: () => void;
}

const DataFilters: React.FC<DataFiltersProps> = ({
  filterOptions,
  filterValues,
  onFilterChange,
  onPreprocessData
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Data Filters</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters}
            className="h-8 px-2 text-muted-foreground"
          >
            <FilterX className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="state-filter" className="text-sm font-medium">
              State
            </label>
            <Select
              value={filterValues.state || 'all'}
              onValueChange={handleStateChange}
            >
              <SelectTrigger id="state-filter">
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
            <label htmlFor="year-filter" className="text-sm font-medium">
              Year
            </label>
            <Select
              value={filterValues.year?.toString() || 'all'}
              onValueChange={handleYearChange}
            >
              <SelectTrigger id="year-filter">
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
        </div>
        
        {!filterValues.year && minYear && maxYear && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Date Range</label>
              <div className="text-sm text-muted-foreground">
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
              className="pt-4"
            />
          </div>
        )}
        
        <Button 
          onClick={onPreprocessData} 
          className="w-full mt-4 bg-forest hover:bg-forest-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Preprocess Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataFilters;
