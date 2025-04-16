
import React from 'react';
import { AggregatedMetrics } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, TreeDeciduous, Waves } from 'lucide-react';

interface MetricsDisplayProps {
  metrics: AggregatedMetrics;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const { totalDeforestation, totalReforestation, netChange } = metrics;
  
  // Format numbers with comma separators and 2 decimal places
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className={`border-l-4 ${netChange >= 0 ? 'border-l-deforest' : 'border-l-reforest'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Deforestation</CardTitle>
          <CardDescription>Total forest area lost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-deforest">
              {formatNumber(totalDeforestation)} ha
            </div>
            <div className="h-12 w-12 rounded-full bg-deforest/20 flex items-center justify-center">
              <Waves className="h-6 w-6 text-deforest" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`border-l-4 ${netChange >= 0 ? 'border-l-reforest' : 'border-l-reforest-dark'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Reforestation</CardTitle>
          <CardDescription>Total forest area gained</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-reforest">
              {formatNumber(totalReforestation)} ha
            </div>
            <div className="h-12 w-12 rounded-full bg-reforest/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-reforest" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`border-l-4 ${netChange >= 0 ? 'border-l-reforest-dark' : 'border-l-deforest-dark'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Net Forest Change</CardTitle>
          <CardDescription>Reforestation - Deforestation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${netChange >= 0 ? 'text-reforest-dark' : 'text-deforest-dark'}`}>
              {netChange >= 0 ? '+' : ''}{formatNumber(netChange)} ha
            </div>
            <div className={`h-12 w-12 rounded-full ${netChange >= 0 ? 'bg-reforest-dark/20' : 'bg-deforest-dark/20'} flex items-center justify-center`}>
              <TreeDeciduous className={`h-6 w-6 ${netChange >= 0 ? 'text-reforest-dark' : 'text-deforest-dark'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDisplay;
