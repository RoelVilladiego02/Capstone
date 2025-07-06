import React, { useState, useEffect } from 'react';
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
import { inventoryService } from '../../services/inventoryService';
import { orderService } from '../../services/orderService';
import { supplierService } from '../../services/supplierService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Utility: Convert array of objects to CSV
function arrayToCSV(data, columns) {
  const header = columns.map(col => `"${col.label}"`).join(',');
  const rows = data.map(row => columns.map(col => `"${row[col.key] ?? ''}"`).join(','));
  return [header, ...rows].join('\r\n');
}

// Utility: Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const InventoryManagerDashboard = () => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for real data
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [usageTrends, setUsageTrends] = useState({ labels: [], data: [] });

  // Quick Order form state
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderPriority, setOrderPriority] = useState('High');
  const [orderExpectedDelivery, setOrderExpectedDelivery] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [trendsPeriod, setTrendsPeriod] = useState('monthly');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);

  // New Order modal state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [newOrderSuppliers, setNewOrderSuppliers] = useState([]);
  const [newOrderItemId, setNewOrderItemId] = useState('');
  const [newOrderSupplierId, setNewOrderSupplierId] = useState('');
  const [newOrderQuantity, setNewOrderQuantity] = useState('');
  const [newOrderPriority, setNewOrderPriority] = useState('High');
  const [newOrderExpectedDelivery, setNewOrderExpectedDelivery] = useState('');
  const [newOrderLoading, setNewOrderLoading] = useState(false);
  const [newOrderError, setNewOrderError] = useState(null);
  const [newOrderSuccess, setNewOrderSuccess] = useState(false);

  // Fetch dashboard data (only on mount)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch data in parallel (excluding usage trends)
        const [lowStockData, pendingOrdersData, analyticsData] = await Promise.all([
          inventoryService.getLowStockItems(),
          orderService.getPendingOrders(),
          inventoryService.getAnalytics()
        ]);
        setLowStockItems(lowStockData);
        setPendingOrders(pendingOrdersData);
        setAnalytics(analyticsData);
      } catch (err) {
        let errorMsg = 'Failed to load dashboard data';
        if (err && err.message) errorMsg += `: ${err.message}`;
        if (err && err.stack) console.error('Error stack:', err.stack);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []); // Only run on mount

  // Fetch usage trends when period changes
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setTrendsLoading(true);
        setTrendsError(null);
        const trendsData = await inventoryService.getUsageTrends(trendsPeriod);
        setUsageTrends(trendsData);
      } catch (err) {
        setTrendsError(err.message || 'Failed to load usage trends');
      } finally {
        setTrendsLoading(false);
      }
    };
    fetchTrends();
  }, [trendsPeriod]);

  // Usage trends data for chart
  const usageTrendsData = {
    labels: usageTrends.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Item Usage',
      data: usageTrends.data || [150, 230, 180, 290, 200, 250],
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
    setOrderQuantity(item?.threshold || '');
    setOrderPriority('High');
    setOrderExpectedDelivery('');
    setOrderError(null);
    setOrderSuccess(false);
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedItem) return;
    setOrderLoading(true);
    setOrderError(null);
    setOrderSuccess(false);
    try {
      // Validate
      if (!orderQuantity || orderQuantity <= 0) throw new Error('Quantity must be greater than 0');
      if (!orderExpectedDelivery) throw new Error('Expected delivery date is required');
      // Compose payload
      const payload = {
        inventory_item_id: selectedItem.id,
        quantity: Number(orderQuantity),
        order_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        priority: orderPriority,
        expected_delivery: orderExpectedDelivery,
        supplier_id: selectedItem.supplier_id || selectedItem.supplier?.id
      };
      await orderService.createOrder(payload);
      setOrderSuccess(true);
      setTimeout(() => {
        setShowOrderModal(false);
        setOrderSuccess(false);
        // Refresh dashboard data
        window.location.reload(); // or call fetchDashboardData() if available
      }, 1200);
    } catch (err) {
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  // Open New Order modal and fetch data
  const handleOpenNewOrder = async () => {
    console.log('Opening New Order modal...');
    setShowNewOrderModal(true);
    setNewOrderError(null);
    setNewOrderSuccess(false);
    setNewOrderItemId('');
    setNewOrderSupplierId('');
    setNewOrderQuantity('');
    setNewOrderPriority('High');
    setNewOrderExpectedDelivery('');
    try {
      console.log('Fetching items and suppliers...');
      const [items, suppliers] = await Promise.all([
        inventoryService.getAllItems(),
        supplierService.getAllSuppliers()
      ]);
      console.log('Fetched data:', { items, suppliers });
      setNewOrderItems(items || []);
      setNewOrderSuppliers(suppliers || []);
    } catch (err) {
      console.error('Error loading data for new order:', err);
      setNewOrderError('Failed to load inventory or suppliers: ' + err.message);
    }
  };

  const handlePlaceNewOrder = async () => {
    setNewOrderLoading(true);
    setNewOrderError(null);
    setNewOrderSuccess(false);
    try {
      if (!newOrderItemId) throw new Error('Select an inventory item');
      if (!newOrderSupplierId) throw new Error('Select a supplier');
      if (!newOrderQuantity || newOrderQuantity <= 0) throw new Error('Quantity must be greater than 0');
      if (!newOrderExpectedDelivery) throw new Error('Expected delivery date is required');
      const payload = {
        inventory_item_id: newOrderItemId,
        supplier_id: newOrderSupplierId,
        quantity: Number(newOrderQuantity),
        order_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        priority: newOrderPriority,
        expected_delivery: newOrderExpectedDelivery
      };
      await orderService.createOrder(payload);
      setNewOrderSuccess(true);
      setTimeout(() => {
        setShowNewOrderModal(false);
        setNewOrderSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      setNewOrderError(err.message || 'Failed to place order');
    } finally {
      setNewOrderLoading(false);
    }
  };

  // Export handler
  const handleExportCSV = () => {
    try {
      console.log('Exporting CSV...', { analytics, lowStockItems });
      
      // Export analytics summary and low stock items
      const analyticsRows = [
        { label: 'Total Items', value: analytics.total_items || 0 },
        { label: 'Low Stock Alerts', value: analytics.low_stock_count || 0 },
        { label: 'Categories', value: analytics.categories_count || 0 }
      ];
      
      let csv = 'Inventory Dashboard Analytics\r\n';
      csv += analyticsRows.map(r => `${r.label},${r.value}`).join('\r\n');
      csv += '\r\n\r\nLow Stock Items\r\n';
      
      const columns = [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'threshold', label: 'Threshold' },
        { key: 'status', label: 'Status' }
      ];
      
      csv += arrayToCSV(lowStockItems || [], columns);
      downloadCSV(csv, 'inventory_dashboard_export.csv');
      
      console.log('CSV export completed');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV: ' + error.message);
    }
  };

  // PDF Export handler
  const handleExportPDF = () => {
    try {
      console.log('Exporting PDF...', { analytics, lowStockItems });
      
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Inventory Dashboard Analytics', 14, 18);
      doc.setFontSize(12);
      
      const analyticsRows = [
        ['Total Items', analytics.total_items || 0],
        ['Low Stock Alerts', analytics.low_stock_count || 0],
        ['Categories', analytics.categories_count || 0]
      ];
      
      doc.autoTable({
        startY: 24,
        head: [['Metric', 'Value']],
        body: analyticsRows,
        theme: 'grid',
        styles: { fontSize: 11 }
      });
      
      let y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Low Stock Items', 14, y);
      y += 4;
      
      const columns = [
        { header: 'Item Name', dataKey: 'name' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Threshold', dataKey: 'threshold' },
        { header: 'Status', dataKey: 'status' }
      ];
      
      doc.autoTable({
        startY: y + 4,
        columns,
        body: lowStockItems || [],
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      doc.save('inventory_dashboard_export.pdf');
      console.log('PDF export completed');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">Inventory Dashboard</h2>
            <div>
              <div className="btn-group me-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-download me-2"></i>Export
                </button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item" onClick={handleExportCSV}>Export as CSV</button></li>
                  <li><button className="dropdown-item" onClick={handleExportPDF}>Export as PDF</button></li>
                </ul>
              </div>
              <button className="btn rounded-pill" style={{ backgroundColor: '#E31937', color: 'white' }} onClick={handleOpenNewOrder}>
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
                  <h3 className="mb-0 fw-bold">{analytics.total_items || 0}</h3>
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
                  <h3 className="mb-0 fw-bold">{analytics.low_stock_count || 0}</h3>
                  <p className="text-danger mb-0 small mt-2">
                    <i className="bi bi-arrow-up me-1"></i>{lowStockItems.length} items need attention
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
                    <i className="bi bi-clock me-1"></i>{pendingOrders.filter(o => o.priority === 'High').length} high priority
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
                  <h3 className="mb-0 fw-bold">{analytics.categories_count || 0}</h3>
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
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map(item => (
                        <tr key={item.id}>
                          <td className="ps-4 fw-medium">{item.name}</td>
                          <td>
                            <span className="badge rounded-pill bg-light text-dark border">
                              {item.category || 'Uncategorized'}
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="py-3">
                            <i className="bi bi-check-circle text-success fs-1"></i>
                            <h6 className="mt-2">No low stock alerts</h6>
                            <p className="text-muted small">All items are well stocked!</p>
                          </div>
                        </td>
                      </tr>
                    )}
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
              {pendingOrders.length > 0 ? (
                pendingOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">{order.inventory_item?.name || 'Unknown Item'}</h6>
                        <span className={`badge rounded-pill ${
                          order.priority === 'High' ? 'bg-danger' : 
                          order.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-info'
                        }`}>
                          {order.priority}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">
                          <i className="bi bi-calendar me-1"></i> {new Date(order.order_date).toLocaleDateString()}
                        </span>
                        <span className="fw-medium small">
                          <i className="bi bi-box me-1"></i> {order.quantity} units
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted small mt-2">No pending orders</p>
                </div>
              )}
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
                  <button type="button" className={`btn btn-sm btn-outline-secondary${trendsPeriod === 'monthly' ? ' active' : ''}`} onClick={() => setTrendsPeriod('monthly')}>Monthly</button>
                  <button type="button" className={`btn btn-sm btn-outline-secondary${trendsPeriod === 'quarterly' ? ' active' : ''}`} onClick={() => setTrendsPeriod('quarterly')}>Quarterly</button>
                  <button type="button" className={`btn btn-sm btn-outline-secondary${trendsPeriod === 'yearly' ? ' active' : ''}`} onClick={() => setTrendsPeriod('yearly')}>Yearly</button>
                </div>
              </div>
            </div>
            <div className="card-body px-2">
              <div style={{ height: '350px' }}>
                {trendsLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : trendsError ? (
                  <div className="alert alert-danger my-4">{trendsError}</div>
                ) : (
                  <Line data={usageTrendsData} options={chartOptions} />
                )}
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
                {orderError && <div className="alert alert-danger py-2">{orderError}</div>}
                {orderSuccess && <div className="alert alert-success py-2">Order placed successfully!</div>}
                <form onSubmit={e => { e.preventDefault(); handlePlaceOrder(); }}>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Order Quantity</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-box"></i></span>
                      <input type="number" className="form-control border-0 shadow-sm py-2" min="1"
                        value={orderQuantity}
                        onChange={e => setOrderQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-text">
                      Minimum recommended: {selectedItem?.threshold}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Priority</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-flag"></i></span>
                      <select className="form-select border-0 shadow-sm py-2"
                        value={orderPriority}
                        onChange={e => setOrderPriority(e.target.value)}
                        required
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Expected Delivery Date</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><i className="bi bi-calendar"></i></span>
                      <input type="date" className="form-control border-0 shadow-sm py-2"
                        min={new Date().toISOString().split('T')[0]}
                        value={orderExpectedDelivery}
                        onChange={e => setOrderExpectedDelivery(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowOrderModal(false)} disabled={orderLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn rounded-pill px-4" style={{ backgroundColor: '#E31937', color: 'white' }} disabled={orderLoading}>
                      {orderLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check2 me-1"></i>}
                      Place Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Place New Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewOrderModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {newOrderError && <div className="alert alert-danger py-2">{newOrderError}</div>}
                {newOrderSuccess && <div className="alert alert-success py-2">Order placed successfully!</div>}
                <form onSubmit={e => { e.preventDefault(); handlePlaceNewOrder(); }}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Inventory Item</label>
                    <select className="form-select" value={newOrderItemId} onChange={e => setNewOrderItemId(e.target.value)} required>
                      <option value="">Select item...</option>
                      {newOrderItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Supplier</label>
                    <select className="form-select" value={newOrderSupplierId} onChange={e => setNewOrderSupplierId(e.target.value)} required>
                      <option value="">Select supplier...</option>
                      {newOrderSuppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Quantity</label>
                    <input type="number" className="form-control" min="1" value={newOrderQuantity} onChange={e => setNewOrderQuantity(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Priority</label>
                    <select className="form-select" value={newOrderPriority} onChange={e => setNewOrderPriority(e.target.value)} required>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Expected Delivery Date</label>
                    <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} value={newOrderExpectedDelivery} onChange={e => setNewOrderExpectedDelivery(e.target.value)} required />
                  </div>
                  <div className="modal-footer border-0 px-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowNewOrderModal(false)} disabled={newOrderLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn rounded-pill px-4" style={{ backgroundColor: '#E31937', color: 'white' }} disabled={newOrderLoading}>
                      {newOrderLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check2 me-1"></i>}
                      Place Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagerDashboard;