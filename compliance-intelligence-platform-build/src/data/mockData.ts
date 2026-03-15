import { 
  User, Alert, ComplianceMetrics, Entity, ConflictRule, 
  IndependenceConflict, DataQualityResult, KPIMetric, 
  ReconciliationItem, ActivityEvent, AuditLogEntry 
} from '../types';

// Current User
export const currentUser: User = {
  id: 'user-001',
  name: 'Sarah Chen',
  email: 'sarah.chen@clearanceiq.com',
  role: 'Analyst',
};

// Compliance Metrics
export const complianceMetrics: ComplianceMetrics = {
  overallScore: 87,
  previousScore: 82,
  totalEntities: 1247,
  previousEntities: 1198,
  activeConflicts: 23,
  previousConflicts: 31,
  openReconciliations: 156,
  previousReconciliations: 189,
  dataQualityScore: 91,
  previousDataQuality: 88,
  kpiAnomalies: 7,
  previousAnomalies: 12,
  historicalScores: [78, 81, 79, 84, 82, 87],
};

// Alerts
export const alerts: Alert[] = [
  {
    id: 'alert-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    module: 'Independence',
    severity: 'critical',
    entityName: 'Apex Global Holdings Ltd',
    description: 'Direct financial interest detected in audit client portfolio',
    reviewed: false,
  },
  {
    id: 'alert-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    module: 'KPI Monitor',
    severity: 'high',
    entityName: 'TechCorp Industries',
    description: 'Revenue recognition ratio exceeded 3σ threshold',
    reviewed: false,
  },
  {
    id: 'alert-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    module: 'Reconciliation',
    severity: 'high',
    entityName: 'Sterling Financial Services',
    description: 'Material variance ($2.4M) in intercompany elimination',
    reviewed: false,
  },
  {
    id: 'alert-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    module: 'Data Quality',
    severity: 'medium',
    entityName: 'Global Ventures Inc',
    description: 'Dataset completeness score dropped below 80%',
    reviewed: true,
  },
  {
    id: 'alert-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    module: 'Entity Mapper',
    severity: 'medium',
    entityName: 'Meridian Partners LLP',
    description: 'New subsidiary relationship detected requiring validation',
    reviewed: false,
  },
  {
    id: 'alert-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    module: 'Independence',
    severity: 'high',
    entityName: 'Pinnacle Investments Group',
    description: 'Employment relationship conflict with key audit personnel',
    reviewed: true,
  },
  {
    id: 'alert-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    module: 'KPI Monitor',
    severity: 'medium',
    entityName: 'Cascade Manufacturing Co',
    description: 'Working capital ratio showing unusual trend pattern',
    reviewed: false,
  },
  {
    id: 'alert-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    module: 'Reports',
    severity: 'info',
    entityName: 'System',
    description: 'Monthly compliance report generation completed successfully',
    reviewed: true,
  },
  {
    id: 'alert-009',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    module: 'Reconciliation',
    severity: 'medium',
    entityName: 'Atlas Corporation',
    description: '47 items pending reconciliation review',
    reviewed: false,
  },
  {
    id: 'alert-010',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    module: 'Data Quality',
    severity: 'info',
    entityName: 'Nordic Enterprises',
    description: 'Data quality audit completed - Grade A achieved',
    reviewed: true,
  },
];

// Entities
export const entities: Entity[] = [
  {
    id: 'ent-001',
    name: 'Apex Global Holdings Ltd',
    type: 'Corporation',
    status: 'Active',
    registrationNumber: 'U67120MH2019PLC123456',
    jurisdiction: 'India',
    createdAt: new Date('2019-03-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'ent-002',
    name: 'Apex Tech Solutions Pvt Ltd',
    type: 'Subsidiary',
    status: 'Active',
    registrationNumber: 'U72900KA2020PTC234567',
    jurisdiction: 'India',
    parentId: 'ent-001',
    createdAt: new Date('2020-06-22'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'ent-003',
    name: 'Sterling Financial Services',
    type: 'Corporation',
    status: 'Active',
    registrationNumber: 'U65990DL2015PLC345678',
    jurisdiction: 'India',
    createdAt: new Date('2015-08-10'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'ent-004',
    name: 'Global Ventures Inc',
    type: 'Corporation',
    status: 'Under Review',
    registrationNumber: 'U74999TN2018PLC456789',
    jurisdiction: 'India',
    createdAt: new Date('2018-11-05'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'ent-005',
    name: 'Meridian Partners LLP',
    type: 'LLP',
    status: 'Active',
    registrationNumber: 'AAA-1234',
    jurisdiction: 'India',
    createdAt: new Date('2017-04-20'),
    updatedAt: new Date('2024-01-09'),
  },
];

// Conflict Rules
export const conflictRules: ConflictRule[] = [
  {
    id: 'rule-001',
    name: 'Direct Financial Interest',
    description: 'Auditor or immediate family holds direct investment in audit client',
    severity: 'critical',
    category: 'Financial',
  },
  {
    id: 'rule-002',
    name: 'Material Indirect Financial Interest',
    description: 'Significant indirect investment through mutual funds or trusts',
    severity: 'high',
    category: 'Financial',
  },
  {
    id: 'rule-003',
    name: 'Business Relationship',
    description: 'Close business relationship with audit client or its management',
    severity: 'high',
    category: 'Business',
  },
  {
    id: 'rule-004',
    name: 'Employment Relationship',
    description: 'Former or prospective employment with audit client',
    severity: 'critical',
    category: 'Employment',
  },
  {
    id: 'rule-005',
    name: 'Family Relationship',
    description: 'Immediate family member in key position at audit client',
    severity: 'critical',
    category: 'Personal',
  },
  {
    id: 'rule-006',
    name: 'Non-Audit Services',
    description: 'Prohibited non-audit services provided to audit client',
    severity: 'high',
    category: 'Business',
  },
  {
    id: 'rule-007',
    name: 'Fee Dependency',
    description: 'Total fees from client exceed independence threshold',
    severity: 'medium',
    category: 'Financial',
  },
];

// Independence Conflicts
export const independenceConflicts: IndependenceConflict[] = [
  {
    id: 'conflict-001',
    entityId: 'ent-001',
    entityName: 'Apex Global Holdings Ltd',
    ruleId: 'rule-001',
    ruleName: 'Direct Financial Interest',
    severity: 'critical',
    description: 'Senior Manager holds 500 shares in client company acquired through ESOP',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'Open',
    assignedTo: 'John Smith',
  },
  {
    id: 'conflict-002',
    entityId: 'ent-003',
    entityName: 'Sterling Financial Services',
    ruleId: 'rule-004',
    ruleName: 'Employment Relationship',
    severity: 'critical',
    description: 'Audit partner spouse accepted CFO position at client',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'Escalated',
    assignedTo: 'Mary Johnson',
  },
  {
    id: 'conflict-003',
    entityId: 'ent-002',
    entityName: 'Apex Tech Solutions Pvt Ltd',
    ruleId: 'rule-006',
    ruleName: 'Non-Audit Services',
    severity: 'high',
    description: 'IT implementation services provided exceeded permitted scope',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'Under Review',
    assignedTo: 'Sarah Chen',
  },
];

// KPI Metrics
export const kpiMetrics: KPIMetric[] = [
  {
    id: 'kpi-001',
    name: 'Revenue Recognition Ratio',
    category: 'Financial',
    currentValue: 1.23,
    previousValue: 1.15,
    target: 1.0,
    threshold: { warning: 1.15, critical: 1.25 },
    trend: [1.02, 1.05, 1.08, 1.12, 1.15, 1.23],
    unit: 'ratio',
    isAnomaly: true,
    anomalyType: 'spike',
  },
  {
    id: 'kpi-002',
    name: 'Working Capital Ratio',
    category: 'Liquidity',
    currentValue: 1.45,
    previousValue: 1.52,
    target: 1.5,
    threshold: { warning: 1.3, critical: 1.2 },
    trend: [1.55, 1.53, 1.50, 1.48, 1.52, 1.45],
    unit: 'ratio',
    isAnomaly: false,
  },
  {
    id: 'kpi-003',
    name: 'Days Sales Outstanding',
    category: 'Efficiency',
    currentValue: 67,
    previousValue: 58,
    target: 45,
    threshold: { warning: 55, critical: 70 },
    trend: [42, 45, 48, 52, 58, 67],
    unit: 'days',
    isAnomaly: true,
    anomalyType: 'trend_break',
  },
  {
    id: 'kpi-004',
    name: 'Gross Margin',
    category: 'Profitability',
    currentValue: 34.2,
    previousValue: 35.8,
    target: 35.0,
    threshold: { warning: 32, critical: 28 },
    trend: [36.1, 35.9, 35.5, 35.2, 35.8, 34.2],
    unit: '%',
    isAnomaly: false,
  },
  {
    id: 'kpi-005',
    name: 'Debt to Equity',
    category: 'Leverage',
    currentValue: 0.85,
    previousValue: 0.72,
    target: 0.6,
    threshold: { warning: 0.8, critical: 1.0 },
    trend: [0.58, 0.62, 0.65, 0.68, 0.72, 0.85],
    unit: 'ratio',
    isAnomaly: true,
    anomalyType: 'spike',
  },
];

// Reconciliation Items
export const reconciliationItems: ReconciliationItem[] = [
  {
    id: 'recon-001',
    sourceA: 'General Ledger',
    sourceB: 'Bank Statement',
    entityName: 'Apex Global Holdings Ltd',
    fieldName: 'Cash Balance',
    valueA: 15234567.89,
    valueB: 15234567.89,
    difference: 0,
    status: 'Matched',
    category: 'Cash',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'recon-002',
    sourceA: 'Sub-ledger',
    sourceB: 'Consolidation',
    entityName: 'Sterling Financial Services',
    fieldName: 'Intercompany Payables',
    valueA: 8456789.23,
    valueB: 6012345.67,
    difference: 2444443.56,
    status: 'Unmatched',
    category: 'Intercompany',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'recon-003',
    sourceA: 'Trial Balance',
    sourceB: 'Financial Statements',
    entityName: 'Global Ventures Inc',
    fieldName: 'Total Revenue',
    valueA: 125678901.45,
    valueB: 125678890.12,
    difference: 11.33,
    status: 'Partial',
    category: 'Revenue',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'recon-004',
    sourceA: 'Inventory System',
    sourceB: 'General Ledger',
    entityName: 'Apex Tech Solutions Pvt Ltd',
    fieldName: 'Inventory Value',
    valueA: 4567890.12,
    valueB: 4523456.78,
    difference: 44433.34,
    status: 'Pending Review',
    category: 'Inventory',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 120),
  },
];

// Activity Events (last 30 days)
export const activityEvents: ActivityEvent[] = Array.from({ length: 50 }, (_, i) => {
  const types: ActivityEvent['type'][] = ['audit', 'conflict', 'reconciliation', 'report'];
  const type = types[Math.floor(Math.random() * types.length)];
  const modules = {
    audit: 'Data Quality',
    conflict: 'Independence',
    reconciliation: 'Reconciliation',
    report: 'Reports',
  };
  const descriptions = {
    audit: ['Data quality audit completed', 'Dataset uploaded for review', 'Quality score updated'],
    conflict: ['Independence conflict detected', 'Conflict resolution submitted', 'Escalation raised'],
    reconciliation: ['Reconciliation completed', 'Variance identified', 'Items matched'],
    report: ['Report generated', 'Report exported', 'Compliance summary created'],
  };
  const users = ['Sarah Chen', 'John Smith', 'Mary Johnson', 'David Lee', 'Emma Wilson'];
  
  return {
    id: `activity-${i + 1}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    type,
    module: modules[type],
    description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    user: users[Math.floor(Math.random() * users.length)],
  };
}).sort((a, b) => b.date.getTime() - a.date.getTime());

// Sample Dataset for Data Quality Module
export const sampleDataset = [
  { id: 1, company: 'Acme Corp', revenue: 1500000, employees: 250, country: 'USA', date: '2024-01-15' },
  { id: 2, company: 'TechStart Inc', revenue: 890000, employees: 85, country: 'USA', date: '2024-01-15' },
  { id: 3, company: 'Global Solutions', revenue: null, employees: 450, country: 'UK', date: '2024-01-14' },
  { id: 4, company: 'Apex Holdings', revenue: 2340000, employees: null, country: 'India', date: '2024-01-14' },
  { id: 5, company: 'Nordic Systems', revenue: 678000, employees: 120, country: 'Sweden', date: '2024-01-13' },
  { id: 6, company: 'Pacific Ventures', revenue: 1890000, employees: 310, country: 'Australia', date: '15/01/2024' },
  { id: 7, company: 'Acme Corp', revenue: 1500000, employees: 250, country: 'USA', date: '2024-01-15' }, // duplicate
  { id: 8, company: 'Summit Group', revenue: 45000000, employees: 180, country: 'Canada', date: '2024-01-12' }, // outlier
  { id: 9, company: 'Eastern Partners', revenue: 920000, employees: 95, country: 'japan', date: '2024-01-11' }, // case issue
  { id: 10, company: 'Metro Industries ', revenue: 1120000, employees: 200, country: 'Germany', date: '2024-01-10' }, // trailing space
];

// Audit Log
export const auditLog: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: 'Sarah Chen',
    action: 'Dataset Upload',
    module: 'Data Quality',
    details: 'Uploaded financial_data_q4.csv for quality audit',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: 'John Smith',
    action: 'Conflict Resolution',
    module: 'Independence',
    details: 'Marked conflict-005 as resolved with safeguards applied',
    beforeValue: 'Open',
    afterValue: 'Resolved',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: 'Mary Johnson',
    action: 'Report Generation',
    module: 'Reports',
    details: 'Generated monthly compliance report for January 2024',
  },
];

// Data Quality Results
export const dataQualityResults: DataQualityResult[] = [
  {
    id: 'dq-001',
    datasetName: 'financial_data_q4.csv',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    rowCount: 1547,
    columnCount: 12,
    overallScore: 91,
    grade: 'A',
    completenessScore: 94,
    uniquenessScore: 98,
    consistencyScore: 87,
    accuracyScore: 85,
    issues: [],
  },
  {
    id: 'dq-002',
    datasetName: 'vendor_master.xlsx',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    rowCount: 892,
    columnCount: 8,
    overallScore: 78,
    grade: 'C',
    completenessScore: 72,
    uniquenessScore: 85,
    consistencyScore: 80,
    accuracyScore: 76,
    issues: [],
  },
  {
    id: 'dq-003',
    datasetName: 'employee_directory.csv',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    rowCount: 2341,
    columnCount: 15,
    overallScore: 95,
    grade: 'A',
    completenessScore: 98,
    uniquenessScore: 100,
    consistencyScore: 92,
    accuracyScore: 90,
    issues: [],
  },
];
