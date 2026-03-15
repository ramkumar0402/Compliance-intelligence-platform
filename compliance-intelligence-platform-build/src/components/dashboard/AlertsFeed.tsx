import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../utils/cn';

interface AlertsFeedProps {
  alerts: Alert[];
  onMarkReviewed: (id: string) => void;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', badge: 'critical' as const },
  high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', badge: 'high' as const },
  medium: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', badge: 'medium' as const },
  info: { icon: Info, color: 'text-sky-500', bg: 'bg-sky-50', badge: 'info' as const },
};

export function AlertsFeed({ alerts, onMarkReviewed }: AlertsFeedProps) {
  const [filter, setFilter] = useState<'all' | 'unreviewed'>('all');
  
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => !a.reviewed);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
          <p className="text-sm text-slate-500 mt-1">Last 10 alerts across all modules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unreviewed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unreviewed')}
          >
            Unreviewed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {filteredAlerts.slice(0, 10).map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors',
                  alert.reviewed && 'opacity-60'
                )}
              >
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={config.badge}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="default">{alert.module}</Badge>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">{alert.entityName}</p>
                  <p className="mt-0.5 text-sm text-slate-600 truncate">{alert.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.reviewed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkReviewed(alert.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
