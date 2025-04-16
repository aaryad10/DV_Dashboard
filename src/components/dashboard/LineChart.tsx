
import React from 'react';
import { ChartData } from '@/types/forest-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title,
  height = 400 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
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
              formatter={(value) => [`${value.toLocaleString()} ha`, '']}
              labelFormatter={(name) => `Year: ${name}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="deforestation" 
              name="Deforestation" 
              stroke="#E76F51" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="reforestation" 
              name="Reforestation" 
              stroke="#52B788" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="netChange" 
              name="Net Change" 
              stroke="#2D6A4F" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineChart;
