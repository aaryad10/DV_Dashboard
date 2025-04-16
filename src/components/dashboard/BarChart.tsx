
import React from 'react';
import { ChartData } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: ChartData[];
  title: string;
  xAxisLabel: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  xAxisLabel,
  height = 400 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ 
                value: xAxisLabel, 
                position: 'insideBottomRight', 
                offset: -10,
                dy: 10
              }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value) => [`${value.toLocaleString()} ha`, '']}
              labelFormatter={(value) => `${xAxisLabel}: ${value}`}
            />
            <Legend />
            <Bar dataKey="deforestation" name="Deforestation" fill="#E76F51" />
            <Bar dataKey="reforestation" name="Reforestation" fill="#52B788" />
            <Bar dataKey="netChange" name="Net Change" fill="#2D6A4F" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChart;
