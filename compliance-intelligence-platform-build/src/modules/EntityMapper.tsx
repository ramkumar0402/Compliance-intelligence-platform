import { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  GitBranch, 
  ExternalLink,
  Edit,
  Trash2,
  ChevronRight,
  Globe
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { entities as initialEntities } from '../data/mockData';
import { Entity } from '../types';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

export function EntityMapper() {
  const [entities] = useState<Entity[]>(initialEntities);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || entity.type === filterType;
    const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Entity['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'medium';
      case 'Under Review': return 'high';
      default: return 'default';
    }
  };

  const getTypeColor = (type: Entity['type']) => {
    switch (type) {
      case 'Corporation': return 'bg-indigo-100 text-indigo-700';
      case 'Subsidiary': return 'bg-purple-100 text-purple-700';
      case 'LLP': return 'bg-emerald-100 text-emerald-700';
      case 'Partnership': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const entityTypes = ['Corporation', 'Partnership', 'LLP', 'Subsidiary', 'Associate', 'Joint Venture'];
  const entityStatuses = ['Active', 'Inactive', 'Under Review'];

  const getChildEntities = (parentId: string) => {
    return entities.filter(e => e.parentId === parentId);
  };

  const entityStats = {
    total: entities.length,
    active: entities.filter(e => e.status === 'Active').length,
    subsidiaries: entities.filter(e => e.type === 'Subsidiary').length,
    underReview: entities.filter(e => e.status === 'Under Review').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entity Mapper</h1>
          <p className="text-gray-500 mt-1">Corporate structure and relationship management</p>
        </div>
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-100">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{entityStats.total}</p>
                  <p className="text-sm text-slate-500">Total Entities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{entityStats.active}</p>
                  <p className="text-sm text-slate-500">Active Entities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <GitBranch className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{entityStats.subsidiaries}</p>
                  <p className="text-sm text-slate-500">Subsidiaries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{entityStats.underReview}</p>
                  <p className="text-sm text-slate-500">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search entities by name or registration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                {entityStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entity List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Entity Registry</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredEntities.length} entities found
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredEntities.map((entity) => {
                    const children = getChildEntities(entity.id);
                    const parent = entity.parentId ? entities.find(e => e.id === entity.parentId) : null;
                    
                    return (
                      <div
                        key={entity.id}
                        className={cn(
                          'p-4 hover:bg-slate-50 cursor-pointer transition-colors',
                          selectedEntity?.id === entity.id && 'bg-indigo-50'
                        )}
                        onClick={() => setSelectedEntity(entity)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn('p-2 rounded-lg', getTypeColor(entity.type))}>
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{entity.name}</h4>
                              <p className="text-sm text-slate-500 mt-0.5">
                                {entity.registrationNumber}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getStatusColor(entity.status)}>
                                  {entity.status}
                                </Badge>
                                <span className={cn('text-xs px-2 py-0.5 rounded-full', getTypeColor(entity.type))}>
                                  {entity.type}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {entity.jurisdiction}
                                </span>
                              </div>
                              {parent && (
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  Subsidiary of {parent.name}
                                </p>
                              )}
                              {children.length > 0 && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  {children.length} subsidiaries
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entity Detail Panel */}
          <div>
            {selectedEntity ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">Entity Details</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center pb-6 border-b border-slate-100">
                      <div className={cn('w-16 h-16 rounded-xl mx-auto flex items-center justify-center', getTypeColor(selectedEntity.type))}>
                        <Building2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900 mt-4">{selectedEntity.name}</h4>
                      <Badge variant={getStatusColor(selectedEntity.status)} className="mt-2">
                        {selectedEntity.status}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Registration Number
                        </label>
                        <p className="text-sm text-slate-900 mt-1 font-mono">
                          {selectedEntity.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Entity Type
                        </label>
                        <p className="text-sm text-slate-900 mt-1">{selectedEntity.type}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Jurisdiction
                        </label>
                        <p className="text-sm text-slate-900 mt-1">{selectedEntity.jurisdiction}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Created
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          {format(selectedEntity.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Last Updated
                        </label>
                        <p className="text-sm text-slate-900 mt-1">
                          {format(selectedEntity.updatedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Related Entities */}
                    {getChildEntities(selectedEntity.id).length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Subsidiaries
                        </label>
                        <div className="mt-2 space-y-2">
                          {getChildEntities(selectedEntity.id).map(child => (
                            <div
                              key={child.id}
                              className="p-2 bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100"
                              onClick={() => setSelectedEntity(child)}
                            >
                              <span className="text-sm text-slate-700">{child.name}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in MCA Portal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Select an entity to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Entity Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Entity"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Entity Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter entity name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {entityStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., U67120MH2019PLC123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., India"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parent Entity (Optional)</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">None</option>
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add Entity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
