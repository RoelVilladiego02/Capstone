import React, { useState, useMemo, useCallback } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Constants for filtering options
const services = [
  { id: 'all', name: 'All Services' },
  { id: 'consultation', name: 'Consultations' },
  { id: 'teleconsultation', name: 'Teleconsultation' },
  { id: 'lab-tests', name: 'Laboratory Tests' },
  { id: 'procedures', name: 'Medical Procedures' },
  { id: 'pharmacy', name: 'Pharmacy' }
];

const departments = [
  { id: 'all', name: 'All Departments' },
  { id: 'general', name: 'General Medicine' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'ob-gyn', name: 'OB-GYN' },
  { id: 'laboratory', name: 'Laboratory' }
];

// Sample data organized by department and service
const sampleData = {
  'general': {
    'consultation': {
      base: 150000, 
      monthly: [150000, 180000, 160000, 190000, 170000, 180000],
      growth: '+8.3%'
    },
    'teleconsultation': {
      base: 50000, 
      monthly: [50000, 60000, 55000, 65000, 58000, 62000],
      growth: '+5.2%'
    },
    'lab-tests': {
      base: 80000, 
      monthly: [80000, 90000, 85000, 95000, 88000, 92000],
      growth: '+7.1%'
    },
    'procedures': {
      base: 70000, 
      monthly: [70000, 75000, 72000, 78000, 74000, 76000],
      growth: '+4.3%'
    },
    'pharmacy': {
      base: 100000, 
      monthly: [100000, 110000, 105000, 115000, 108000, 112000],
      growth: '+6.7%'
    }
  },
  'pediatrics': {
    'consultation': {
      base: 100000, 
      monthly: [100000, 120000, 110000, 130000, 115000, 125000],
      growth: '+9.1%'
    },
    'teleconsultation': {
      base: 30000, 
      monthly: [30000, 35000, 32000, 38000, 34000, 36000],
      growth: '+6.8%'
    },
    'procedures': {
      base: 40000, 
      monthly: [40000, 45000, 42000, 48000, 44000, 46000],
      growth: '+5.5%'
    },
    'pharmacy': {
      base: 60000, 
      monthly: [60000, 65000, 62000, 68000, 64000, 66000],
      growth: '+4.9%'
    }
  },
  'ob-gyn': {
    'consultation': {
      base: 120000, 
      monthly: [120000, 130000, 125000, 135000, 128000, 132000],
      growth: '+7.5%'
    },
    'teleconsultation': {
      base: 40000, 
      monthly: [40000, 45000, 42000, 48000, 44000, 46000],
      growth: '+6.2%'
    },
    'procedures': {
      base: 90000, 
      monthly: [90000, 100000, 95000, 105000, 98000, 102000],
      growth: '+8.4%'
    }
  },
  'laboratory': {
    'lab-tests': {
      base: 160000, 
      monthly: [160000, 180000, 170000, 190000, 175000, 185000],
      growth: '+9.8%'
    },
    'procedures': {
      base: 110000, 
      monthly: [110000, 120000, 115000, 125000, 118000, 122000],
      growth: '+7.3%'
    }
  }
};

// Generate date labels based on selected range
function getDateLabels(range) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  switch (range) {
    case 'weekly':
      return [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
    case 'monthly':
      return [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }).filter((_, i) => i % 3 === 0); // Show every 3rd day for readability
      
    case 'quarterly':
      const quarterMonths = [];
      const startMonth = Math.floor(currentMonth / 3) * 3;
      for (let i = 0; i < 3; i++) {
        quarterMonths.push(new Date(currentYear, startMonth + i, 1).toLocaleDateString('en-US', { month: 'short' }));
      }
      return quarterMonths;
      
    case 'yearly':
      return [...Array(12)].map((_, i) => {
        return new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
      });
      
    default:
      return [...Array(6)].map((_, i) => {
        return new Date(currentYear, currentMonth - 5 + i, 1).toLocaleDateString('en-US', { month: 'short' });
      });
  }
}

const RevenueAnalysis = () => {
  // State for filters and controls
  const [dateRange, setDateRange] = useState('monthly');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [viewType, setViewType] = useState('revenue');
  const [chartType, setChartType] = useState('bar');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Generate appropriate data points based on date range
  const generateDataPoints = useCallback((baseValue, range) => {
    const variance = () => 0.85 + (Math.random() * 0.3); // Random variance between 85% and 115%
    
    switch (range) {
      case 'weekly':
        return [...Array(7)].map(() => Math.round(baseValue * variance()));
      case 'monthly':
        return [...Array(10)].map(() => Math.round(baseValue * variance()));
      case 'quarterly':
        return [...Array(3)].map(() => Math.round(baseValue * variance()));
      case 'yearly':
        return [...Array(12)].map(() => Math.round(baseValue * variance()));
      default:
        return [...Array(6)].map(() => Math.round(baseValue * variance()));
    }
  }, []);

  // Process and filter data based on selected filters
  const processedData = useMemo(() => {
    // Helper function to aggregate data
    const aggregateData = (dept, svc) => {
      // Case 1: All departments, all services
      if (dept === 'all' && svc === 'all') {
        let totalBase = 0;
        const depts = Object.keys(sampleData);
        
        depts.forEach(department => {
          const services = Object.keys(sampleData[department]);
          services.forEach(service => {
            totalBase += sampleData[department][service].base;
          });
        });
        
        return {
          revenue: generateDataPoints(totalBase, dateRange),
          expenses: generateDataPoints(totalBase * 0.7, dateRange), // Expenses typically 70% of revenue
          growth: '+7.8%'
        };
      }
      
      // Case 2: Specific department, all services
      else if (dept !== 'all' && svc === 'all') {
        if (!sampleData[dept]) return { revenue: [], expenses: [], growth: '0%' };
        
        let departmentBase = 0;
        const services = Object.keys(sampleData[dept]);
        
        services.forEach(service => {
          departmentBase += sampleData[dept][service].base;
        });
        
        return {
          revenue: generateDataPoints(departmentBase, dateRange),
          expenses: generateDataPoints(departmentBase * 0.7, dateRange),
          growth: '+6.9%'
        };
      }
      
      // Case 3: All departments, specific service
      else if (dept === 'all' && svc !== 'all') {
        let serviceBase = 0;
        const depts = Object.keys(sampleData);
        
        depts.forEach(department => {
          if (sampleData[department][svc]) {
            serviceBase += sampleData[department][svc].base;
          }
        });
        
        return {
          revenue: generateDataPoints(serviceBase, dateRange),
          expenses: generateDataPoints(serviceBase * 0.7, dateRange),
          growth: '+8.2%'
        };
      }
      
      // Case 4: Specific department, specific service
      else {
        if (!sampleData[dept] || !sampleData[dept][svc]) {
          return { revenue: [], expenses: [], growth: '0%' };
        }
        
        const specificBase = sampleData[dept][svc].base;
        
        return {
          revenue: generateDataPoints(specificBase, dateRange),
          expenses: generateDataPoints(specificBase * 0.7, dateRange),
          growth: sampleData[dept][svc].growth
        };
      }
    };

    // Get data based on current filters
    const data = aggregateData(departmentFilter, serviceFilter);
    
    // Calculate summaries
    const totalRevenue = data.revenue.reduce((sum, val) => sum + val, 0);
    const avgDailyRevenue = Math.round(totalRevenue / data.revenue.length);
    const totalExpenses = data.expenses.reduce((sum, val) => sum + val, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Format for currency display
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0
      }).format(value);
    };

    return {
      chartData: {
        labels: getDateLabels(dateRange),
        datasets: [
          {
            label: 'Revenue',
            data: data.revenue,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: '#36A2EB',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Expenses',
            data: data.expenses,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: '#FF6384',
            borderWidth: 2,
            yAxisID: 'y'
          },
          ...(viewType === 'profit' ? [{
            label: 'Profit',
            data: data.revenue.map((rev, i) => rev - data.expenses[i]),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: '#4BC0C0',
            borderWidth: 2,
            yAxisID: 'y',
            type: 'line',
            order: 0
          }] : [])
        ]
      },
      summaries: {
        totalRevenue: formatCurrency(totalRevenue),
        avgDailyRevenue: formatCurrency(avgDailyRevenue),
        totalExpenses: formatCurrency(totalExpenses),
        netProfit: formatCurrency(netProfit),
        growth: data.growth
      }
    };
  }, [departmentFilter, serviceFilter, dateRange, viewType, generateDataPoints]);

  // Chart configuration options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (PHP)'
        },
        ticks: {
          callback: (value) => {
            if (value >= 1000000) return `₱${value / 1000000}M`;
            if (value >= 1000) return `₱${value / 1000}K`;
            return `₱${value}`;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.raw;
            return label + new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    setShowCustomRange(value === 'custom');
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Revenue Analysis</h4>
          <p className="text-muted mb-0">Track and analyze financial performance</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-download me-2"></i>Export Report
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bi bi-gear me-2"></i>Settings
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Date Range</label>
              <select 
                className="form-select"
                value={dateRange}
                onChange={handleDateRangeChange}
              >
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="quarterly">Current Quarter</option>
                <option value="yearly">Current Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {showCustomRange && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button className="btn btn-primary w-100">Apply Range</button>
                </div>
              </>
            )}
            
            {!showCustomRange && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <select 
                    className="form-select"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Service Type</label>
                  <select 
                    className="form-select"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                  >
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">View Type</label>
                  <div className="btn-group w-100">
                    <button 
                      className={`btn btn-${viewType === 'revenue' ? 'primary' : 'outline-primary'}`}
                      onClick={() => setViewType('revenue')}
                    >
                      Revenue & Expenses
                    </button>
                    <button 
                      className={`btn btn-${viewType === 'profit' ? 'primary' : 'outline-primary'}`}
                      onClick={() => setViewType('profit')}
                    >
                      With Profit
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Revenue</h6>
              <h3 className="mb-1">{processedData.summaries.totalRevenue}</h3>
              <div className="d-flex align-items-center">
                <span className="badge bg-success me-2">{processedData.summaries.growth}</span>
                <small className="text-muted">vs previous period</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Average Daily Revenue</h6>
              <h3 className="mb-1">{processedData.summaries.avgDailyRevenue}</h3>
              <div className="d-flex align-items-center">
                <span className="badge bg-success me-2">+5.2%</span>
                <small className="text-muted">vs previous period</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Expenses</h6>
              <h3 className="mb-1">{processedData.summaries.totalExpenses}</h3>
              <div className="d-flex align-items-center">
                <span className="badge bg-danger me-2">+12.1%</span>
                <small className="text-muted">vs previous period</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Net Profit</h6>
              <h3 className="mb-1">{processedData.summaries.netProfit}</h3>
              <div className="d-flex align-items-center">
                <span className="badge bg-success me-2">+3.7%</span>
                <small className="text-muted">vs previous period</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              {viewType === 'revenue' 
                ? 'Revenue & Expense Trends' 
                : 'Revenue, Expense & Profit Trends'}
            </h5>
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${chartType === 'bar' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setChartType('bar')}
              >
                <i className="bi bi-bar-chart me-1"></i>Bar
              </button>
              <button 
                className={`btn btn-sm ${chartType === 'line' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setChartType('line')}
              >
                <i className="bi bi-graph-up me-1"></i>Line
              </button>
            </div>
          </div>
          <div style={{ height: '400px' }}>
            {chartType === 'bar' ? (
              <Bar 
                data={processedData.chartData}
                options={chartOptions}
              />
            ) : (
              <Line 
                data={processedData.chartData}
                options={chartOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Service Breakdown Section */}
      {(departmentFilter !== 'all' || serviceFilter !== 'all') && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="card-title mb-4">
              {departmentFilter !== 'all' && serviceFilter === 'all' 
                ? `${departments.find(d => d.id === departmentFilter).name} Services Breakdown` 
                : serviceFilter !== 'all' && departmentFilter === 'all'
                  ? `${services.find(s => s.id === serviceFilter).name} by Department`
                  : `${services.find(s => s.id === serviceFilter).name} in ${departments.find(d => d.id === departmentFilter).name}`}
            </h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                    <th>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Generate some dummy breakdown data */}
                  {[...Array(5)].map((_, i) => {
                    const revenue = Math.round(80000 + Math.random() * 60000);
                    const expenses = Math.round(revenue * 0.7);
                    const profit = revenue - expenses;
                    const growth = (Math.random() * 10).toFixed(1);
                    
                    return (
                      <tr key={i}>
                        <td>{`Category ${i+1}`}</td>
                        <td>₱{revenue.toLocaleString()}</td>
                        <td>₱{expenses.toLocaleString()}</td>
                        <td>₱{profit.toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${growth > 5 ? 'success' : 'warning'}`}>
                            +{growth}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalysis;