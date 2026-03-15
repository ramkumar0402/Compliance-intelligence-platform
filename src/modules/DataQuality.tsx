import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  Download,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { ColumnProfile, DataQualityIssue } from '../types';
import { cn } from '../utils/cn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ParsedData {
  headers: string[];
  rows: Record<string, string | null>[];
}

export function DataQuality() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>([]);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [scores, setScores] = useState({ completeness: 0, uniqueness: 0, consistency: 0, accuracy: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      parseCSV(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setUploadedFile(file);
      parseCSV(file);
    }
  }, []);

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string | null> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || null;
        });
        return row;
      });
      setParsedData({ headers, rows });
    };
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (!parsedData) return;
    
    setIsAnalyzing(true);
    setActiveTab('profile');

    setTimeout(() => {
      const { headers, rows } = parsedData;
      const newIssues: DataQualityIssue[] = [];
      let issueId = 1;

      const profiles: ColumnProfile[] = headers.map(header => {
        const values = rows.map(r => r[header]);
        const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
        const missingCount = values.length - nonNull.length;
        const missingPercent = (missingCount / values.length) * 100;

        let type: ColumnProfile['type'] = 'string';
        const numericValues = nonNull.filter(v => !isNaN(Number(v)));
        const dateValues = nonNull.filter(v => {
          const str = String(v);
          return /^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{2}\/\d{2}\/\d{4}/.test(str);
        });

        if (numericValues.length > nonNull.length * 0.8) {
          type = 'number';
        } else if (dateValues.length > nonNull.length * 0.8) {
          type = 'date';
        }

        let stats;
        if (type === 'number') {
          const nums = numericValues.map(v => Number(v)).sort((a, b) => a - b);
          const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
          const median = nums[Math.floor(nums.length / 2)];
          const std = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length);
          stats = {
            mean,
            median,
            std,
            min: nums[0],
            max: nums[nums.length - 1],
            q1: nums[Math.floor(nums.length * 0.25)],
            q3: nums[Math.floor(nums.length * 0.75)],
          };

          const iqr = stats.q3 - stats.q1;
          const lowerBound = stats.q1 - 1.5 * iqr;
          const upperBound = stats.q3 + 1.5 * iqr;
          rows.forEach((row, idx) => {
            const val = Number(row[header]);
            if (!isNaN(val) && (val < lowerBound || val > upperBound)) {
              newIssues.push({
                id: `issue-${issueId++}`,
                row: idx + 2,
                column: header,
                issueType: 'Outlier',
                severity: val < lowerBound - iqr || val > upperBound + iqr ? 'high' : 'medium',
                currentValue: String(val),
                expectedValue: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`,
                recommendation: 'Review value - outside expected range',
              });
            }
          });
        }

        const valueCounts: Record<string, number> = {};
        nonNull.forEach(v => {
          const key = String(v);
          valueCounts[key] = (valueCounts[key] || 0) + 1;
        });
        const topValues = type === 'string' ? 
          Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }))
          : undefined;

        if (missingCount > 0) {
          rows.forEach((row, idx) => {
            if (row[header] === null || row[header] === undefined || row[header] === '') {
              newIssues.push({
                id: `issue-${issueId++}`,
                row: idx + 2,
                column: header,
                issueType: 'Missing',
                severity: missingPercent > 20 ? 'critical' : missingPercent > 10 ? 'high' : 'medium',
                currentValue: 'NULL',
                recommendation: type === 'number' ? 'Impute with mean/median' : 'Impute with mode or flag',
              });
            }
          });
        }

        if (type === 'date') {
          const formats = new Set(nonNull.map(v => {
            const str = String(v);
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'YYYY-MM-DD';
            if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) return 'DD/MM/YYYY';
            return 'other';
          }));
          if (formats.size > 1) {
            rows.forEach((row, idx) => {
              const val = String(row[header] || '');
              if (!/^\d{4}-\d{2}-\d{2}/.test(val) && val) {
                newIssues.push({
                  id: `issue-${issueId++}`,
                  row: idx + 2,
                  column: header,
                  issueType: 'Format',
                  severity: 'medium',
                  currentValue: val,
                  expectedValue: 'YYYY-MM-DD',
                  recommendation: 'Standardize date format',
                });
              }
            });
          }
        }

        let riskLevel: ColumnProfile['riskLevel'] = 'CLEAN';
        if (missingPercent > 20) riskLevel = 'CRITICAL';
        else if (missingPercent > 10) riskLevel = 'HIGH';
        else if (missingPercent > 5) riskLevel = 'MEDIUM';
        else if (missingPercent > 1) riskLevel = 'LOW';

        return {
          name: header,
          type,
          uniqueCount: new Set(nonNull.map(v => String(v).toLowerCase())).size,
          missingCount,
          missingPercent,
          riskLevel,
          stats,
          topValues,
        };
      });

      const rowStrings = rows.map(r => headers.map(h => String(r[h] || '')).join('|'));
      const duplicates = rowStrings.filter((r, i) => rowStrings.indexOf(r) !== i);
      setDuplicateCount(duplicates.length);

      if (duplicates.length > 0) {
        const seen = new Set<string>();
        rows.forEach((row, idx) => {
          const key = headers.map(h => String(row[h] || '')).join('|');
          if (seen.has(key)) {
            newIssues.push({
              id: `issue-${issueId++}`,
              row: idx + 2,
              column: 'ALL',
              issueType: 'Duplicate',
              severity: 'high',
              currentValue: 'Duplicate row',
              recommendation: 'Remove duplicate entry',
            });
          }
          seen.add(key);
        });
      }

      const totalCells = rows.length * headers.length;
      const missingCells = newIssues.filter(i => i.issueType === 'Missing').length;
      const duplicateRows = duplicates.length;
      const formatIssues = newIssues.filter(i => i.issueType === 'Format').length;
      const outliers = newIssues.filter(i => i.issueType === 'Outlier').length;

      const completeness = Math.max(0, 100 - (missingCells / totalCells) * 100);
      const uniqueness = Math.max(0, 100 - (duplicateRows / rows.length) * 100);
      const consistency = Math.max(0, 100 - (formatIssues / totalCells) * 200);
      const accuracy = Math.max(0, 100 - (outliers / totalCells) * 300);

      const overall = (completeness * 0.3 + uniqueness * 0.25 + consistency * 0.25 + accuracy * 0.2);

      setColumnProfiles(profiles);
      setIssues(newIssues);
      setScores({ completeness, uniqueness, consistency, accuracy });
      setOverallScore(overall);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 1500);
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score: number): 'success' | 'medium' | 'critical' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'medium';
    return 'critical';
  };

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'profile', label: 'Data Profile' },
    { id: 'issues', label: `Issues${issues.length > 0 ? ` (${issues.length})` : ''}` },
    { id: 'scorecard', label: 'Scorecard' },
  ];

  const scoreChartData = [
    { name: 'Completeness', score: scores.completeness, weight: 30 },
    { name: 'Uniqueness', score: scores.uniqueness, weight: 25 },
    { name: 'Consistency', score: scores.consistency, weight: 25 },
    { name: 'Accuracy', score: scores.accuracy, weight: 20 },
  ];

  const issueTypeData = issues.reduce((acc: { name: string; value: number }[], issue) => {
    const existing = acc.find(a => a.name === issue.issueType);
    if (existing) existing.value++;
    else acc.push({ name: issue.issueType, value: 1 });
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Quality Audit</h1>
          <p className="text-gray-500 mt-1">Validate, profile, and score datasets for compliance workflows</p>
        </div>
      </div>

      <div>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Upload Dataset</h3>
                <p className="text-sm text-slate-500 mt-1">Drag and drop or click to upload CSV/Excel files</p>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-700">Drop your file here</p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                    <p className="text-xs text-slate-400 mt-4">Supports CSV and Excel files up to 50MB</p>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                        <div>
                          <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • 
                            {parsedData ? ` ${parsedData.rows.length} rows, ${parsedData.headers.length} columns` : ' Parsing...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setUploadedFile(null);
                          setParsedData(null);
                          setAnalysisComplete(false);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {parsedData && (
                  <Button 
                    className="mt-6 w-full" 
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Quality Analysis'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {analysisComplete && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Summary</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                          <circle
                            cx="80" cy="80" r="70" fill="none"
                            stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="12"
                            strokeDasharray={`${(overallScore / 100) * 440} 440`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-slate-900">{overallScore.toFixed(0)}</span>
                          <span className="text-lg font-medium text-slate-500">Grade {getGrade(overallScore)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-900">{parsedData?.rows.length || 0}</p>
                        <p className="text-sm text-slate-500">Total Rows</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-900">{parsedData?.headers.length || 0}</p>
                        <p className="text-sm text-slate-500">Columns</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{issues.length}</p>
                        <p className="text-sm text-slate-500">Issues Found</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">{duplicateCount}</p>
                        <p className="text-sm text-slate-500">Duplicates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {columnProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Missing Value Analysis</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {columnProfiles.map((col) => (
                          <div key={col.name} className="flex items-center gap-4">
                            <span className="w-32 text-sm font-medium text-slate-700 truncate">{col.name}</span>
                            <div className="flex-1">
                              <Progress
                                value={100 - col.missingPercent}
                                color={
                                  col.riskLevel === 'CLEAN' || col.riskLevel === 'LOW' ? 'success' :
                                  col.riskLevel === 'MEDIUM' ? 'warning' : 'danger'
                                }
                              />
                            </div>
                            <Badge
                              variant={
                                col.riskLevel === 'CLEAN' ? 'success' :
                                col.riskLevel === 'LOW' ? 'info' :
                                col.riskLevel === 'MEDIUM' ? 'medium' :
                                col.riskLevel === 'HIGH' ? 'high' : 'critical'
                              }
                            >
                              {col.riskLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Column Types</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-2 font-medium text-slate-600">Column</th>
                              <th className="text-left py-2 font-medium text-slate-600">Type</th>
                              <th className="text-right py-2 font-medium text-slate-600">Unique</th>
                              <th className="text-right py-2 font-medium text-slate-600">Missing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {columnProfiles.map((col) => (
                              <tr key={col.name} className="border-b border-slate-100">
                                <td className="py-2 font-medium text-slate-900">{col.name}</td>
                                <td className="py-2"><Badge variant="default">{col.type}</Badge></td>
                                <td className="py-2 text-right text-slate-600">{col.uniqueCount}</td>
                                <td className="py-2 text-right">
                                  <span className={cn(
                                    col.missingPercent > 10 ? 'text-red-600' :
                                    col.missingPercent > 5 ? 'text-amber-600' : 'text-slate-600'
                                  )}>
                                    {col.missingPercent.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Statistical Summary</h3>
                    <p className="text-sm text-slate-500">For numeric columns</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 font-medium text-slate-600">Column</th>
                            <th className="text-right py-2 font-medium text-slate-600">Min</th>
                            <th className="text-right py-2 font-medium text-slate-600">Max</th>
                            <th className="text-right py-2 font-medium text-slate-600">Mean</th>
                            <th className="text-right py-2 font-medium text-slate-600">Median</th>
                            <th className="text-right py-2 font-medium text-slate-600">Std Dev</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columnProfiles.filter(c => c.stats).map((col) => (
                            <tr key={col.name} className="border-b border-slate-100">
                              <td className="py-2 font-medium text-slate-900">{col.name}</td>
                              <td className="py-2 text-right text-slate-600">{col.stats?.min?.toFixed(2)}</td>
                              <td className="py-2 text-right text-slate-600">{col.stats?.max?.toFixed(2)}</td>
                              <td className="py-2 text-right text-slate-600">{col.stats?.mean?.toFixed(2)}</td>
                              <td className="py-2 text-right text-slate-600">{col.stats?.median?.toFixed(2)}</td>
                              <td className="py-2 text-right text-slate-600">{col.stats?.std?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Upload and analyze a dataset to view the profile</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            {issues.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Issues by Type</h3>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={issueTypeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Severity Breakdown</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                          const count = issues.filter(i => i.severity === severity).length;
                          const percent = issues.length > 0 ? (count / issues.length) * 100 : 0;
                          return (
                            <div key={severity} className="flex items-center gap-3">
                              <Badge variant={severity}>{severity.toUpperCase()}</Badge>
                              <div className="flex-1">
                                <Progress
                                  value={percent}
                                  color={severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'default'}
                                  size="sm"
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-600 w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Issue Details</h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Row</th>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Column</th>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Type</th>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Severity</th>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Value</th>
                            <th className="text-left px-6 py-3 font-medium text-slate-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {issues.slice(0, 50).map((issue) => (
                            <tr key={issue.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 text-slate-900">{issue.row}</td>
                              <td className="px-6 py-3 font-medium text-slate-900">{issue.column}</td>
                              <td className="px-6 py-3"><Badge variant="default">{issue.issueType}</Badge></td>
                              <td className="px-6 py-3"><Badge variant={issue.severity}>{issue.severity.toUpperCase()}</Badge></td>
                              <td className="px-6 py-3 text-slate-600 font-mono text-xs">{issue.currentValue}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs">{issue.recommendation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900">No issues detected</p>
                  <p className="text-slate-500 mt-1">Your dataset passed all quality checks</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'scorecard' && (
          <div className="space-y-6">
            {analysisComplete ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Overall Score</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="85" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                            <circle
                              cx="96" cy="96" r="85" fill="none"
                              stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="16"
                              strokeDasharray={`${(overallScore / 100) * 534} 534`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold text-slate-900">{overallScore.toFixed(0)}</span>
                            <span className="text-xl font-medium text-slate-500">/ 100</span>
                          </div>
                        </div>
                        <Badge variant={getGradeColor(overallScore)} className="text-lg px-4 py-1 mt-4">
                          Grade {getGrade(overallScore)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Quality Dimensions</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scoreChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {scoreChartData.map((dim) => (
                          <div key={dim.name} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700">{dim.name}</span>
                              <span className="text-sm text-slate-500">Weight: {dim.weight}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-slate-900">{dim.score.toFixed(1)}</span>
                              <Progress 
                                value={dim.score} 
                                className="flex-1"
                                color={dim.score >= 80 ? 'success' : dim.score >= 60 ? 'warning' : 'danger'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Generate PDF Report
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Complete the analysis to view the scorecard</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Data Preview" size="xl">
        {parsedData && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
                  {parsedData.headers.map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                    {parsedData.headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-slate-900">{String(row[h] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
