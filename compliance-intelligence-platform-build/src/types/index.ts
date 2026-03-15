// Core Types for ClearanceIQ Platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Reviewer' | 'Auditor';
  avatar?: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  module: 'Data Quality' | 'Entity Mapper' | 'Independence' | 'KPI Monitor' | 'Reconciliation' | 'Reports';
  severity: 'critical' | 'high' | 'medium' | 'info';
  entityName: string;
  description: string;
  reviewed: boolean;
}

export interface ComplianceMetrics {
  overallScore: number;
  previousScore: number;
  totalEntities: number;
  previousEntities: number;
  activeConflicts: number;
  previousConflicts: number;
  openReconciliations: number;
  previousReconciliations: number;
  dataQualityScore: number;
  previousDataQuality: number;
  kpiAnomalies: number;
  previousAnomalies: number;
  historicalScores: number[];
}

export interface Entity {
  id: string;
  name: string;
  type: 'Corporation' | 'Partnership' | 'LLP' | 'Subsidiary' | 'Associate' | 'Joint Venture';
  status: 'Active' | 'Inactive' | 'Under Review';
  registrationNumber: string;
  jurisdiction: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConflictRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'Financial' | 'Business' | 'Personal' | 'Employment';
}

export interface IndependenceConflict {
  id: string;
  entityId: string;
  entityName: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Escalated';
  assignedTo?: string;
}

export interface DataQualityResult {
  id: string;
  datasetName: string;
  uploadedAt: Date;
  rowCount: number;
  columnCount: number;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  completenessScore: number;
  uniquenessScore: number;
  consistencyScore: number;
  accuracyScore: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  id: string;
  row: number;
  column: string;
  issueType: 'Missing' | 'Duplicate' | 'Outlier' | 'Format' | 'Type Mismatch' | 'Inconsistent';
  severity: 'critical' | 'high' | 'medium' | 'low';
  currentValue: string;
  expectedValue?: string;
  recommendation: string;
}

export interface ColumnProfile {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'mixed';
  uniqueCount: number;
  missingCount: number;
  missingPercent: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN';
  stats?: {
    mean?: number;
    median?: number;
    std?: number;
    min?: number;
    max?: number;
    q1?: number;
    q3?: number;
  };
  topValues?: { value: string; count: number }[];
}

export interface KPIMetric {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  previousValue: number;
  target: number;
  threshold: { warning: number; critical: number };
  trend: number[];
  unit: string;
  isAnomaly: boolean;
  anomalyType?: 'spike' | 'drop' | 'trend_break' | 'outlier';
}

export interface ReconciliationItem {
  id: string;
  sourceA: string;
  sourceB: string;
  entityName: string;
  fieldName: string;
  valueA: number | string;
  valueB: number | string;
  difference: number | string;
  status: 'Matched' | 'Unmatched' | 'Partial' | 'Pending Review';
  category: string;
  lastUpdated: Date;
}

export interface ActivityEvent {
  id: string;
  date: Date;
  type: 'audit' | 'conflict' | 'reconciliation' | 'report';
  module: string;
  description: string;
  user: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
}
