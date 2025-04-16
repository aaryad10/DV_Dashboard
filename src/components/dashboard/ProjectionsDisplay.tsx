
import React from 'react';
import { Projection } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ProjectionsDisplayProps {
  projections: Projection[];
  currentYear: number;
}

const ProjectionsDisplay: React.FC<ProjectionsDisplayProps> = ({ projections, currentYear }) => {
  // Format chart data from projections
  const chartData = projections.map(projection => ({
    year: projection.year,
    deforestation: projection.deforestation,
    reforestation: projection.reforestation,
    netChange: projection.netChange,
    isSpecial: projection.isSpecial
  }));
  
  // Sort projections chronologically
  const sortedProjections = [...projections].sort((a, b) => a.year - b.year);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Future Projections</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Forest Change Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorDef" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E76F51" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E76F51" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52B788" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52B788" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ 
                    value: 'Year', 
                    position: 'insideBottomRight', 
                    offset: -10 
                  }}
                />
                <YAxis 
                  label={{ 
                    value: 'Hectares', 
                    angle: -90, 
                    position: 'insideLeft',
                    dx: -10
                  }} 
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString()} ha`, '']}
                  labelFormatter={(year) => `Projected ${year}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="deforestation" 
                  name="Deforestation" 
                  stroke="#E76F51" 
                  fill="url(#colorDef)" 
                  activeDot={{ r: 8 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="reforestation" 
                  name="Reforestation" 
                  stroke="#52B788" 
                  fill="url(#colorRef)" 
                  activeDot={{ r: 8 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Key Projection Points:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProjections.map((projection, index) => (
                <Card 
                  key={`projection-${index}`} 
                  className={`border ${projection.isSpecial ? 'border-forest bg-forest/5' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="text-lg font-bold mb-1">
                      {projection.year} 
                      {projection.isSpecial && <span className="text-forest ml-2">(Key Milestone)</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{projection.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="font-medium text-deforest">Deforestation</div>
                        <div>{projection.deforestation.toLocaleString(undefined, {maximumFractionDigits: 1})} ha</div>
                      </div>
                      <div>
                        <div className="font-medium text-reforest">Reforestation</div>
                        <div>{projection.reforestation.toLocaleString(undefined, {maximumFractionDigits: 1})} ha</div>
                      </div>
                      <div>
                        <div className="font-medium">Net Change</div>
                        <div className={projection.netChange >= 0 ? 'text-reforest-dark' : 'text-deforest-dark'}>
                          {projection.netChange >= 0 ? '+' : ''}
                          {projection.netChange.toLocaleString(undefined, {maximumFractionDigits: 1})} ha
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground mt-4 p-4 border rounded bg-gray-50">
              <strong>Note:</strong> These projections are based on linear trend analysis of data from 
              {currentYear ? ` ${projections[0]?.description.split(' ')[3] || ''} to ${currentYear}` : ' available years'}.
              Actual future values may vary based on policy changes, climate events, and conservation efforts.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectionsDisplay;
