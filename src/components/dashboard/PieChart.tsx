
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

// Enhanced color palettes with better visual harmony
const COLORS = {
  deforestation: [
    '#E76F51', '#F4A261', '#E9C46A', '#2A9D8F', '#264653', 
    '#BC4639', '#D8973C', '#A98467', '#8E9AAF', '#5E6472',
    '#D62828', '#F77F00', '#FCBF49', '#90BE6D', '#43AA8B'
  ],
  reforestation: [
    '#52B788', '#2D6A4F', '#40916C', '#74C69D', '#95D5B2',
    '#006466', '#144552', '#1B3A4B', '#212F45', '#272640',
    '#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7'
  ]
};

// Custom rendering for the label to make it cleaner
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  // Only show label for segments with enough space (more than 5%)
  if (percent < 0.05) return null;
  
  const RADIAN = Math.PI / 180;
  // Position the label outside the pie
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#888888"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="11"
      fontWeight="500"
    >
      {`${name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100">
        <p className="font-medium text-sm">{payload[0].name}</p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{payload[0].value.toLocaleString()}</span> ha
        </p>
        <p className="text-xs text-gray-500">
          {(payload[0].payload.percent * 100).toFixed(2)}% of total
        </p>
      </div>
    );
  }

  return null;
};

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  dataKey,
  height = 400 
}) => {
  // Filter out items with zero values
  const filteredData = data.filter(item => item[dataKey] > 0);
  
  // Calculate percentages for each slice
  const total = filteredData.reduce((sum, item) => sum + item[dataKey], 0);
  const pieData = filteredData.map(item => ({
    name: item.name,
    value: item[dataKey],
    percent: item[dataKey] / total
  }));

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={height / 3}
                innerRadius={height / 10} // Add inner radius to create a donut effect
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2} // Add space between segments
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[dataKey][index % COLORS[dataKey].length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '11px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                formatter={(value) => <span className="text-gray-700">{value}</span>}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
