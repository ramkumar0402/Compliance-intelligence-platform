import { useState } from 'react';
import { 
  Shield, 
  Building2, 
  AlertTriangle, 
  Scale, 
  BarChart3, 
  TrendingUp,
  Upload,
  FileText,
  Plus
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricCard } from '../components/dashboard/MetricCard';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { Button } from '../components/ui/Button';
import { complianceMetrics, alerts as initialAlerts, activityEvents } from '../data/mockData';
import { Alert } from '../types';

type Module = 'dashboard' | 'data-quality' | 'entity-mapper' | 'independence' | 'kpi' | 'reconciliation' | 'reports';

interface HomeDashboardProps {
  onNavigate: (module: Module) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleMarkReviewed = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, reviewed: true } : a
    ));
  };

  const getScoreColor = (score: number): 'green' | 'amber' | 'red' => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Compliance Dashboard" 
        subtitle="Integrated Compliance & Independence Analytics Platform" 
      />

      <main className="p-8">
        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button onClick={() => onNavigate('independence')}>
            <Shield className="w-4 h-4 mr-2" />
            Run Independence Check
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('data-quality')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Dataset for Audit
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('reports')}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Compliance Report
          </Button>
          <Button variant="outline" onClick={() => onNavigate('entity-mapper')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Entity
          </Button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Overall Compliance Health"
            value={complianceMetrics.overallScore}
            unit="/100"
            previousValue={complianceMetrics.previousScore}
            currentValue={complianceMetrics.overallScore}
            trend={complianceMetrics.historicalScores}
            icon={<Shield className="w-6 h-6" />}
            color={getScoreColor(complianceMetrics.overallScore)}
            onClick={() => onNavigate('reports')}
          />
          <MetricCard
            title="Total Entities Monitored"
            value={complianceMetrics.totalEntities.toLocaleString()}
            previousValue={complianceMetrics.previousEntities}
            currentValue={complianceMetrics.totalEntities}
            trend={[1150, 1175, 1190, 1198, 1220, 1247]}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
            onClick={() => onNavigate('entity-mapper')}
          />
          <MetricCard
            title="Active Independence Conflicts"
            value={complianceMetrics.activeConflicts}
            previousValue={complianceMetrics.previousConflicts}
            currentValue={complianceMetrics.activeConflicts}
            trend={[45, 38, 35, 31, 28, 23]}
            icon={<AlertTriangle className="w-6 h-6" />}
            color={complianceMetrics.activeConflicts > 20 ? 'amber' : 'green'}
            onClick={() => onNavigate('independence')}
          />
          <MetricCard
            title="Open Reconciliation Items"
            value={complianceMetrics.openReconciliations}
            previousValue={complianceMetrics.previousReconciliations}
            currentValue={complianceMetrics.openReconciliations}
            trend={[220, 205, 195, 189, 175, 156]}
            icon={<Scale className="w-6 h-6" />}
            color="blue"
            onClick={() => onNavigate('reconciliation')}
          />
          <MetricCard
            title="Data Quality Score"
            value={complianceMetrics.dataQualityScore}
            unit="%"
            previousValue={complianceMetrics.previousDataQuality}
            currentValue={complianceMetrics.dataQualityScore}
            trend={[85, 86, 87, 88, 89, 91]}
            icon={<BarChart3 className="w-6 h-6" />}
            color={getScoreColor(complianceMetrics.dataQualityScore)}
            onClick={() => onNavigate('data-quality')}
          />
          <MetricCard
            title="KPI Anomalies Detected"
            value={complianceMetrics.kpiAnomalies}
            unit="last 30 days"
            previousValue={complianceMetrics.previousAnomalies}
            currentValue={complianceMetrics.kpiAnomalies}
            trend={[15, 14, 13, 12, 10, 7]}
            icon={<TrendingUp className="w-6 h-6" />}
            color={complianceMetrics.kpiAnomalies > 10 ? 'amber' : 'green'}
            onClick={() => onNavigate('kpi')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts Feed - 2 columns */}
          <div className="lg:col-span-2">
            <AlertsFeed alerts={alerts} onMarkReviewed={handleMarkReviewed} />
          </div>

          {/* System Health - 1 column */}
          <div>
            <SystemHealth />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mt-8">
          <ActivityTimeline events={activityEvents} />
        </div>
      </main>
    </div>
  );
}
