import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { orderService } from '../services/orderService';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const GeneralInventoryReports = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [usageTrends, setUsageTrends] = useState({ labels: [], data: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [invRes, orderRes, lowStockRes, trendsRes] = await Promise.all([
          inventoryService.getAnalytics(),
          orderService.getOrderAnalytics(),
          inventoryService.getLowStockItems(),
          inventoryService.getUsageTrends()
        ]);
        setInventoryAnalytics(invRes);
        setOrderAnalytics(orderRes);
        setLowStock(Array.isArray(lowStockRes) ? lowStockRes : []);
        setUsageTrends(trendsRes || { labels: [], data: [] });
      } catch (err) {
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Only allow InventoryManager and Admin
  if (!currentUser || !['InventoryManager', 'Admin'].includes(currentUser.role)) {
    return <Navigate to="/login" />;
  }

  if (loading) return (
    <div className="container-fluid py-4 bg-light">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading reports...</p>
        </div>
      </div>
    </div>
  );
  if (error) return (
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

  // Chart data and options
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

  // Export handlers
  const handleExportCSV = () => {
    try {
      // Export analytics summary, low stock items, recent activity, and recent orders
      const analyticsRows = [
        { label: 'Total Items', value: inventoryAnalytics?.total_items || 0 },
        { label: 'Low Stock Alerts', value: inventoryAnalytics?.low_stock_count || 0 },
        { label: 'Categories', value: inventoryAnalytics?.categories_count || 0 },
        { label: 'Total Orders', value: orderAnalytics?.total_orders || 0 },
        { label: 'Pending Orders', value: orderAnalytics?.pending_orders || 0 },
        { label: 'Approved Orders', value: orderAnalytics?.approved_orders || 0 },
        { label: 'Delivered Orders', value: orderAnalytics?.delivered_orders || 0 },
        { label: 'High Priority Orders', value: orderAnalytics?.high_priority || 0 },
        { label: 'Medium Priority Orders', value: orderAnalytics?.medium_priority || 0 },
        { label: 'Low Priority Orders', value: orderAnalytics?.low_priority || 0 }
      ];
      let csv = 'General Inventory Reports Analytics\r\n';
      csv += analyticsRows.map(r => `${r.label},${r.value}`).join('\r\n');
      csv += '\r\n\r\nLow Stock Items\r\n';
      const lowStockColumns = [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'threshold', label: 'Threshold' },
        { key: 'status', label: 'Status' },
        { key: 'supplier', label: 'Supplier' }
      ];
      csv += arrayToCSV(lowStock || [], lowStockColumns);
      csv += '\r\n\r\nRecent Inventory Activity\r\n';
      const activityColumns = [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'updated_at', label: 'Last Updated' }
      ];
      const activityRows = (inventoryAnalytics?.recent_activity || []).map(item => ({
        ...item,
        supplier: item.supplier?.name || item.supplier || 'N/A',
        updated_at: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
      }));
      csv += arrayToCSV(activityRows, activityColumns);
      csv += '\r\n\r\nRecent Orders\r\n';
      const orderColumns = [
        { key: 'id', label: 'Order ID' },
        { key: 'inventory_item', label: 'Item' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'order_date', label: 'Date' }
      ];
      const orderRows = (orderAnalytics?.recent_orders || []).map(order => ({
        id: order.id,
        inventory_item: order.inventory_item?.name || 'N/A',
        supplier: order.supplier?.name || 'N/A',
        quantity: order.quantity,
        status: order.status,
        priority: order.priority,
        order_date: order.order_date ? new Date(order.order_date).toLocaleDateString() : ''
      }));
      csv += arrayToCSV(orderRows, orderColumns);
      downloadCSV(csv, 'general_inventory_reports.csv');
    } catch (error) {
      alert('Failed to export CSV: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('General Inventory Reports Analytics', 14, 18);
      doc.setFontSize(12);
      const analyticsRows = [
        ['Total Items', inventoryAnalytics?.total_items || 0],
        ['Low Stock Alerts', inventoryAnalytics?.low_stock_count || 0],
        ['Categories', inventoryAnalytics?.categories_count || 0],
        ['Total Orders', orderAnalytics?.total_orders || 0],
        ['Pending Orders', orderAnalytics?.pending_orders || 0],
        ['Approved Orders', orderAnalytics?.approved_orders || 0],
        ['Delivered Orders', orderAnalytics?.delivered_orders || 0],
        ['High Priority Orders', orderAnalytics?.high_priority || 0],
        ['Medium Priority Orders', orderAnalytics?.medium_priority || 0],
        ['Low Priority Orders', orderAnalytics?.low_priority || 0]
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
      const lowStockColumns = [
        { header: 'Item Name', dataKey: 'name' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Threshold', dataKey: 'threshold' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Supplier', dataKey: 'supplier' }
      ];
      doc.autoTable({
        startY: y + 4,
        columns: lowStockColumns,
        body: lowStock || [],
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Recent Inventory Activity', 14, y);
      y += 4;
      const activityColumns = [
        { header: 'Item Name', dataKey: 'name' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Supplier', dataKey: 'supplier' },
        { header: 'Last Updated', dataKey: 'updated_at' }
      ];
      const activityRows = (inventoryAnalytics?.recent_activity || []).map(item => ({
        ...item,
        supplier: item.supplier?.name || item.supplier || 'N/A',
        updated_at: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
      }));
      doc.autoTable({
        startY: y + 4,
        columns: activityColumns,
        body: activityRows,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Recent Orders', 14, y);
      y += 4;
      const orderColumns = [
        { header: 'Order ID', dataKey: 'id' },
        { header: 'Item', dataKey: 'inventory_item' },
        { header: 'Supplier', dataKey: 'supplier' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Priority', dataKey: 'priority' },
        { header: 'Date', dataKey: 'order_date' }
      ];
      const orderRows = (orderAnalytics?.recent_orders || []).map(order => ({
        id: order.id,
        inventory_item: order.inventory_item?.name || 'N/A',
        supplier: order.supplier?.name || 'N/A',
        quantity: order.quantity,
        status: order.status,
        priority: order.priority,
        order_date: order.order_date ? new Date(order.order_date).toLocaleDateString() : ''
      }));
      doc.autoTable({
        startY: y + 4,
        columns: orderColumns,
        body: orderRows,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      doc.save('general_inventory_reports.pdf');
    } catch (error) {
      alert('Failed to export PDF: ' + error.message);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">General Inventory Reports</h2>
            <div className="btn-group">
              <button type="button" className="btn btn-outline-secondary rounded-pill dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-download me-2"></i>Export
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={handleExportCSV}>Export as CSV</button></li>
                <li><button className="dropdown-item" onClick={handleExportPDF}>Export as PDF</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Inventory Items</h6>
              <h3 className="mb-0">{inventoryAnalytics?.total_items ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Low Stock Items</h6>
              <h3 className="mb-0">{inventoryAnalytics?.low_stock_count ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Out of Stock</h6>
              <h3 className="mb-0">{inventoryAnalytics?.out_of_stock_count ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Categories</h6>
              <h3 className="mb-0">{inventoryAnalytics?.categories_count ?? '-'}</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.total_orders ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Pending Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.pending_orders ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Approved Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.approved_orders ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Delivered Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.delivered_orders ?? '-'}</h3>
            </div>
          </div>
        </div>
      </div>
      {/* Order Priority Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">High Priority Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.high_priority ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Medium Priority Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.medium_priority ?? '-'}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card rounded-lg shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-muted">Low Priority Orders</h6>
              <h3 className="mb-0">{orderAnalytics?.low_priority ?? '-'}</h3>
            </div>
          </div>
        </div>
      </div>
      {/* Usage Trends Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-body">
              <h5 className="card-title mb-4">Inventory Usage Trends</h5>
              <div style={{ height: '350px' }}>
                <Line data={usageTrendsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Low Stock Table */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-body">
              <h5 className="card-title mb-4">Low/Out of Stock Items</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Threshold</th>
                      <th>Status</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.length === 0 ? (
                      <tr><td colSpan="6" className="text-center">No low/out of stock items</td></tr>
                    ) : (
                      lowStock.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{item.threshold}</td>
                          <td>
                            <span className={`badge bg-${item.status === 'Critical' ? 'danger' : 'warning'}`}>{item.status}</span>
                          </td>
                          <td>{item.supplier}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity Table */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Inventory Activity</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Supplier</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryAnalytics?.recent_activity?.length === 0 ? (
                      <tr><td colSpan="5" className="text-center">No recent activity</td></tr>
                    ) : (
                      inventoryAnalytics?.recent_activity?.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{item.supplier?.name || item.supplier || 'N/A'}</td>
                          <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Orders Table */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-lg">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Orders</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Item</th>
                      <th>Supplier</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderAnalytics?.recent_orders?.length === 0 ? (
                      <tr><td colSpan="7" className="text-center">No recent orders</td></tr>
                    ) : (
                      orderAnalytics?.recent_orders?.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.inventory_item?.name || 'N/A'}</td>
                          <td>{order.supplier?.name || 'N/A'}</td>
                          <td>{order.quantity}</td>
                          <td><span className={`badge bg-${order.status === 'Pending' ? 'warning text-dark' : order.status === 'Approved' ? 'success' : order.status === 'Delivered' ? 'info' : 'secondary'}`}>{order.status}</span></td>
                          <td><span className={`badge bg-${order.priority === 'High' ? 'danger' : order.priority === 'Medium' ? 'warning' : 'info'}`}>{order.priority}</span></td>
                          <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInventoryReports;