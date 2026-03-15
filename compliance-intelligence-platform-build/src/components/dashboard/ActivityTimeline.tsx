import { Card, CardHeader, CardContent } from '../ui/Card';
import { ActivityEvent } from '../../types';
import { format, subDays, startOfDay } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  // Process events into daily counts by type
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 29 - i));
    return {
      date: format(date, 'MMM d'),
      fullDate: date,
      audits: 0,
      conflicts: 0,
      reconciliations: 0,
      reports: 0,
    };
  });

  events.forEach((event) => {
    const eventDate = startOfDay(event.date);
    const dayIndex = last30Days.findIndex(
      (d) => d.fullDate.getTime() === eventDate.getTime()
    );
    if (dayIndex >= 0) {
      switch (event.type) {
        case 'audit':
          last30Days[dayIndex].audits++;
          break;
        case 'conflict':
          last30Days[dayIndex].conflicts++;
          break;
        case 'reconciliation':
          last30Days[dayIndex].reconciliations++;
          break;
        case 'report':
          last30Days[dayIndex].reports++;
          break;
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">Platform Activity</h3>
        <p className="text-sm text-slate-500 mt-1">Activity across modules over the last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="audits"
                name="Audits"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="conflicts"
                name="Conflicts"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="reconciliations"
                name="Reconciliations"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="reports"
                name="Reports"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
