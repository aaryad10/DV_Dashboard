
import React from 'react';
import { Benchmark } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, TrendingDown, TrendingUp } from 'lucide-react';

interface BenchmarksDisplayProps {
  benchmarks: Benchmark[];
}

const BenchmarksDisplay: React.FC<BenchmarksDisplayProps> = ({ benchmarks }) => {
  // Separate benchmarks by type
  const overallBenchmarks = benchmarks.filter(b => b.type === 'overall');
  const stateBenchmarks = benchmarks.filter(b => b.type === 'state');
  const trendBenchmarks = benchmarks.filter(b => b.type === 'trend');
  
  // Format value based on unit
  const formatValue = (value: number, unit: string) => {
    if (unit === 'ratio') {
      return value.toFixed(2);
    } else if (unit === '% change') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    } else {
      return value.toLocaleString('en-IN', { maximumFractionDigits: 1 });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Benchmarks &amp; Performance Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overallBenchmarks.map((benchmark, index) => (
          <Card key={`overall-${index}`} className="border-l-4 border-l-forest">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{benchmark.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-forest">
                  {formatValue(benchmark.value, benchmark.unit)} 
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {benchmark.unit}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-forest/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-forest" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {stateBenchmarks.map((benchmark, index) => (
          <Card key={`state-${index}`} className={`border-l-4 ${benchmark.value >= 0 ? 'border-l-reforest-dark' : 'border-l-deforest-dark'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{benchmark.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-xl font-bold">
                  {benchmark.state}
                </div>
                <div className={`text-lg ${benchmark.value >= 0 ? 'text-reforest-dark' : 'text-deforest-dark'}`}>
                  {benchmark.value >= 0 ? '+' : ''}{formatValue(benchmark.value, benchmark.unit)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {benchmark.unit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {trendBenchmarks.map((benchmark, index) => {
          const isPositiveTrend = 
            (benchmark.name.includes('Deforestation') && benchmark.value < 0) || 
            (benchmark.name.includes('Reforestation') && benchmark.value > 0);
          
          return (
            <Card key={`trend-${index}`} className={`border-l-4 ${isPositiveTrend ? 'border-l-reforest' : 'border-l-deforest'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{benchmark.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xl font-bold ${isPositiveTrend ? 'text-reforest' : 'text-deforest'}`}>
                      {formatValue(benchmark.value, benchmark.unit)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {benchmark.period}
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-full ${isPositiveTrend ? 'bg-reforest/20' : 'bg-deforest/20'} flex items-center justify-center`}>
                    {isPositiveTrend ? 
                      <TrendingUp className={`h-5 w-5 ${isPositiveTrend ? 'text-reforest' : 'text-deforest'}`} /> :
                      <TrendingDown className={`h-5 w-5 ${isPositiveTrend ? 'text-reforest' : 'text-deforest'}`} />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BenchmarksDisplay;
