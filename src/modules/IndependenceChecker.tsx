import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  FileText,
  User,
  ArrowUpRight
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { conflictRules, independenceConflicts as initialConflicts, entities } from '../data/mockData';
import { IndependenceConflict } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export function IndependenceChecker() {
  const [conflicts, setConflicts] = useState<IndependenceConflict[]>(initialConflicts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedConflict, setSelectedConflict] = useState<IndependenceConflict | null>(null);
  const [showRunCheck, setShowRunCheck] = useState(false);
  const [checkEntity, setCheckEntity] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesSearch = conflict.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conflict.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || conflict.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || conflict.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'high';
      case 'Under Review': return 'medium';
      case 'Resolved': return 'success';
      case 'Escalated': return 'critical';
      default: return 'default';
    }
  };

  const severityData = [
    { name: 'Critical', value: conflicts.filter(c => c.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: conflicts.filter(c => c.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: conflicts.filter(c => c.severity === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: conflicts.filter(c => c.severity === 'low').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Open', value: conflicts.filter(c => c.status === 'Open').length, color: '#f97316' },
    { name: 'Under Review', value: conflicts.filter(c => c.status === 'Under Review').length, color: '#f59e0b' },
    { name: 'Escalated', value: conflicts.filter(c => c.status === 'Escalated').length, color: '#ef4444' },
    { name: 'Resolved', value: conflicts.filter(c => c.status === 'Resolved').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const handleRunCheck = () => {
    if (!checkEntity) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setShowRunCheck(false);
      setCheckEntity('');
    }, 2000);
  };

  const handleUpdateStatus = (conflictId: string, newStatus: IndependenceConflict['status']) => {
    setConflicts(conflicts.map(c => 
      c.id === conflictId ? { ...c, status: newStatus } : c
    ));
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Independence Checker</h1>
          <p className="text-gray-500 mt-1">Auditor independence conflict detection and management</p>
        </div>
      </div>

      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Conflicts</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{conflicts.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-100">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Critical</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {conflicts.filter(c => c.severity === 'critical').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Open</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    {conflicts.filter(c => c.status === 'Open').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Resolved</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    {conflicts.filter(c => c.status === 'Resolved').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">By Severity</h3>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">By Status</h3>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Conflict Rules */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Active Rules</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {conflictRules.map(rule => (
                  <div key={rule.id} className="p-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{rule.name}</span>
                      <Badge variant={getSeverityColor(rule.severity) as 'critical' | 'high' | 'medium' | 'low'}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{rule.category}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conflicts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
              <Button onClick={() => setShowRunCheck(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Run Independence Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conflicts List */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Active Conflicts</h3>
            <p className="text-sm text-slate-500 mt-1">{filteredConflicts.length} conflicts found</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredConflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getSeverityColor(conflict.severity) as 'critical' | 'high' | 'medium' | 'low'}>
                          {conflict.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(conflict.status) as 'critical' | 'high' | 'medium' | 'success'}>
                          {conflict.status}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(conflict.detectedAt, { addSuffix: true })}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 mt-2">{conflict.entityName}</h4>
                      <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {conflict.ruleName}
                        </span>
                        {conflict.assignedTo && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {conflict.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
              {filteredConflicts.length === 0 && (
                <div className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900">No conflicts found</p>
                  <p className="text-slate-500 mt-1">All independence checks passed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Check Modal */}
      <Modal
        isOpen={showRunCheck}
        onClose={() => setShowRunCheck(false)}
        title="Run Independence Check"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Select an entity to run a comprehensive independence check against all 7 conflict rules.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Entity</label>
            <select
              value={checkEntity}
              onChange={(e) => setCheckEntity(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
            >
              <option value="">Choose an entity...</option>
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Rules to be checked:</h4>
            <ul className="space-y-1">
              {conflictRules.map(rule => (
                <li key={rule.id} className="text-xs text-slate-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {rule.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRunCheck(false)}>Cancel</Button>
            <Button onClick={handleRunCheck} disabled={!checkEntity || isChecking}>
              {isChecking ? 'Checking...' : 'Run Check'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Conflict Detail Modal */}
      <Modal
        isOpen={!!selectedConflict}
        onClose={() => setSelectedConflict(null)}
        title="Conflict Details"
        size="lg"
      >
        {selectedConflict && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(selectedConflict.severity) as 'critical' | 'high' | 'medium' | 'low'}>
                    {selectedConflict.severity.toUpperCase()}
                  </Badge>
                  <Badge variant={getStatusColor(selectedConflict.status) as 'critical' | 'high' | 'medium' | 'success'}>
                    {selectedConflict.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">{selectedConflict.entityName}</h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600">{selectedConflict.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Rule Violated</label>
                <p className="text-sm text-slate-900 mt-1">{selectedConflict.ruleName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Detected</label>
                <p className="text-sm text-slate-900 mt-1">
                  {format(selectedConflict.detectedAt, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Assigned To</label>
                <p className="text-sm text-slate-900 mt-1">{selectedConflict.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Conflict ID</label>
                <p className="text-sm text-slate-900 mt-1 font-mono">{selectedConflict.id}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="text-xs font-medium text-slate-500 uppercase">Update Status</label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedConflict.id, 'Under Review')}
                >
                  Mark Under Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedConflict.id, 'Escalated')}
                >
                  Escalate
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedConflict.id, 'Resolved')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={() => setSelectedConflict(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
