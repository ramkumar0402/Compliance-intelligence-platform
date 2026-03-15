import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ReferenceLine, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Activity, Target, Download, RefreshCw, Settings, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'off-track';
  anomalyDetected: boolean;
  anomalyScore: number;
  history: { date: string; value: number; upperBound: number; lowerBound: number }[];
  lastUpdated: string;
}

interface Anomaly {
  id: string;
  kpiId: string;
  kpiName: string;
  detectedAt: string;
  type: 'spike' | 'drop' | 'trend-break' | 'seasonality-violation' | 'threshold-breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  currentValue: number;
  expectedValue: number;
  deviation: number;
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  assignedTo: string | null;
  rootCause: string | null;
}

const generateKPIHistory = (baseValue: number, months: number = 12): { date: string; value: number; upperBound: number; lowerBound: number }[] => {
  const history = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const variation = (Math.random() - 0.5) * baseValue * 0.3;
    const value = Math.max(0, baseValue + variation);
    const stdDev = baseValue * 0.1;
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: Math.round(value * 100) / 100,
      upperBound: Math.round((baseValue + 2 * stdDev) * 100) / 100,
      lowerBound: Math.round(Math.max(0, baseValue - 2 * stdDev) * 100) / 100
    });
  }
  
  return history;
};

const mockKPIs: KPI[] = [
  {
    id: 'kpi-1',
    name: 'Revenue Collection Rate',
    category: 'Financial',
    currentValue: 94.5,
    previousValue: 92.1,
    target: 95,
    unit: '%',
    trend: 'up',
    status: 'at-risk',
    anomalyDetected: false,
    anomalyScore: 0.2,
    history: generateKPIHistory(93),
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'kpi-2',
    name: 'Days Sales Outstanding',
    category: 'Financial',
    currentValue: 45,
    previousValue: 38,
    target: 35,
    unit: 'days',
    trend: 'up',
    status: 'off-track',
    anomalyDetected: true,
    anomalyScore: 0.85,
    history: generateKPIHistory(40),
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'kpi-3',
    name: 'Audit Completion Rate',
    category: 'Compliance',
    currentValue: 88,
    previousValue: 85,
    target: 90,
    unit: '%',
    trend: 'up',
    status: 'at-risk',
    anomalyDetected: false,
    anomalyScore: 0.15,
    history: generateKPIHistory(86),
    lastUpdated: '2024-01-15T09:15:00Z'
  },
  {
    id: 'kpi-4',
    name: 'Policy Violation Count',
    category: 'Compliance',
    currentValue: 12,
    previousValue: 8,
    target: 5,
    unit: 'violations',
    trend: 'up',
    status: 'off-track',
    anomalyDetected: true,
    anomalyScore: 0.72,
    history: generateKPIHistory(9),
    lastUpdated: '2024-01-15T11:00:00Z'
  },
  {
    id: 'kpi-5',
    name: 'Independence Clearance Time',
    category: 'Operations',
    currentValue: 2.3,
    previousValue: 2.5,
    target: 2,
    unit: 'days',
    trend: 'down',
    status: 'at-risk',
    anomalyDetected: false,
    anomalyScore: 0.25,
    history: generateKPIHistory(2.4),
    lastUpdated: '2024-01-15T08:45:00Z'
  },
  {
    id: 'kpi-6',
    name: 'Entity Data Accuracy',
    category: 'Data Quality',
    currentValue: 97.2,
    previousValue: 96.8,
    target: 98,
    unit: '%',
    trend: 'up',
    status: 'on-track',
    anomalyDetected: false,
    anomalyScore: 0.1,
    history: generateKPIHistory(97),
    lastUpdated: '2024-01-15T10:00:00Z'
  },
  {
    id: 'kpi-7',
    name: 'Reconciliation Discrepancies',
    category: 'Financial',
    currentValue: 23,
    previousValue: 18,
    target: 10,
    unit: 'items',
    trend: 'up',
    status: 'off-track',
    anomalyDetected: true,
    anomalyScore: 0.68,
    history: generateKPIHistory(18),
    lastUpdated: '2024-01-15T11:30:00Z'
  },
  {
    id: 'kpi-8',
    name: 'Client Response Time',
    category: 'Operations',
    currentValue: 4.2,
    previousValue: 4.5,
    target: 4,
    unit: 'hours',
    trend: 'down',
    status: 'on-track',
    anomalyDetected: false,
    anomalyScore: 0.12,
    history: generateKPIHistory(4.3),
    lastUpdated: '2024-01-15T09:30:00Z'
  }
];

const mockAnomalies: Anomaly[] = [
  {
    id: 'anom-1',
    kpiId: 'kpi-2',
    kpiName: 'Days Sales Outstanding',
    detectedAt: '2024-01-15T08:30:00Z',
    type: 'spike',
    severity: 'high',
    currentValue: 45,
    expectedValue: 38,
    deviation: 18.4,
    status: 'investigating',
    assignedTo: 'Sarah Chen',
    rootCause: null
  },
  {
    id: 'anom-2',
    kpiId: 'kpi-4',
    kpiName: 'Policy Violation Count',
    detectedAt: '2024-01-14T14:20:00Z',
    type: 'trend-break',
    severity: 'critical',
    currentValue: 12,
    expectedValue: 7,
    deviation: 71.4,
    status: 'open',
    assignedTo: null,
    rootCause: null
  },
  {
    id: 'anom-3',
    kpiId: 'kpi-7',
    kpiName: 'Reconciliation Discrepancies',
    detectedAt: '2024-01-15T06:00:00Z',
    type: 'threshold-breach',
    severity: 'high',
    currentValue: 23,
    expectedValue: 15,
    deviation: 53.3,
    status: 'open',
    assignedTo: null,
    rootCause: null
  },
  {
    id: 'anom-4',
    kpiId: 'kpi-1',
    kpiName: 'Revenue Collection Rate',
    detectedAt: '2024-01-13T10:00:00Z',
    type: 'drop',
    severity: 'medium',
    currentValue: 91.2,
    expectedValue: 94,
    deviation: 2.9,
    status: 'resolved',
    assignedTo: 'Mike Johnson',
    rootCause: 'Delayed payments from 3 major clients due to holiday period'
  },
  {
    id: 'anom-5',
    kpiId: 'kpi-3',
    kpiName: 'Audit Completion Rate',
    detectedAt: '2024-01-12T16:45:00Z',
    type: 'seasonality-violation',
    severity: 'low',
    currentValue: 82,
    expectedValue: 87,
    deviation: 5.7,
    status: 'false-positive',
    assignedTo: 'Emma Wilson',
    rootCause: 'Year-end reporting cycle - expected seasonal variation'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on-track': return 'text-green-600 bg-green-50';
    case 'at-risk': return 'text-yellow-600 bg-yellow-50';
    case 'off-track': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getAnomalyStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800';
    case 'investigating': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'false-positive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function KPIMonitor() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'anomalies' | 'analysis' | 'thresholds'>('dashboard');
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anomalySeverityFilter, setAnomalySeverityFilter] = useState<string>('all');
  const [showAnomalyDetail, setShowAnomalyDetail] = useState<Anomaly | null>(null);

  const categories = ['all', ...new Set(mockKPIs.map(k => k.category))];
  
  const filteredKPIs = useMemo(() => {
    return mockKPIs.filter(kpi => {
      if (categoryFilter !== 'all' && kpi.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && kpi.status !== statusFilter) return false;
      return true;
    });
  }, [categoryFilter, statusFilter]);

  const filteredAnomalies = useMemo(() => {
    return mockAnomalies.filter(anomaly => {
      if (anomalySeverityFilter !== 'all' && anomaly.severity !== anomalySeverityFilter) return false;
      return true;
    });
  }, [anomalySeverityFilter]);

  const kpiStats = useMemo(() => {
    const total = mockKPIs.length;
    const onTrack = mockKPIs.filter(k => k.status === 'on-track').length;
    const atRisk = mockKPIs.filter(k => k.status === 'at-risk').length;
    const offTrack = mockKPIs.filter(k => k.status === 'off-track').length;
    const withAnomalies = mockKPIs.filter(k => k.anomalyDetected).length;
    
    return { total, onTrack, atRisk, offTrack, withAnomalies };
  }, []);

  const anomalyStats = useMemo(() => {
    const total = mockAnomalies.length;
    const open = mockAnomalies.filter(a => a.status === 'open').length;
    const investigating = mockAnomalies.filter(a => a.status === 'investigating').length;
    const critical = mockAnomalies.filter(a => a.severity === 'critical').length;
    
    return { total, open, investigating, critical };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Anomaly Monitor</h1>
          <p className="text-gray-600 mt-1">Statistical detection and monitoring of key performance indicators</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Activity className="w-4 h-4" />
            Total KPIs
          </div>
          <p className="text-2xl font-bold mt-1">{kpiStats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Being monitored</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            On Track
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{kpiStats.onTrack}</p>
          <p className="text-xs text-gray-500 mt-1">{Math.round(kpiStats.onTrack / kpiStats.total * 100)}% of total</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <Clock className="w-4 h-4" />
            At Risk
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{kpiStats.atRisk}</p>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <XCircle className="w-4 h-4" />
            Off Track
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{kpiStats.offTrack}</p>
          <p className="text-xs text-gray-500 mt-1">Immediate action</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-orange-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Anomalies
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{anomalyStats.open}</p>
          <p className="text-xs text-gray-500 mt-1">{anomalyStats.critical} critical</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { id: 'dashboard', label: 'KPI Dashboard', icon: Activity },
            { id: 'anomalies', label: 'Anomaly Queue', icon: AlertTriangle },
            { id: 'analysis', label: 'Trend Analysis', icon: TrendingUp },
            { id: 'thresholds', label: 'Thresholds', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-3 gap-6">
          {/* KPI Grid */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">KPI Performance</h2>
              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="on-track">On Track</option>
                  <option value="at-risk">At Risk</option>
                  <option value="off-track">Off Track</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredKPIs.map(kpi => (
                <div
                  key={kpi.id}
                  onClick={() => setSelectedKPI(kpi)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedKPI?.id === kpi.id ? 'ring-2 ring-indigo-500' : ''
                  } ${kpi.anomalyDetected ? 'border-orange-300' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{kpi.name}</p>
                      <p className="text-xs text-gray-500">{kpi.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {kpi.anomalyDetected && (
                        <span className="p-1 bg-orange-100 rounded">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(kpi.status)}`}>
                        {kpi.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {kpi.currentValue}{kpi.unit === '%' || kpi.unit === 'days' || kpi.unit === 'hours' ? '' : ' '}{kpi.unit}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.trend === 'up' ? (
                          <ArrowUpRight className={`w-4 h-4 ${kpi.status === 'off-track' ? 'text-red-500' : 'text-green-500'}`} />
                        ) : kpi.trend === 'down' ? (
                          <ArrowDownRight className={`w-4 h-4 ${kpi.status === 'off-track' ? 'text-green-500' : 'text-green-500'}`} />
                        ) : null}
                        <span className={`text-sm ${kpi.trend === 'up' && kpi.status !== 'off-track' ? 'text-green-600' : kpi.trend === 'down' && kpi.status === 'off-track' ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(((kpi.currentValue - kpi.previousValue) / kpi.previousValue) * 100).toFixed(1)}% vs last
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="text-sm font-medium text-gray-700">{kpi.target}{kpi.unit}</p>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpi.history.slice(-6)}>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={kpi.status === 'on-track' ? '#10B981' : kpi.status === 'at-risk' ? '#F59E0B' : '#EF4444'}
                          fill={kpi.status === 'on-track' ? '#D1FAE5' : kpi.status === 'at-risk' ? '#FEF3C7' : '#FEE2E2'}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected KPI Detail */}
          <div className="space-y-4">
            {selectedKPI ? (
              <>
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">{selectedKPI.name}</h3>
                  
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedKPI.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          stroke="none"
                          fill="#E5E7EB"
                          fillOpacity={0.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="lowerBound"
                          stroke="none"
                          fill="#FFFFFF"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#4F46E5"
                          strokeWidth={2}
                          dot={{ fill: '#4F46E5', strokeWidth: 0 }}
                        />
                        <ReferenceLine
                          y={selectedKPI.target}
                          stroke="#10B981"
                          strokeDasharray="5 5"
                          label={{ value: 'Target', position: 'right', fontSize: 10 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-medium">{selectedKPI.currentValue} {selectedKPI.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target</span>
                      <span className="font-medium">{selectedKPI.target} {selectedKPI.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gap to Target</span>
                      <span className={`font-medium ${selectedKPI.currentValue >= selectedKPI.target ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedKPI.currentValue >= selectedKPI.target ? '+' : ''}{(selectedKPI.currentValue - selectedKPI.target).toFixed(1)} {selectedKPI.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Anomaly Score</span>
                      <span className={`font-medium ${selectedKPI.anomalyScore > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                        {(selectedKPI.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Statistical Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mean (12m)</span>
                      <span className="font-medium">
                        {(selectedKPI.history.reduce((a, b) => a + b.value, 0) / selectedKPI.history.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Std Dev</span>
                      <span className="font-medium">
                        {Math.sqrt(selectedKPI.history.reduce((a, b) => a + Math.pow(b.value - selectedKPI.history.reduce((c, d) => c + d.value, 0) / selectedKPI.history.length, 2), 0) / selectedKPI.history.length).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Value</span>
                      <span className="font-medium">{Math.min(...selectedKPI.history.map(h => h.value)).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Value</span>
                      <span className="font-medium">{Math.max(...selectedKPI.history.map(h => h.value)).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a KPI to view detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Anomaly Queue</h2>
            <select
              value={anomalySeverityFilter}
              onChange={(e) => setAnomalySeverityFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">KPI</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Deviation</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Detected</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAnomalies.map(anomaly => (
                  <tr key={anomaly.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{anomaly.kpiName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 capitalize">{anomaly.type.replace('-', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-red-600">+{anomaly.deviation.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{anomaly.currentValue} vs {anomaly.expectedValue}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(anomaly.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAnomalyStatusColor(anomaly.status)}`}>
                        {anomaly.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {anomaly.assignedTo || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setShowAnomalyDetail(anomaly)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Anomaly Detail Modal */}
          {showAnomalyDetail && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Anomaly Details</h3>
                    <button onClick={() => setShowAnomalyDetail(null)} className="text-gray-400 hover:text-gray-600">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">KPI Name</p>
                      <p className="font-medium">{showAnomalyDetail.kpiName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Anomaly Type</p>
                      <p className="font-medium capitalize">{showAnomalyDetail.type.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Value</p>
                      <p className="font-medium text-red-600">{showAnomalyDetail.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Value</p>
                      <p className="font-medium">{showAnomalyDetail.expectedValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deviation</p>
                      <p className="font-medium text-red-600">+{showAnomalyDetail.deviation.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Detected At</p>
                      <p className="font-medium">{new Date(showAnomalyDetail.detectedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {showAnomalyDetail.rootCause && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Root Cause Analysis</p>
                      <p className="text-gray-900">{showAnomalyDetail.rootCause}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Assign to Me
                    </button>
                    <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Mark as False Positive
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">KPI Performance Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockKPIs.map(k => ({
                  name: k.name.split(' ').slice(0, 2).join(' '),
                  current: k.currentValue,
                  target: k.target,
                  gap: k.target - k.currentValue
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="#4F46E5" name="Current" />
                  <Bar dataKey="target" fill="#10B981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Anomaly Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="anomalyScore" name="Anomaly Score" domain={[0, 1]} />
                  <YAxis type="number" dataKey="currentValue" name="Current Value" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    data={mockKPIs}
                    fill="#4F46E5"
                  >
                    {mockKPIs.map((entry, index) => (
                      <circle
                        key={index}
                        fill={entry.anomalyDetected ? '#EF4444' : '#4F46E5'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Multi-KPI Trend Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  {mockKPIs.slice(0, 4).map((kpi, index) => (
                    <Line
                      key={kpi.id}
                      data={kpi.history}
                      type="monotone"
                      dataKey="value"
                      name={kpi.name}
                      stroke={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][index]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Tab */}
      {activeTab === 'thresholds' && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">KPI Threshold Configuration</h3>
            <p className="text-sm text-gray-600">Configure anomaly detection thresholds for each KPI</p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">KPI</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Warning Threshold</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Critical Threshold</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Detection Method</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockKPIs.map(kpi => (
                <tr key={kpi.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{kpi.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{kpi.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium">{kpi.target} {kpi.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-sm">
                      ±10%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm">
                      ±20%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm">
                      Z-Score + IQR
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
