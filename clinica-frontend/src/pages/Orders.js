import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { supplierService } from '../services/supplierService';
import { inventoryService } from '../services/inventoryService';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    inventory_item_id: '',
    quantity: '',
    order_date: '',
    status: 'Pending',
    priority: 'Medium',
    expected_delivery: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orderList, supplierList, itemList] = await Promise.all([
          orderService.getAllOrders(),
          supplierService.getAllSuppliers(),
          inventoryService.getAllItems()
        ]);
        setOrders(orderList);
        setSuppliers(supplierList);
        setInventoryItems(itemList);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CRUD Handlers
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const order = await orderService.createOrder({
        ...newOrder,
        quantity: parseInt(newOrder.quantity),
        order_date: newOrder.order_date || new Date().toISOString().split('T')[0]
      });
      setOrders([order, ...orders]);
      setShowOrderModal(false);
      setNewOrder({
        supplier_id: '', inventory_item_id: '', quantity: '', order_date: '', status: 'Pending', priority: 'Medium', expected_delivery: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleApproveOrder = async (id) => {
    try {
      setLoading(true);
      const updated = await orderService.approveOrder(id);
      setOrders(orders.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
    } catch (err) {
      setError(err.message || 'Failed to approve order');
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.inventory_item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id + '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Approved': return 'bg-success';
      case 'Delivered': return 'bg-info';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
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
            <p className="mt-3">Loading orders...</p>
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
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-0">Purchase Orders</h2>
              <p className="text-muted mb-0">Manage all purchase orders</p>
            </div>
            <button 
              className="btn rounded-pill"
              style={{ backgroundColor: '#E31937', color: 'white' }}
              onClick={() => { setShowOrderModal(true); setSelectedOrder(null); }}
            >
              <i className="bi bi-plus-lg me-2"></i>New Order
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg">
        <div className="card-header bg-white py-3 border-0">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}</td>
                    <td>{order.supplier?.name || 'N/A'}</td>
                    <td>{order.inventory_item?.name || 'N/A'}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill bg-${
                        order.priority === 'High' ? 'danger' :
                        order.priority === 'Medium' ? 'warning' : 'info'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewOrder(order)}
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                        {order.status === 'Pending' && (
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleApproveOrder(order.id)}>
                            <i className="bi bi-check2 me-1"></i>Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="py-5">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <h5 className="mt-3">No orders found</h5>
                        <p className="text-muted">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  {selectedOrder ? `Order Details - ${selectedOrder.id}` : 'New Purchase Order'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {selectedOrder ? (
                  <>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Supplier:</strong> {selectedOrder.supplier?.name || 'N/A'}</p>
                        <p className="mb-1"><strong>Date:</strong> {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : ''}</p>
                        <p className="mb-1">
                          <strong>Status:</strong> 
                          <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <p className="mb-1">
                          <strong>Priority:</strong>
                          <span className={`badge bg-${
                            selectedOrder.priority === 'High' ? 'danger' :
                            selectedOrder.priority === 'Medium' ? 'warning' : 'info'
                          } ms-2`}>
                            {selectedOrder.priority}
                          </span>
                        </p>
                        <p className="mb-1"><strong>Expected Delivery:</strong> {selectedOrder.expected_delivery ? new Date(selectedOrder.expected_delivery).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Item:</strong> {selectedOrder.inventory_item?.name || 'N/A'}</p>
                        <p className="mb-1"><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                        <p className="mb-1"><strong>Price per Unit:</strong> ₱{selectedOrder.inventory_item?.price || 'N/A'}</p>
                        <p className="mb-1"><strong>Total:</strong> ₱{selectedOrder.quantity && selectedOrder.inventory_item?.price ? (selectedOrder.quantity * selectedOrder.inventory_item.price).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleCreateOrder}>
                    <div className="mb-3">
                      <label className="form-label">Supplier</label>
                      <select className="form-select" required value={newOrder.supplier_id} onChange={e => setNewOrder({ ...newOrder, supplier_id: e.target.value })}>
                        <option value="">Select supplier</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Item</label>
                      <select className="form-select" required value={newOrder.inventory_item_id} onChange={e => setNewOrder({ ...newOrder, inventory_item_id: e.target.value })}>
                        <option value="">Select item</option>
                        {inventoryItems.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity</label>
                      <input type="number" className="form-control" required value={newOrder.quantity} onChange={e => setNewOrder({ ...newOrder, quantity: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Priority</label>
                      <select className="form-select" value={newOrder.priority} onChange={e => setNewOrder({ ...newOrder, priority: e.target.value })}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Expected Delivery</label>
                      <input type="date" className="form-control" value={newOrder.expected_delivery} onChange={e => setNewOrder({ ...newOrder, expected_delivery: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Order Date</label>
                      <input type="date" className="form-control" value={newOrder.order_date} onChange={e => setNewOrder({ ...newOrder, order_date: e.target.value })} />
                    </div>
                    <div className="text-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={() => setShowOrderModal(false)}>Cancel</button>
                      <button type="submit" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>Create Order</button>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Close
                </button>
                {selectedOrder && selectedOrder.status === 'Pending' && (
                  <button 
                    type="button" 
                    className="btn rounded-pill px-4"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                  >
                    Approve Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
