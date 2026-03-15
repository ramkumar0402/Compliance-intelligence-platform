import { CheckCircle, AlertCircle, Database, Cloud, Clock, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';
import { format, subHours } from 'date-fns';

interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  icon: React.ReactNode;
  details: string;
}

const systemStatuses: SystemStatus[] = [
  {
    name: 'Database Connection',
    status: 'healthy',
    icon: <Database className="w-4 h-4" />,
    details: 'SQLite connected, 45.2 MB used',
  },
  {
    name: 'Last Backup',
    status: 'healthy',
    icon: <HardDrive className="w-4 h-4" />,
    details: format(subHours(new Date(), 2), 'MMM d, yyyy h:mm a'),
  },
  {
    name: 'MCA India API',
    status: 'healthy',
    icon: <Cloud className="w-4 h-4" />,
    details: 'Connected, 142 requests today',
  },
  {
    name: 'System Uptime',
    status: 'healthy',
    icon: <Clock className="w-4 h-4" />,
    details: '99.9% (last 30 days)',
  },
];

const recordCounts = [
  { module: 'Entities', count: 1247 },
  { module: 'Conflicts', count: 89 },
  { module: 'Audits', count: 456 },
  { module: 'Reconciliations', count: 2341 },
  { module: 'Reports', count: 178 },
];

export function SystemHealth() {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
        <p className="text-sm text-slate-500 mt-1">Platform status and metrics</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Statuses */}
        <div className="space-y-3">
          {systemStatuses.map((status) => (
            <div
              key={status.name}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    status.status === 'healthy' && 'bg-emerald-100 text-emerald-600',
                    status.status === 'warning' && 'bg-amber-100 text-amber-600',
                    status.status === 'error' && 'bg-red-100 text-red-600'
                  )}
                >
                  {status.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{status.name}</p>
                  <p className="text-xs text-slate-500">{status.details}</p>
                </div>
              </div>
              {status.status === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle
                  className={cn(
                    'w-5 h-5',
                    status.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Record Counts */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Record Counts</h4>
          <div className="grid grid-cols-2 gap-2">
            {recordCounts.map((record) => (
              <div
                key={record.module}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
              >
                <span className="text-sm text-slate-600">{record.module}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {record.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
