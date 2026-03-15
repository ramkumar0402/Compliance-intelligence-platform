import { useState } from 'react';
import { FileText, Download, Calendar, Clock, AlertTriangle, Building2, Shield, TrendingUp, GitCompare, Database, Settings, Eye, Trash2, Share2, RefreshCw } from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  modules: string[];
  lastGenerated: string | null;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'both';
  icon: React.ElementType;
}

interface GeneratedReport {
  id: string;
  name: string;
  templateId: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel';
  size: string;
  status: 'completed' | 'generating' | 'failed';
  downloadUrl: string;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  recipients: string[];
  active: boolean;
}

const mockTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Executive Compliance Summary',
    description: 'High-level compliance health scorecard for C-suite executives',
    modules: ['Dashboard', 'Independence', 'KPI'],
    lastGenerated: '2024-01-15T08:00:00Z',
    frequency: 'weekly',
    format: 'pdf',
    icon: Shield
  },
  {
    id: 'tpl-2',
    name: 'Independence Conflict Report',
    description: 'Detailed analysis of all independence conflicts and resolutions',
    modules: ['Independence', 'Entity'],
    lastGenerated: '2024-01-14T14:30:00Z',
    frequency: 'daily',
    format: 'pdf',
    icon: AlertTriangle
  },
  {
    id: 'tpl-3',
    name: 'Data Quality Audit Report',
    description: 'Comprehensive data quality assessment with recommendations',
    modules: ['Data Quality'],
    lastGenerated: '2024-01-13T10:15:00Z',
    frequency: 'monthly',
    format: 'both',
    icon: Database
  },
  {
    id: 'tpl-4',
    name: 'Entity Structure Analysis',
    description: 'Corporate ownership mapping and relationship analysis',
    modules: ['Entity'],
    lastGenerated: '2024-01-12T09:00:00Z',
    frequency: 'monthly',
    format: 'pdf',
    icon: Building2
  },
  {
    id: 'tpl-5',
    name: 'Reconciliation Summary',
    description: 'Multi-source reconciliation status and variance report',
    modules: ['Reconciliation'],
    lastGenerated: '2024-01-15T06:00:00Z',
    frequency: 'daily',
    format: 'excel',
    icon: GitCompare
  },
  {
    id: 'tpl-6',
    name: 'KPI Anomaly Alert Report',
    description: 'Statistical anomaly detection results and trend analysis',
    modules: ['KPI'],
    lastGenerated: '2024-01-14T18:00:00Z',
    frequency: 'weekly',
    format: 'pdf',
    icon: TrendingUp
  }
];

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'rpt-1',
    name: 'Executive Compliance Summary - Jan 2024',
    templateId: 'tpl-1',
    generatedAt: '2024-01-15T08:00:00Z',
    generatedBy: 'System',
    format: 'pdf',
    size: '2.4 MB',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'rpt-2',
    name: 'Independence Conflict Report - 2024-01-14',
    templateId: 'tpl-2',
    generatedAt: '2024-01-14T14:30:00Z',
    generatedBy: 'Sarah Chen',
    format: 'pdf',
    size: '1.8 MB',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'rpt-3',
    name: 'Data Quality Audit - Q4 2023',
    templateId: 'tpl-3',
    generatedAt: '2024-01-13T10:15:00Z',
    generatedBy: 'Mike Johnson',
    format: 'pdf',
    size: '3.2 MB',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'rpt-4',
    name: 'Reconciliation Summary - 2024-01-15',
    templateId: 'tpl-5',
    generatedAt: '2024-01-15T06:00:00Z',
    generatedBy: 'System',
    format: 'excel',
    size: '4.1 MB',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'rpt-5',
    name: 'Entity Structure Analysis - Jan 2024',
    templateId: 'tpl-4',
    generatedAt: '2024-01-12T09:00:00Z',
    generatedBy: 'Emma Wilson',
    format: 'pdf',
    size: '5.6 MB',
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'rpt-6',
    name: 'KPI Report - Generating...',
    templateId: 'tpl-6',
    generatedAt: '2024-01-15T11:30:00Z',
    generatedBy: 'Current User',
    format: 'pdf',
    size: '-',
    status: 'generating',
    downloadUrl: '#'
  }
];

const mockScheduledReports: ScheduledReport[] = [
  {
    id: 'sch-1',
    templateId: 'tpl-1',
    templateName: 'Executive Compliance Summary',
    frequency: 'weekly',
    nextRun: '2024-01-22T08:00:00Z',
    recipients: ['ceo@company.com', 'cfo@company.com', 'cro@company.com'],
    active: true
  },
  {
    id: 'sch-2',
    templateId: 'tpl-2',
    templateName: 'Independence Conflict Report',
    frequency: 'daily',
    nextRun: '2024-01-16T14:30:00Z',
    recipients: ['compliance@company.com'],
    active: true
  },
  {
    id: 'sch-3',
    templateId: 'tpl-5',
    templateName: 'Reconciliation Summary',
    frequency: 'daily',
    nextRun: '2024-01-16T06:00:00Z',
    recipients: ['finance@company.com', 'accounting@company.com'],
    active: true
  },
  {
    id: 'sch-4',
    templateId: 'tpl-3',
    templateName: 'Data Quality Audit Report',
    frequency: 'monthly',
    nextRun: '2024-02-01T10:00:00Z',
    recipients: ['data-team@company.com'],
    active: false
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'generating': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFrequencyColor = (freq: string) => {
  switch (freq) {
    case 'daily': return 'bg-blue-100 text-blue-800';
    case 'weekly': return 'bg-purple-100 text-purple-800';
    case 'monthly': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ReportGenerator() {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'scheduled' | 'create'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const stats = {
    totalReports: mockGeneratedReports.length,
    thisWeek: mockGeneratedReports.filter(r => new Date(r.generatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    scheduled: mockScheduledReports.filter(s => s.active).length,
    templates: mockTemplates.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Generator</h1>
          <p className="text-gray-600 mt-1">Create, schedule, and manage compliance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4" />
            Create Custom Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <FileText className="w-4 h-4" />
            Total Reports
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalReports}</p>
          <p className="text-xs text-gray-500 mt-1">Generated all time</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Calendar className="w-4 h-4" />
            This Week
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.thisWeek}</p>
          <p className="text-xs text-gray-500 mt-1">Reports generated</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-indigo-600 text-sm">
            <Clock className="w-4 h-4" />
            Scheduled
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.scheduled}</p>
          <p className="text-xs text-gray-500 mt-1">Active schedules</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-purple-600 text-sm">
            <Database className="w-4 h-4" />
            Templates
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.templates}</p>
          <p className="text-xs text-gray-500 mt-1">Available templates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { id: 'templates', label: 'Report Templates', icon: FileText },
            { id: 'generated', label: 'Generated Reports', icon: Download },
            { id: 'scheduled', label: 'Scheduled Reports', icon: Clock },
            { id: 'create', label: 'Create Custom', icon: Settings }
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-3 gap-6">
          {mockTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  template.modules.includes('Independence') ? 'bg-red-100' :
                  template.modules.includes('Data Quality') ? 'bg-blue-100' :
                  template.modules.includes('Entity') ? 'bg-green-100' :
                  template.modules.includes('Reconciliation') ? 'bg-purple-100' :
                  'bg-indigo-100'
                }`}>
                  <template.icon className={`w-6 h-6 ${
                    template.modules.includes('Independence') ? 'text-red-600' :
                    template.modules.includes('Data Quality') ? 'text-blue-600' :
                    template.modules.includes('Entity') ? 'text-green-600' :
                    template.modules.includes('Reconciliation') ? 'text-purple-600' :
                    'text-indigo-600'
                  }`} />
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getFrequencyColor(template.frequency)}`}>
                  {template.frequency}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.modules.map((mod, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {mod}
                  </span>
                ))}
              </div>

              {template.lastGenerated && (
                <p className="text-xs text-gray-500 mb-4">
                  Last generated: {new Date(template.lastGenerated).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowGenerateModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  Generate Now
                </button>
                <button className="px-3 py-2 border text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Reports Tab */}
      {activeTab === 'generated' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Report Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Generated</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">By</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Format</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockGeneratedReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${report.format === 'pdf' ? 'text-red-500' : 'text-green-500'}`} />
                      <span className="font-medium text-gray-900">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(report.generatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {report.generatedBy}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                      report.format === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {report.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {report.size}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status === 'generating' ? (
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Generating
                        </span>
                      ) : report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.status === 'completed' && (
                        <>
                          <button className="p-1 text-gray-400 hover:text-indigo-600">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-indigo-600">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Scheduled Reports</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Clock className="w-4 h-4" />
              New Schedule
            </button>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Report Template</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Next Run</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockScheduledReports.map(schedule => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {schedule.templateName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getFrequencyColor(schedule.frequency)}`}>
                        {schedule.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(schedule.nextRun).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {schedule.recipients.slice(0, 2).map((r, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {r}
                          </span>
                        ))}
                        {schedule.recipients.length > 2 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{schedule.recipients.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        schedule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-indigo-600">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Custom Report Tab */}
      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Create Custom Report</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                <input
                  type="text"
                  placeholder="e.g., Monthly Compliance Summary"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe the purpose and contents of this report..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Include Modules</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dashboard', label: 'Dashboard Summary', icon: Shield },
                    { id: 'data-quality', label: 'Data Quality', icon: Database },
                    { id: 'entity', label: 'Entity Structure', icon: Building2 },
                    { id: 'independence', label: 'Independence Check', icon: AlertTriangle },
                    { id: 'kpi', label: 'KPI Monitor', icon: TrendingUp },
                    { id: 'reconciliation', label: 'Reconciliation', icon: GitCompare }
                  ].map(mod => (
                    <label
                      key={mod.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <mod.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last quarter</option>
                    <option>Year to date</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>Both (PDF + Excel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Report Sections</label>
                <div className="space-y-2">
                  {[
                    'Executive Summary',
                    'Compliance Health Scorecard',
                    'Key Findings & Recommendations',
                    'Detailed Statistics',
                    'Charts & Visualizations',
                    'Appendix with Raw Data'
                  ].map((section, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" defaultChecked={i < 4} className="rounded text-indigo-600" />
                      <span className="text-sm text-gray-700">{section}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Schedule (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>One-time (now)</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients</label>
                    <input
                      type="text"
                      placeholder="email@company.com"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Generate Report
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Save as Template
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedTemplate.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  defaultValue={`${selectedTemplate.name} - ${new Date().toLocaleDateString()}`}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last quarter</option>
                  <option>Year to date</option>
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
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" className="text-indigo-600" />
                    <span className="text-sm">Both</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  // Would trigger generation
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
