
import React from 'react';
import { ChartData } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: ChartData[];
  title: string;
  dataKey: 'deforestation' | 'reforestation';
  height?: number;
}

const COLORS = {
  deforestation: ['#E76F51', '#F4A261', '#BC4639', '#A98467', '#C6AC8F'],
  reforestation: ['#52B788', '#95D5B2', '#2D6A4F', '#40916C', '#74C69D']
};

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  dataKey,
  height = 400 
}) => {
  // Filter out items with zero values
  const filteredData = data.filter(item => item[dataKey] > 0);
  
  // Convert to the format expected by the PieChart component
  const pieData = filteredData.map(item => ({
    name: item.name,
    value: item[dataKey]
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={height / 3}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[dataKey][index % COLORS[dataKey].length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value.toLocaleString()} ha`, '']}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PieChart;
