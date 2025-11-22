
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  TrendingUp,
  Download,
  Plus,
  DollarSign,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PLTarget {
  id: string;
  year: number;
  targetRevenue: number;
  foodCostPercent: number;
  laborCostPercent: number;
  overheadPercent: number;
  targetProfit: number | null;
  notes: string | null;
  monthlyEntries: PLMonthlyEntry[];
}

interface PLMonthlyEntry {
  id: string;
  year: number;
  month: number;
  actualRevenue: number;
  actualFoodCost: number;
  actualLaborCost: number;
  actualOverhead: number;
  actualProfit: number;
  marketingCost: number;
  utilitiesCost: number;
  rentCost: number;
  otherExpenses: number;
  notes: string | null;
}

export function PLCreatorContent() {
  const [targets, setTargets] = useState<PLTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<PLTarget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');

  const currentYear = new Date().getFullYear();

  // Form states for target
  const [targetForm, setTargetForm] = useState({
    year: currentYear.toString(),
    targetRevenue: '',
    foodCostPercent: '',
    laborCostPercent: '',
    overheadPercent: '',
    targetProfit: '',
    notes: ''
  });

  // Form states for monthly entry
  const [monthlyForm, setMonthlyForm] = useState({
    month: '',
    year: currentYear.toString(),
    actualRevenue: '',
    actualFoodCost: '',
    actualLaborCost: '',
    actualOverhead: '',
    marketingCost: '0',
    utilitiesCost: '0',
    rentCost: '0',
    otherExpenses: '0',
    notes: ''
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await fetch('/api/pl-creator/targets');
      if (response.ok) {
        const data = await response.json();
        setTargets(data);
        if (data.length > 0 && !selectedTarget) {
          setSelectedTarget(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/pl-creator/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetForm)
      });

      if (response.ok) {
        toast.success('Target saved successfully!');
        await fetchTargets();
        setTargetForm({
          year: currentYear.toString(),
          targetRevenue: '',
          foodCostPercent: '',
          laborCostPercent: '',
          overheadPercent: '',
          targetProfit: '',
          notes: ''
        });
      } else {
        toast.error('Failed to save target');
      }
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthlySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTarget) {
      toast.error('Please create a target first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/pl-creator/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...monthlyForm,
          targetId: selectedTarget.id
        })
      });

      if (response.ok) {
        toast.success('Monthly data saved successfully!');
        await fetchTargets();
        setMonthlyForm({
          month: '',
          year: currentYear.toString(),
          actualRevenue: '',
          actualFoodCost: '',
          actualLaborCost: '',
          actualOverhead: '',
          marketingCost: '0',
          utilitiesCost: '0',
          rentCost: '0',
          otherExpenses: '0',
          notes: ''
        });
      } else {
        toast.error('Failed to save monthly data');
      }
    } catch (error) {
      console.error('Error saving monthly data:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target to export');
      return;
    }

    try {
      const response = await fetch(
        `/api/pl-creator/export?targetId=${selectedTarget.id}&format=csv`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `P&L_${selectedTarget.year}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('P&L exported successfully!');
      } else {
        toast.error('Failed to export P&L');
      }
    } catch (error) {
      console.error('Error exporting P&L:', error);
      toast.error('An error occurred during export');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Prepare chart data
  const chartData = selectedTarget?.monthlyEntries.map(entry => ({
    month: monthNames[entry.month - 1],
    revenue: entry.actualRevenue,
    foodCost: entry.actualFoodCost,
    laborCost: entry.actualLaborCost,
    overhead: entry.actualOverhead,
    profit: entry.actualProfit,
    targetRevenue: selectedTarget.targetRevenue
  })) || [];

  // Calculate year-over-year comparison if we have data from previous year
  const getYOYComparison = () => {
    if (!selectedTarget) return [];
    
    const currentYearData = selectedTarget.monthlyEntries.filter(
      e => e.year === selectedTarget.year
    );
    
    const previousYearTarget = targets.find(
      t => t.year === selectedTarget.year - 1
    );
    
    if (!previousYearTarget) return [];
    
    return monthNames.map((monthName, index) => {
      const currentMonth = currentYearData.find(e => e.month === index + 1);
      const previousMonth = previousYearTarget.monthlyEntries.find(
        e => e.month === index + 1
      );
      
      return {
        month: monthName,
        currentYear: currentMonth?.actualRevenue || 0,
        previousYear: previousMonth?.actualRevenue || 0,
      };
    });
  };

  const yoyData = getYOYComparison();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">P&L Spreadsheet Creator</h1>
          <p className="text-muted-foreground">
            Professional restaurant P&L with year-over-year tracking
          </p>
        </div>
        <div className="flex gap-2">
          {selectedTarget && (
            <>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Select
                value={selectedTarget.id}
                onValueChange={(value) => {
                  const target = targets.find(t => t.id === value);
                  setSelectedTarget(target || null);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targets.map(target => (
                    <SelectItem key={target.id} value={target.id}>
                      Fiscal Year {target.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">
            <Target className="w-4 h-4 mr-2" />
            Setup Targets
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Data
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="w-4 h-4 mr-2" />
            Year-over-Year
          </TabsTrigger>
        </TabsList>

        {/* Setup Targets Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Set Target Benchmarks</CardTitle>
              <CardDescription>
                Define your target revenue and cost percentages for the fiscal year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTargetSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Fiscal Year</Label>
                    <Select
                      value={targetForm.year}
                      onValueChange={(value) =>
                        setTargetForm({ ...targetForm, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3].map(offset => (
                          <SelectItem
                            key={offset}
                            value={(currentYear + offset).toString()}
                          >
                            {currentYear + offset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetRevenue">Monthly Target Revenue ($)</Label>
                    <Input
                      id="targetRevenue"
                      type="number"
                      step="0.01"
                      required
                      value={targetForm.targetRevenue}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, targetRevenue: e.target.value })
                      }
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foodCostPercent">Food Cost Target (%)</Label>
                    <Input
                      id="foodCostPercent"
                      type="number"
                      step="0.01"
                      required
                      value={targetForm.foodCostPercent}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, foodCostPercent: e.target.value })
                      }
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laborCostPercent">Labor Cost Target (%)</Label>
                    <Input
                      id="laborCostPercent"
                      type="number"
                      step="0.01"
                      required
                      value={targetForm.laborCostPercent}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, laborCostPercent: e.target.value })
                      }
                      placeholder="25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overheadPercent">Overhead Target (%)</Label>
                    <Input
                      id="overheadPercent"
                      type="number"
                      step="0.01"
                      required
                      value={targetForm.overheadPercent}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, overheadPercent: e.target.value })
                      }
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetProfit">Target Profit ($) (Optional)</Label>
                    <Input
                      id="targetProfit"
                      type="number"
                      step="0.01"
                      value={targetForm.targetProfit}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, targetProfit: e.target.value })
                      }
                      placeholder="12500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={targetForm.notes}
                    onChange={(e) =>
                      setTargetForm({ ...targetForm, notes: e.target.value })
                    }
                    placeholder="Additional notes or context..."
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Save Target Benchmarks
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Data Tab */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Enter Monthly Actuals</CardTitle>
              <CardDescription>
                Record your actual monthly revenue and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMonthlySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={monthlyForm.month}
                      onValueChange={(value) =>
                        setMonthlyForm({ ...monthlyForm, month: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((month, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthYear">Year</Label>
                    <Select
                      value={monthlyForm.year}
                      onValueChange={(value) =>
                        setMonthlyForm({ ...monthlyForm, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3].map(offset => (
                          <SelectItem
                            key={offset}
                            value={(currentYear + offset).toString()}
                          >
                            {currentYear + offset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualRevenue">Actual Revenue ($)</Label>
                    <Input
                      id="actualRevenue"
                      type="number"
                      step="0.01"
                      required
                      value={monthlyForm.actualRevenue}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, actualRevenue: e.target.value })
                      }
                      placeholder="52000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualFoodCost">Food Cost ($)</Label>
                    <Input
                      id="actualFoodCost"
                      type="number"
                      step="0.01"
                      required
                      value={monthlyForm.actualFoodCost}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, actualFoodCost: e.target.value })
                      }
                      placeholder="15600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualLaborCost">Labor Cost ($)</Label>
                    <Input
                      id="actualLaborCost"
                      type="number"
                      step="0.01"
                      required
                      value={monthlyForm.actualLaborCost}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, actualLaborCost: e.target.value })
                      }
                      placeholder="13000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualOverhead">Overhead ($)</Label>
                    <Input
                      id="actualOverhead"
                      type="number"
                      step="0.01"
                      required
                      value={monthlyForm.actualOverhead}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, actualOverhead: e.target.value })
                      }
                      placeholder="10400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketingCost">Marketing ($)</Label>
                    <Input
                      id="marketingCost"
                      type="number"
                      step="0.01"
                      value={monthlyForm.marketingCost}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, marketingCost: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilitiesCost">Utilities ($)</Label>
                    <Input
                      id="utilitiesCost"
                      type="number"
                      step="0.01"
                      value={monthlyForm.utilitiesCost}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, utilitiesCost: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rentCost">Rent ($)</Label>
                    <Input
                      id="rentCost"
                      type="number"
                      step="0.01"
                      value={monthlyForm.rentCost}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, rentCost: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherExpenses">Other Expenses ($)</Label>
                    <Input
                      id="otherExpenses"
                      type="number"
                      step="0.01"
                      value={monthlyForm.otherExpenses}
                      onChange={(e) =>
                        setMonthlyForm({ ...monthlyForm, otherExpenses: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyNotes">Notes</Label>
                  <Textarea
                    id="monthlyNotes"
                    value={monthlyForm.notes}
                    onChange={(e) =>
                      setMonthlyForm({ ...monthlyForm, notes: e.target.value })
                    }
                    placeholder="Special events, anomalies, etc..."
                  />
                </div>

                <Button type="submit" disabled={isLoading || !selectedTarget} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Save Monthly Data
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {selectedTarget && selectedTarget.monthlyEntries.length > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(
                          selectedTarget.monthlyEntries.reduce(
                            (sum, e) => sum + e.actualRevenue,
                            0
                          ) / selectedTarget.monthlyEntries.length
                        ).toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: ${selectedTarget.targetRevenue.toFixed(0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Food Cost</CardTitle>
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(
                          (selectedTarget.monthlyEntries.reduce(
                            (sum, e) => sum + (e.actualFoodCost / e.actualRevenue) * 100,
                            0
                          ) /
                            selectedTarget.monthlyEntries.length)
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: {selectedTarget.foodCostPercent}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Labor Cost</CardTitle>
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(
                          (selectedTarget.monthlyEntries.reduce(
                            (sum, e) => sum + (e.actualLaborCost / e.actualRevenue) * 100,
                            0
                          ) /
                            selectedTarget.monthlyEntries.length)
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: {selectedTarget.laborCostPercent}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${selectedTarget.monthlyEntries
                          .reduce((sum, e) => sum + e.actualProfit, 0)
                          .toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedTarget.monthlyEntries.length} months
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue & Profit Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Profit Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#82ca9d"
                          name="Profit"
                        />
                        <Line
                          type="monotone"
                          dataKey="targetRevenue"
                          stroke="#ff7300"
                          strokeDasharray="5 5"
                          name="Target Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cost Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="foodCost" fill="#8884d8" name="Food Cost" />
                        <Bar dataKey="laborCost" fill="#82ca9d" name="Labor Cost" />
                        <Bar dataKey="overhead" fill="#ffc658" name="Overhead" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Food Cost</TableHead>
                          <TableHead className="text-right">Labor Cost</TableHead>
                          <TableHead className="text-right">Overhead</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Profit %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTarget.monthlyEntries.map((entry) => {
                          const profitPercent = (
                            (entry.actualProfit / entry.actualRevenue) *
                            100
                          ).toFixed(1);
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>
                                {monthNames[entry.month - 1]} {entry.year}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.actualRevenue.toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.actualFoodCost.toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.actualLaborCost.toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.actualOverhead.toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.actualProfit.toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right">
                                {profitPercent}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileSpreadsheet className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No Data Yet</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Set up your targets and add monthly data to see your P&L overview
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Year-over-Year Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Revenue Comparison</CardTitle>
              <CardDescription>
                Compare current year performance against previous year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {yoyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yoyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="previousYear"
                      fill="#94a3b8"
                      name={`${selectedTarget?.year ? selectedTarget.year - 1 : ''}`}
                    />
                    <Bar
                      dataKey="currentYear"
                      fill="#3b82f6"
                      name={`${selectedTarget?.year || ''}`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No Comparison Data</p>
                  <p className="text-muted-foreground text-center">
                    Add data for multiple years to see year-over-year comparisons
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
