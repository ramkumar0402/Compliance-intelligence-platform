import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  unit?: string;
  trend?: number[];
  icon?: React.ReactNode;
  color?: 'green' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
}

const colorStyles = {
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  blue: 'from-indigo-500 to-indigo-600',
};

export function MetricCard({
  title,
  value,
  previousValue,
  currentValue,
  unit,
  trend,
  icon,
  color = 'blue',
  onClick,
}: MetricCardProps) {
  const delta = previousValue !== undefined && currentValue !== undefined
    ? ((currentValue - previousValue) / previousValue * 100)
    : 0;
  
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const trendData = trend?.map((v, i) => ({ value: v, index: i })) || [];

  return (
    <Card onClick={onClick} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
            
            {/* Delta */}
            {previousValue !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {isNeutral ? (
                  <Minus className="w-4 h-4 text-slate-400" />
                ) : isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isNeutral ? 'text-slate-500' : isPositive ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {isPositive ? '+' : ''}{delta.toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white', colorStyles[color])}>
              {icon}
            </div>
          )}
        </div>

        {/* Sparkline */}
        {trendData.length > 0 && (
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : color === 'amber' ? '#f59e0b' : '#6366f1'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
