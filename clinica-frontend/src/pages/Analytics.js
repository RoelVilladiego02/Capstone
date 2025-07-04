import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
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
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ activeTab: initialTab = 'summary' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dateRange, setDateRange] = useState('monthly');
  const [chartView, setChartView] = useState('default');

  // Color palette for consistent branding
  const colors = {
    primary: '#0B5ED7',
    secondary: '#6C757D',
    success: '#198754',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#0DCAF0',
    light: '#F8F9FA',
    dark: '#212529',
    chartColors: [
      '#0B5ED7', '#DC3545', '#198754', '#FFC107', 
      '#0DCAF0', '#6C757D', '#6610F2', '#D63384'
    ]
  };

  // Patient Demographics Data
  const ageDistributionData = {
    labels: ['0-17', '18-30', '31-45', '46-60', '61-75', '75+'],
    datasets: [
      {
        label: 'Patients by Age',
        data: [48, 112, 167, 129, 83, 37],
        backgroundColor: colors.chartColors,
        borderWidth: 1
      }
    ]
  };

  const genderDistributionData = {
    labels: ['Female', 'Male', 'Non-binary', 'Other'],
    datasets: [
      {
        data: [321, 289, 23, 7],
        backgroundColor: [colors.chartColors[1], colors.chartColors[0], colors.chartColors[2], colors.chartColors[3]],
        borderWidth: 1
      }
    ]
  };

  const visitFrequencyData = {
    labels: ['First visit', '2-3 visits', '4-6 visits', '7-10 visits', '10+ visits'],
    datasets: [
      {
        label: 'Number of Patients',
        data: [182, 205, 136, 68, 49],
        backgroundColor: colors.chartColors[0],
        borderColor: colors.chartColors[0],
        borderWidth: 1
      }
    ]
  };

  // Visit Trends Data
  const visitTrendsData = {
    labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
    datasets: [{
      label: 'Average Visits',
      data: [5, 15, 24, 28, 12, 10, 22, 26, 18, 7],
      borderColor: colors.chartColors[1],
      backgroundColor: `${colors.chartColors[1]}33`,
      tension: 0.4,
      fill: true
    }]
  };

  const visitsByDayData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [{
      label: 'Average Visits',
      data: [42, 38, 35, 43, 36, 22],
      backgroundColor: colors.chartColors.slice(0, 6),
      borderWidth: 1
    }]
  };

  const visitTypeData = {
    labels: ['Check-up', 'Consultation', 'Follow-up', 'Procedure', 'Emergency', 'Other'],
    datasets: [{
      label: 'Visit Types',
      data: [126, 95, 138, 67, 23, 41],
      backgroundColor: `${colors.chartColors[2]}88`,
      borderColor: colors.chartColors[2],
      borderWidth: 2,
      hoverBackgroundColor: colors.chartColors[2]
    }]
  };

  // Doctor Performance Data
  const doctorPerformanceData = {
    labels: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Lee', 'Dr. Davis'],
    datasets: [
      {
        label: 'Patient Satisfaction (out of 5)',
        data: [4.8, 4.6, 4.9, 4.7, 4.5, 4.8],
        backgroundColor: colors.chartColors[2],
        yAxisID: 'y'
      },
      {
        label: 'Cases Handled',
        data: [120, 95, 150, 85, 105, 75],
        backgroundColor: colors.chartColors[3],
        yAxisID: 'y1'
      }
    ]
  };

  const doctorEfficiencyData = {
    labels: ['Appointment Punctuality', 'Documentation Timeliness', 'Patient Communication', 'Treatment Success Rate', 'Follow-up Consistency', 'Peer Collaboration'],
    datasets: [
      {
        label: 'Dr. Smith',
        data: [90, 85, 95, 87, 80, 92],
        backgroundColor: `${colors.chartColors[0]}66`,
        borderColor: colors.chartColors[0],
        pointBackgroundColor: colors.chartColors[0],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.chartColors[0]
      },
      {
        label: 'Dr. Johnson',
        data: [82, 92, 89, 84, 95, 88],
        backgroundColor: `${colors.chartColors[1]}66`,
        borderColor: colors.chartColors[1],
        pointBackgroundColor: colors.chartColors[1],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.chartColors[1]
      }
    ]
  };

  // Summary data for KPI cards
  const summaryData = {
    totalPatients: 640,
    newPatients: 47,
    avgVisitsPerDay: 38,
    avgSatisfaction: 4.7,
    waitTime: '14 min',
    topDiagnosis: 'Hypertension'
  };

  // Options for charts
  const doctorPerformanceOptions = {
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Satisfaction Rating'
        },
        min: 3,
        max: 5
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Cases Handled'
        },
        grid: {
          drawOnChartArea: false
        },
        min: 0
      }
    }
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold">Medical Analytics Dashboard</h3>
          <p className="text-muted">Comprehensive clinic performance insights</p>
        </div>
        <div className="d-flex gap-2">
          <select 
            className="form-select me-2" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="quarterly">Last Quarter</option>
            <option value="yearly">Last Year</option>
          </select>
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button 
              className={`btn ${activeTab === 'patients' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('patients')}
            >
              Patients
            </button>
            <button 
              className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('visits')}
            >
              Visits
            </button>
            <button 
              className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('doctors')}
            >
              Doctors
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'summary' && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Patients</h6>
                  <h3 className="mb-0 fw-bold">{summaryData.totalPatients}</h3>
                  <span className="badge bg-success text-white">+3.2%</span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">New Patients</h6>
                  <h3 className="mb-0 fw-bold">{summaryData.newPatients}</h3>
                  <span className="badge bg-success text-white">+5.7%</span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Avg. Daily Visits</h6>
                  <h3 className="mb-0 fw-bold">{summaryData.avgVisitsPerDay}</h3>
                  <span className="badge bg-danger text-white">-1.8%</span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Satisfaction</h6>
                  <h3 className="mb-0 fw-bold">{summaryData.avgSatisfaction}</h3>
                  <span className="badge bg-success text-white">+0.2</span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Avg. Wait Time</h6>
                  <h3 className="mb-0 fw-bold">{summaryData.waitTime}</h3>
                  <span className="badge bg-success text-white">-2 min</span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Top Diagnosis</h6>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: '1.2rem' }}>{summaryData.topDiagnosis}</h3>
                  <span className="badge bg-secondary text-white">23% of visits</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="card-title">Visit Trends</h5>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary active">Daily</button>
                      <button className="btn btn-outline-secondary">Weekly</button>
                      <button className="btn btn-outline-secondary">Monthly</button>
                    </div>
                  </div>
                  <Line data={visitTrendsData} />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Age Distribution</h5>
                  <Doughnut 
                    data={ageDistributionData}
                    options={{
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'patients' && (
        <>
          <div className="mb-3 d-flex justify-content-end">
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${chartView === 'default' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setChartView('default')}
              >
                Default View
              </button>
              <button 
                className={`btn btn-sm ${chartView === 'detailed' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setChartView('detailed')}
              >
                Detailed View
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Age Distribution</h5>
                  <p className="text-muted">Patient breakdown by age group</p>
                  {chartView === 'default' ? (
                    <Doughnut 
                      data={ageDistributionData}
                      options={{
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  ) : (
                    <Bar data={ageDistributionData} />
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Gender Distribution</h5>
                  <p className="text-muted">Patient breakdown by gender</p>
                  {chartView === 'default' ? (
                    <PolarArea data={genderDistributionData} />
                  ) : (
                    <Doughnut 
                      data={genderDistributionData}
                      options={{
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Visit Frequency</h5>
                  <p className="text-muted">How often patients return to the clinic</p>
                  <Bar data={visitFrequencyData} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'visits' && (
        <div className="row g-3">
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <h5 className="card-title">Visit Trends by Hour</h5>
                    <p className="text-muted">Peak hours analysis</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary active">Hourly</button>
                    <button className="btn btn-outline-secondary">Daily</button>
                  </div>
                </div>
                <Line 
                  data={visitTrendsData} 
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          footer: (tooltipItems) => {
                            return 'Peak Activity: High';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Visits by Day</h5>
                <p className="text-muted">Weekly distribution pattern</p>
                <Bar data={visitsByDayData} />
              </div>
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Visit Types</h5>
                <p className="text-muted">Distribution of appointment purposes</p>
                <Bar data={visitTypeData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="row g-3">
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Doctor Performance Metrics</h5>
                <p className="text-muted">Satisfaction ratings and case volume</p>
                <Bar 
                  data={doctorPerformanceData} 
                  options={doctorPerformanceOptions}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Doctor Efficiency Comparison</h5>
                <p className="text-muted">Multiple performance dimensions</p>
                <Radar 
                  data={doctorEfficiencyData}
                  options={radarOptions}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Top Performing Doctors</h5>
                <p className="text-muted">Based on patient satisfaction</p>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialty</th>
                      <th>Satisfaction</th>
                      <th>Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Dr. Williams</td>
                      <td>Cardiology</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: '98%' }}></div>
                          </div>
                          <span className="ms-2">4.9</span>
                        </div>
                      </td>
                      <td>150</td>
                    </tr>
                    <tr>
                      <td>Dr. Smith</td>
                      <td>General Medicine</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: '96%' }}></div>
                          </div>
                          <span className="ms-2">4.8</span>
                        </div>
                      </td>
                      <td>120</td>
                    </tr>
                    <tr>
                      <td>Dr. Davis</td>
                      <td>Pediatrics</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: '96%' }}></div>
                          </div>
                          <span className="ms-2">4.8</span>
                        </div>
                      </td>
                      <td>75</td>
                    </tr>
                    <tr>
                      <td>Dr. Brown</td>
                      <td>Dermatology</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: '94%' }}></div>
                          </div>
                          <span className="ms-2">4.7</span>
                        </div>
                      </td>
                      <td>85</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;