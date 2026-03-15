import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileSpreadsheet, CheckCircle, XCircle, Upload, Download, RefreshCw, Search, ArrowRight, Eye, Check, X, Clock, DollarSign, GitCompare, Layers } from 'lucide-react';

interface ReconciliationItem {
  id: string;
  sourceA: string;
  sourceB: string;
  entityName: string;
  category: string;
  fieldName: string;
  valueA: number;
  valueB: number;
  difference: number;
  percentDiff: number;
  status: 'matched' | 'discrepancy' | 'pending-review' | 'resolved' | 'exception';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string | null;
  lastUpdated: string;
  notes: string[];
  resolutionMethod?: string;
}

interface ReconciliationSummary {
  id: string;
  name: string;
  sourceA: string;
  sourceB: string;
  totalItems: number;
  matched: number;
  discrepancies: number;
  pending: number;
  matchRate: number;
  totalValueA: number;
  totalValueB: number;
  netDifference: number;
  lastRun: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

const mockSummaries: ReconciliationSummary[] = [
  {
    id: 'rec-1',
    name: 'Q4 2023 Revenue Reconciliation',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    totalItems: 1250,
    matched: 1180,
    discrepancies: 52,
    pending: 18,
    matchRate: 94.4,
    totalValueA: 125000000,
    totalValueB: 124850000,
    netDifference: 150000,
    lastRun: '2024-01-15T08:00:00Z',
    status: 'completed'
  },
  {
    id: 'rec-2',
    name: 'Bank Statement vs GL',
    sourceA: 'Bank Statement',
    sourceB: 'General Ledger',
    totalItems: 856,
    matched: 820,
    discrepancies: 28,
    pending: 8,
    matchRate: 95.8,
    totalValueA: 45600000,
    totalValueB: 45580000,
    netDifference: 20000,
    lastRun: '2024-01-14T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'rec-3',
    name: 'Intercompany Balances',
    sourceA: 'Entity A Ledger',
    sourceB: 'Entity B Ledger',
    totalItems: 324,
    matched: 290,
    discrepancies: 34,
    pending: 0,
    matchRate: 89.5,
    totalValueA: 78900000,
    totalValueB: 78650000,
    netDifference: 250000,
    lastRun: '2024-01-13T10:15:00Z',
    status: 'completed'
  },
  {
    id: 'rec-4',
    name: 'Vendor Invoice Match',
    sourceA: 'AP Subledger',
    sourceB: 'Vendor Portal',
    totalItems: 2100,
    matched: 1950,
    discrepancies: 120,
    pending: 30,
    matchRate: 92.9,
    totalValueA: 34500000,
    totalValueB: 34380000,
    netDifference: 120000,
    lastRun: '2024-01-15T06:00:00Z',
    status: 'in-progress'
  }
];

const mockItems: ReconciliationItem[] = [
  {
    id: 'item-1',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Tata Steel Ltd',
    category: 'Revenue',
    fieldName: 'Q4 Sales Revenue',
    valueA: 15420000,
    valueB: 15380000,
    difference: 40000,
    percentDiff: 0.26,
    status: 'discrepancy',
    priority: 'high',
    assignedTo: 'Sarah Chen',
    lastUpdated: '2024-01-15T09:30:00Z',
    notes: ['Initial review completed', 'Pending vendor confirmation']
  },
  {
    id: 'item-2',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Infosys Ltd',
    category: 'Revenue',
    fieldName: 'Service Income',
    valueA: 8750000,
    valueB: 8750000,
    difference: 0,
    percentDiff: 0,
    status: 'matched',
    priority: 'low',
    assignedTo: null,
    lastUpdated: '2024-01-15T08:00:00Z',
    notes: []
  },
  {
    id: 'item-3',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Reliance Industries',
    category: 'Cost of Sales',
    fieldName: 'Raw Material Cost',
    valueA: 22100000,
    valueB: 21950000,
    difference: 150000,
    percentDiff: 0.68,
    status: 'pending-review',
    priority: 'high',
    assignedTo: 'Mike Johnson',
    lastUpdated: '2024-01-14T16:45:00Z',
    notes: ['Currency conversion differences identified']
  },
  {
    id: 'item-4',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Mahindra Group',
    category: 'Operating Expenses',
    fieldName: 'Marketing Expenses',
    valueA: 4520000,
    valueB: 4520000,
    difference: 0,
    percentDiff: 0,
    status: 'matched',
    priority: 'low',
    assignedTo: null,
    lastUpdated: '2024-01-15T08:00:00Z',
    notes: []
  },
  {
    id: 'item-5',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Adani Enterprises',
    category: 'Revenue',
    fieldName: 'Export Revenue',
    valueA: 31200000,
    valueB: 30950000,
    difference: 250000,
    percentDiff: 0.80,
    status: 'discrepancy',
    priority: 'high',
    assignedTo: null,
    lastUpdated: '2024-01-15T10:00:00Z',
    notes: ['Large variance requires immediate attention']
  },
  {
    id: 'item-6',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'TCS Ltd',
    category: 'Revenue',
    fieldName: 'Consulting Revenue',
    valueA: 12800000,
    valueB: 12790000,
    difference: 10000,
    percentDiff: 0.08,
    status: 'resolved',
    priority: 'low',
    assignedTo: 'Emma Wilson',
    lastUpdated: '2024-01-14T11:20:00Z',
    notes: ['Rounding difference - accepted'],
    resolutionMethod: 'Accepted as immaterial'
  },
  {
    id: 'item-7',
    sourceA: 'SAP Financial',
    sourceB: 'Oracle ERP',
    entityName: 'Wipro Ltd',
    category: 'Intercompany',
    fieldName: 'IC Transfer',
    valueA: 5600000,
    valueB: 5450000,
    difference: 150000,
    percentDiff: 2.68,
    status: 'exception',
    priority: 'high',
    assignedTo: 'Sarah Chen',
    lastUpdated: '2024-01-15T07:30:00Z',
    notes: ['Timing difference - quarter-end cutoff issue', 'Escalated to management']
  }
];

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'matched': return 'bg-green-100 text-green-800';
    case 'discrepancy': return 'bg-red-100 text-red-800';
    case 'pending-review': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-blue-100 text-blue-800';
    case 'exception': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export default function Reconciliation() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'upload' | 'reports'>('overview');
  const [selectedSummary, setSelectedSummary] = useState<ReconciliationSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(null);

  const filteredItems = useMemo(() => {
    return mockItems.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (searchTerm && !item.entityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.fieldName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, priorityFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalReconciliations = mockSummaries.length;
    const totalItems = mockSummaries.reduce((a, b) => a + b.totalItems, 0);
    const totalMatched = mockSummaries.reduce((a, b) => a + b.matched, 0);
    const totalDiscrepancies = mockSummaries.reduce((a, b) => a + b.discrepancies, 0);
    const avgMatchRate = mockSummaries.reduce((a, b) => a + b.matchRate, 0) / totalReconciliations;
    const totalNetDiff = mockSummaries.reduce((a, b) => a + b.netDifference, 0);

    return { totalReconciliations, totalItems, totalMatched, totalDiscrepancies, avgMatchRate, totalNetDiff };
  }, []);

  const pieData = [
    { name: 'Matched', value: stats.totalMatched, color: '#10B981' },
    { name: 'Discrepancies', value: stats.totalDiscrepancies, color: '#EF4444' },
    { name: 'Pending', value: stats.totalItems - stats.totalMatched - stats.totalDiscrepancies, color: '#F59E0B' }
  ];

  const trendData = [
    { month: 'Aug', matchRate: 91.2 },
    { month: 'Sep', matchRate: 92.5 },
    { month: 'Oct', matchRate: 93.1 },
    { month: 'Nov', matchRate: 93.8 },
    { month: 'Dec', matchRate: 94.2 },
    { month: 'Jan', matchRate: 94.4 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Source Reconciliation</h1>
          <p className="text-gray-600 mt-1">Compare and reconcile data across multiple financial systems</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Run All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Upload className="w-4 h-4" />
            New Reconciliation
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Layers className="w-4 h-4" />
            Reconciliations
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalReconciliations}</p>
          <p className="text-xs text-gray-500 mt-1">Active processes</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <GitCompare className="w-4 h-4" />
            Total Items
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalItems.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Line items compared</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Matched
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalMatched.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.avgMatchRate.toFixed(1)}% match rate</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <XCircle className="w-4 h-4" />
            Discrepancies
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.totalDiscrepancies}</p>
          <p className="text-xs text-gray-500 mt-1">Requires action</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">56</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-indigo-600 text-sm">
            <DollarSign className="w-4 h-4" />
            Net Difference
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(stats.totalNetDiff)}</p>
          <p className="text-xs text-gray-500 mt-1">Total variance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'items', label: 'Reconciliation Items', icon: FileSpreadsheet },
            { id: 'upload', label: 'New Upload', icon: Upload },
            { id: 'reports', label: 'Reports', icon: Download }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Reconciliation List */}
          <div className="col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900">Active Reconciliations</h2>
            <div className="space-y-3">
              {mockSummaries.map(summary => (
                <div
                  key={summary.id}
                  onClick={() => setSelectedSummary(summary)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedSummary?.id === summary.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{summary.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {summary.sourceA} <ArrowRight className="w-3 h-3 inline mx-1" /> {summary.sourceB}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      summary.status === 'completed' ? 'bg-green-100 text-green-800' :
                      summary.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {summary.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="font-semibold">{summary.totalItems.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Matched</p>
                      <p className="font-semibold text-green-600">{summary.matched.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Discrepancies</p>
                      <p className="font-semibold text-red-600">{summary.discrepancies}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Match Rate</p>
                      <p className="font-semibold text-indigo-600">{summary.matchRate}%</p>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(summary.matched / summary.totalItems) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(summary.discrepancies / summary.totalItems) * 100}%` }}
                      />
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(summary.pending / summary.totalItems) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Net Difference: <span className="font-medium text-red-600">{formatCurrency(summary.netDifference)}</span></span>
                    <span>Last run: {new Date(summary.lastRun).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Match Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Match Rate Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="matchRate"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {selectedSummary && (
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Value Comparison</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{selectedSummary.sourceA}</span>
                      <span className="font-medium">{formatCurrency(selectedSummary.totalValueA)}</span>
                    </div>
                    <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{selectedSummary.sourceB}</span>
                      <span className="font-medium">{formatCurrency(selectedSummary.totalValueB)}</span>
                    </div>
                    <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(selectedSummary.totalValueB / selectedSummary.totalValueA) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <span className="font-medium">Net Difference:</span> {formatCurrency(selectedSummary.netDifference)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by entity or field name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="matched">Matched</option>
              <option value="discrepancy">Discrepancy</option>
              <option value="pending-review">Pending Review</option>
              <option value="resolved">Resolved</option>
              <option value="exception">Exception</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity / Field</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source A</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source B</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Difference</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.entityName}</p>
                      <p className="text-sm text-gray-500">{item.fieldName}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {formatCurrency(item.valueA)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {formatCurrency(item.valueB)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className={`font-mono text-sm ${item.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.difference > 0 ? '+' : ''}{formatCurrency(item.difference)}
                      </p>
                      <p className="text-xs text-gray-500">{item.percentDiff.toFixed(2)}%</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.assignedTo || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Item Detail Modal */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Reconciliation Item Details</h3>
                    <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Entity Name</p>
                      <p className="font-medium">{selectedItem.entityName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Field Name</p>
                      <p className="font-medium">{selectedItem.fieldName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedItem.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Value Comparison</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{selectedItem.sourceA}</p>
                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(selectedItem.valueA)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Difference</p>
                        <p className={`text-xl font-bold ${selectedItem.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedItem.difference > 0 ? '+' : ''}{formatCurrency(selectedItem.difference)}
                        </p>
                        <p className="text-xs text-gray-500">({selectedItem.percentDiff.toFixed(2)}%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{selectedItem.sourceB}</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(selectedItem.valueB)}</p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.notes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <ul className="space-y-1">
                        {selectedItem.notes.map((note, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedItem.resolutionMethod && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Resolution:</span> {selectedItem.resolutionMethod}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Accept Match
                    </button>
                    <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Mark Exception
                    </button>
                    <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Assign to Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Create New Reconciliation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reconciliation Name</label>
                <input
                  type="text"
                  placeholder="e.g., Q1 2024 Revenue Reconciliation"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source A Name</label>
                  <input
                    type="text"
                    placeholder="e.g., SAP Financial"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source B Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Oracle ERP"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Source A File</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-indigo-400 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drop CSV/Excel file here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Source B File</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-indigo-400 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drop CSV/Excel file here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Matching Rules</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="exact" className="rounded" defaultChecked />
                    <label htmlFor="exact" className="text-sm text-gray-700">Exact value match</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="tolerance" className="rounded" />
                    <label htmlFor="tolerance" className="text-sm text-gray-700">Allow tolerance (±</label>
                    <input type="number" defaultValue="0.01" className="w-20 px-2 py-1 border rounded text-sm" />
                    <span className="text-sm text-gray-700">%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="fuzzy" className="rounded" />
                    <label htmlFor="fuzzy" className="text-sm text-gray-700">Fuzzy text matching for entity names</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Start Reconciliation
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900">Generated Reports</h2>
            <div className="bg-white rounded-xl border divide-y">
              {[
                { name: 'Q4 2023 Reconciliation Summary', type: 'PDF', date: '2024-01-15', size: '2.4 MB' },
                { name: 'Bank Reconciliation Details', type: 'Excel', date: '2024-01-14', size: '1.8 MB' },
                { name: 'Intercompany Variance Analysis', type: 'PDF', date: '2024-01-13', size: '3.1 MB' },
                { name: 'Monthly Reconciliation Dashboard', type: 'PDF', date: '2024-01-12', size: '1.5 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">{report.type} • {report.size} • Generated {report.date}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Generate New Report</h2>
            <div className="bg-white rounded-xl border p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Summary Report</option>
                  <option>Detailed Variance Report</option>
                  <option>Exception Report</option>
                  <option>Trend Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reconciliation</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Q4 2023 Revenue Reconciliation</option>
                  <option>Bank Statement vs GL</option>
                  <option>Intercompany Balances</option>
                  <option>Vendor Invoice Match</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" defaultChecked className="text-indigo-600" />
                    <span className="text-sm">PDF</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" className="text-indigo-600" />
                    <span className="text-sm">Excel</span>
                  </label>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
