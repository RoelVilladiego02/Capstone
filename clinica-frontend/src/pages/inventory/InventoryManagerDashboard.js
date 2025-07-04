import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InventoryManagerDashboard = () => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data for inventory items
  const lowStockItems = [
    { id: 1, name: 'Surgical Masks', quantity: 50, threshold: 100, category: 'PPE', status: 'Critical' },
    { id: 2, name: 'Gloves', quantity: 25, threshold: 50, category: 'PPE', status: 'Low' },
    { id: 3, name: 'Syringes', quantity: 30, threshold: 75, category: 'Medical Supplies', status: 'Critical' }
  ];

  // Mock data for pending orders
  const pendingOrders = [
    { id: 1, item: 'Surgical Masks', quantity: 500, orderDate: '2024-02-15', status: 'Processing' },
    { id: 2, item: 'Gloves', quantity: 1000, orderDate: '2024-02-14', status: 'Shipped' }
  ];

  // Usage trends data for chart
  const usageTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Item Usage',
      data: [150, 230, 180, 290, 200, 250],
      borderColor: '#E31937',
      backgroundColor: 'rgba(227, 25, 55, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          borderDash: [2, 4]
        }
      }
    }
  };

  const handleQuickOrder = (item) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">Inventory Dashboard</h2>
            <div>
              <button className="btn btn-outline-secondary rounded-pill me-2">
                <i className="bi bi-download me-2"></i>Export
              </button>
              <button className="btn rounded-pill" style={{ backgroundColor: '#E31937', color: 'white' }}>
                <i className="bi bi-plus-lg me-2"></i>New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100 overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-bold text-uppercase">Total Items</p>
                  <h3 className="mb-0 fw-bold">1,245</h3>
                  <p className="text-success mb-0 small mt-2">
                    <i className="bi bi-arrow-up me-1"></i>3.5% from last month
                  </p>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-box-seam" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100 overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-bold text-uppercase">Low Stock Alerts</p>
                  <h3 className="mb-0 fw-bold">{lowStockItems.length}</h3>
                  <p className="text-danger mb-0 small mt-2">
                    <i className="bi bi-arrow-up me-1"></i>2 new alerts today
                  </p>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100 overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-bold text-uppercase">Pending Orders</p>
                  <h3 className="mb-0 fw-bold">{pendingOrders.length}</h3>
                  <p className="text-primary mb-0 small mt-2">
                    <i className="bi bi-clock me-1"></i>1 arriving today
                  </p>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-clock-history" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100 overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-bold text-uppercase">Categories</p>
                  <h3 className="mb-0 fw-bold">8</h3>
                  <p className="text-muted mb-0 small mt-2">
                    <i className="bi bi-check-circle me-1"></i>All categories active
                  </p>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-grid" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Low Stock Alerts */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Low Stock Alerts</h5>
                <Link to="/inventory" className="btn btn-sm rounded-pill px-3" style={{ backgroundColor: '#E31937', color: 'white' }}>
                  <i className="bi bi-box me-1"></i> Manage Inventory
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td className="ps-4 fw-medium">{item.name}</td>
                        <td>
                          <span className="badge rounded-pill bg-light text-dark border">
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px', width: '100px' }}>
                              <div 
                                className={`progress-bar ${item.status === 'Critical' ? 'bg-danger' : 'bg-warning'}`}
                                style={{ width: `${(item.quantity / item.threshold) * 100}%` }}
                              ></div>
                            </div>
                            <span className="badge bg-light text-dark border">{item.quantity}/{item.threshold}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${
                            item.status === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {item.status === 'Critical' ? 
                              <><i className="bi bi-exclamation-circle me-1"></i> {item.status}</> : 
                              <>{item.status}</>
                            }
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm rounded-pill px-3" 
                            style={{ backgroundColor: '#E31937', color: 'white' }}
                            onClick={() => handleQuickOrder(item)}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Quick Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Pending Orders</h5>
                <Link to="/orders" className="btn btn-sm btn-link text-decoration-none">
                  View All <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="card-body px-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="card border-0 shadow-sm mb-3">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">{order.item}</h6>
                      <span className={`badge rounded-pill ${
                        order.status === 'Processing' ? 'bg-warning text-dark' : 'bg-info'
                      }`}>
                        {order.status === 'Processing' ? 
                          <><i className="bi bi-gear me-1"></i> {order.status}</> : 
                          <><i className="bi bi-truck me-1"></i> {order.status}</>
                        }
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">
                        <i className="bi bi-calendar me-1"></i> {order.orderDate}
                      </span>
                      <span className="fw-medium small">
                        <i className="bi bi-box me-1"></i> {order.quantity} units
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-primary w-100 rounded-pill mt-2">
                <i className="bi bi-plus me-1"></i> Place New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Usage Trends</h5>
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-sm btn-outline-secondary active">Monthly</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Quarterly</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Yearly</button>
                </div>
              </div>
            </div>
            <div className="card-body px-2">
              <div style={{ height: '350px' }}>
                <Line data={usageTrendsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Quick Order - {selectedItem?.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Order Quantity</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-box"></i></span>
                      <input type="number" className="form-control border-0 shadow-sm py-2" defaultValue={selectedItem?.threshold} />
                    </div>
                    <div className="form-text">
                      Minimum recommended: {selectedItem?.threshold}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Priority</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-flag"></i></span>
                      <select className="form-select border-0 shadow-sm py-2">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Expected Delivery Date</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-calendar"></i></span>
                      <input type="date" className="form-control border-0 shadow-sm py-2" 
                        min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn rounded-pill px-4" style={{ backgroundColor: '#E31937', color: 'white' }}>
                  <i className="bi bi-check2 me-1"></i> Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagerDashboard;